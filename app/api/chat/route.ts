import { GoogleGenAI, type Content, type Part } from "@google/genai";
import { NextResponse, type NextRequest } from "next/server";

import { answerWithRules } from "@/lib/chat/rule-based";
import { CHAT_TOOLS, buildSystemPrompt, runChatTool } from "@/lib/chat/tools";
import { getProfile } from "@/lib/queries";

/**
 * Sohbet asistanı uç noktası — Google Gemini (ücretsiz katman).
 *
 * Yanıt akış hâlinde dönüyor: kullanıcı ilk kelimeyi beklemeden görüyor.
 * Fonksiyon çağrıları sunucuda çalışıp döngüye geri besleniyor; istemciye
 * yalnızca metin gidiyor.
 *
 * ÜCRETSİZ KATMAN UYARISI: Google, ücretsiz katmanda gönderilen içeriği
 * ürünlerini geliştirmek için kullanabiliyor. Yani ziyaretçinin yazdığı her
 * cümle Google'a gidiyor ve orada kalabiliyor. Bu, KVKK aydınlatma metninde
 * belirtilmesi gereken bir aktarım — /kvkk sayfasındaki "Verilerin
 * Aktarılması" başlığı buna göre güncellendi. Ücretli katmana geçilirse bu
 * madde kalkar.
 */

/** Ücretsiz katmanda sunulan modeller arasından. Gerekirse .env ile değiştirilir. */
const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite";

/** Fonksiyon → yanıt → fonksiyon döngüsünün üst sınırı. Sonsuz döngüye karşı. */
const MAX_TOOL_ROUNDS = 5;

const MAX_MESSAGE_CHARS = 1000;
const MAX_HISTORY = 20;

/**
 * Basit hız sınırlayıcı.
 *
 * Ücretsiz katmanın günlük kotası var; kota dolduğunda bot herkese susuyor.
 * Tek bir ziyaretçinin (ya da botun) kotayı tüketmesini engellemek, ücretli
 * katmandaki fatura koruması kadar önemli.
 *
 * Bellekte tutuluyor: tek sunucu örneğinde yeterli, çok örneğe ölçeklenirse
 * Redis'e taşınmalı.
 */
const RATE_LIMIT = { windowMs: 60_000, maxRequests: 10 };
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter(
    (time) => now - time < RATE_LIMIT.windowMs,
  );

  if (recent.length >= RATE_LIMIT.maxRequests) {
    hits.set(key, recent);
    return true;
  }

  recent.push(now);
  hits.set(key, recent);

  if (hits.size > 5000) {
    for (const [existing, times] of hits) {
      if (times.every((time) => now - time > RATE_LIMIT.windowMs)) {
        hits.delete(existing);
      }
    }
  }

  return false;
}

type ClientMessage = { role: "user" | "assistant"; content: string };

/** Kural tabanlı yanıtı tek parça hâlinde akışa yazar. */
function ruleBasedStream(question: string): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const { text } = await answerWithRules(question);
        controller.enqueue(encoder.encode(text));
      } catch (error) {
        console.error("[chat] kural motoru hatası:", error);
        controller.enqueue(
          encoder.encode(
            "Üzgünüm, bir aksaklık oldu. Doğrudan iletişim için: /iletisim",
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "bilinmeyen";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Çok fazla mesaj gönderdiniz. Bir dakika sonra tekrar deneyin." },
      { status: 429 },
    );
  }

  let body: { messages?: ClientMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const incoming = Array.isArray(body.messages) ? body.messages : [];
  if (incoming.length === 0) {
    return NextResponse.json({ error: "Mesaj yok." }, { status: 400 });
  }

  // Gemini'de yanıt veren tarafın rolü "model" (Anthropic'teki "assistant" değil)
  const contents: Content[] = incoming
    .slice(-MAX_HISTORY)
    .filter(
      (message) =>
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string" &&
        message.content.trim().length > 0,
    )
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content.slice(0, MAX_MESSAGE_CHARS) }],
    }));

  if (contents.length === 0 || contents[0].role !== "user") {
    return NextResponse.json({ error: "Geçersiz mesaj dizisi." }, { status: 400 });
  }

  const lastQuestion = incoming[incoming.length - 1]?.content ?? "";

  // Anahtar yoksa asistan susmuyor, kural tabanlı motorla çalışıyor
  if (!process.env.GEMINI_API_KEY) {
    return ruleBasedStream(lastQuestion);
  }

  const profile = await getProfile();
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (text: string) => controller.enqueue(encoder.encode(text));

      try {
        for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
          const response = await ai.models.generateContentStream({
            model: MODEL,
            contents,
            config: {
              systemInstruction: buildSystemPrompt(profile),
              tools: [{ functionDeclarations: CHAT_TOOLS }],
            },
          });

          /**
           * Metin geldikçe yollanıyor; fonksiyon çağrıları ise biriktirilip
           * akış bitince topluca işleniyor — bir turda birden fazla çağrı
           * gelebiliyor ve hepsinin yanıtı tek mesajda dönmeli.
           *
           * Modelin ürettiği parçalar OLDUĞU GİBİ toplanıyor, yeniden
           * kurulmuyor. Gemini 3.x parçalara `thoughtSignature` iliştiriyor;
           * metni ve fonksiyon çağrısını ayıklayıp kendi elimizle yeni bir
           * parça dizisi yazarsak o imza düşer ve model sonraki turda kendi
           * akıl yürütmesini kaybeder. Geçmişe ne geldiyse o yazılmalı.
           */
          const modelParts: Part[] = [];
          const calls: Array<{ name: string; args: Record<string, unknown> }> =
            [];

          for await (const chunk of response) {
            if (chunk.text) send(chunk.text);

            for (const part of chunk.candidates?.[0]?.content?.parts ?? []) {
              modelParts.push(part);
              if (part.functionCall?.name) {
                calls.push({
                  name: part.functionCall.name,
                  args: part.functionCall.args ?? {},
                });
              }
            }
          }

          if (calls.length === 0) break;

          contents.push({ role: "model", parts: modelParts });

          // Bir turdaki tüm çağrıların yanıtı TEK mesajda dönmeli
          const responseParts: Part[] = [];
          for (const call of calls) {
            const { result } = await runChatTool(call.name, call.args);
            responseParts.push({
              functionResponse: {
                name: call.name,
                response: result as Record<string, unknown>,
              },
            });
          }
          contents.push({ role: "user", parts: responseParts });
        }
      } catch (error) {
        console.error("[chat] Gemini hatası, kural motoruna düşülüyor:", error);

        /**
         * Gemini erişilemediğinde asistan SUSMUYOR, kural tabanlı motora
         * düşüyor. Ücretsiz katmanın günlük kotası var ve dolduğunda tüm
         * ziyaretçilere birden kapanırdı; en çok trafik aldığın gün botun
         * ölmesi, hiç bot olmamasından kötü. Yedek motor anahtar da servis de
         * gerektirmediği için her koşulda ayakta.
         *
         * Not: hata akış başladıktan sonra geldiyse kullanıcı yarım bir cümle
         * görmüş olabilir; ayırıcı satır o yüzden konuyor.
         */
        try {
          const { text } = await answerWithRules(lastQuestion);
          send(`\n\n${text}`);
        } catch (fallbackError) {
          console.error("[chat] yedek motor da başarısız:", fallbackError);
          send(
            "\n\nÜzgünüm, bir aksaklık oldu. Doğrudan iletişim için: /iletisim",
          );
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
