/**
 * Arama asistanının dil çözümleyicisi için doğrulama koşusu.
 *
 *   npx tsx scripts/test-search-assistant.mts
 *
 * Asistan anahtarsız ve kural tabanlı olduğu için davranışı tamamen
 * belirlenimci: aynı cümle her zaman aynı filtreyi üretir. Bu da onu normal bir
 * fonksiyon gibi test edilebilir kılıyor. Beklenti tablosu, sahada gerçekten
 * yazılabilecek cümlelerden oluşuyor.
 */

import { parseQuery } from "../lib/search-assistant";

type Expectation = {
  query: string;
  expect: Record<string, unknown>;
  /** Bu kelimelerin "anlaşılmadı" listesine DÜŞMEMESİ gerekir */
  shouldNotLeftover?: string[];
};

const CASES: Expectation[] = [
  {
    query: "Çekmeköy'de 3+1 kiralık daire",
    expect: {
      listingType: "RENT",
      category: "APARTMENT",
      rooms: "3+1",
      district: "Çekmeköy",
    },
  },
  {
    query: "kadıköyde 5 milyona kadar satılık 2+1",
    expect: {
      listingType: "SALE",
      rooms: "2+1",
      district: "Kadıköy",
      maxPrice: 5_000_000,
    },
  },
  {
    query: "Beşiktaş'ta ofis arıyorum",
    expect: { category: "OFFICE", district: "Beşiktaş" },
  },
  {
    query: "2 ile 4 milyon arası satılık daire",
    expect: {
      listingType: "SALE",
      category: "APARTMENT",
      minPrice: 2_000_000,
      maxPrice: 4_000_000,
    },
  },
  {
    query: "en az 3 milyon üzeri villa",
    expect: { category: "VILLA", minPrice: 3_000_000 },
  },
  {
    query: "Sancaktepe 120 m2 üstü daire",
    expect: { district: "Sancaktepe", category: "APARTMENT", minArea: 120 },
  },
  {
    query: "stüdyo kiralık",
    expect: { listingType: "RENT", rooms: "1+0" },
  },
  {
    query: "dükkan satılık ümraniye",
    expect: { listingType: "SALE", category: "SHOP", district: "Ümraniye" },
  },
  {
    // Küçükçekmece, Çekmeköy'e yenilmemeli (en uzun eşleşme kazanır)
    query: "küçükçekmece kiralık",
    expect: { district: "Küçükçekmece", listingType: "RENT" },
  },
  {
    query: "500 bin altında arsa",
    expect: { category: "LAND", maxPrice: 500_000 },
  },
  {
    query: "merhaba bana bir ev lazım",
    expect: { category: "APARTMENT" },
    shouldNotLeftover: ["merhaba", "bana", "bir", "lazim"],
  },
];

let passed = 0;
let failed = 0;

for (const testCase of CASES) {
  const result = parseQuery(testCase.query);
  const problems: string[] = [];

  for (const [key, want] of Object.entries(testCase.expect)) {
    const got = (result.filters as Record<string, unknown>)[key];
    if (got !== want) {
      problems.push(`  ${key}: beklenen ${JSON.stringify(want)}, gelen ${JSON.stringify(got)}`);
    }
  }

  for (const word of testCase.shouldNotLeftover ?? []) {
    if (result.leftover.includes(word)) {
      problems.push(`  "${word}" anlaşılmayanlar listesine düşmemeliydi`);
    }
  }

  if (problems.length === 0) {
    passed += 1;
    console.log(`✓ ${testCase.query}`);
    console.log(`    anladı: ${result.understood.join(", ") || "—"}`);
    if (result.leftover.length > 0) {
      console.log(`    çözemedi: ${result.leftover.join(", ")}`);
    }
  } else {
    failed += 1;
    console.log(`✗ ${testCase.query}`);
    problems.forEach((problem) => console.log(problem));
    console.log(`    tam sonuç: ${JSON.stringify(result)}`);
  }
}

console.log(`\n${passed} geçti, ${failed} kaldı.`);
process.exit(failed > 0 ? 1 : 0);
