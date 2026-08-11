import { Reveal } from "@/components/animation/reveal";
import {
  CITY_SIDES,
  CITY_SIDE_LABELS,
  SERVED_DISTRICTS,
} from "@/lib/constants";

/**
 * Hizmet verilen ilçelerin yakalara ayrılmış listesi.
 *
 * Bölge REHBERLERİNDEN (`RegionGrid`) bilinçli olarak ayrı duruyor ve tıklanabilir
 * değil. Sebebi: rehber, Emirhan'ın o ilçe hakkındaki kendi saha yorumunu taşır;
 * kapsam listesi ise yalnızca "burada iş yapıyorum" demektir. İkisini tek bir
 * ızgarada birleştirmek, yorumu yazılmamış 39 ilçe için de uzmanlık iddiası
 * varmış izlenimi verirdi. Bir ilçenin rehberi yazıldığında `Region` kaydı
 * açılır ve yukarıdaki ızgarada kendiliğinden görünür.
 */
export function ServedDistricts({
  /** Rehberi olan ilçeler — listede vurgulanır */
  highlighted = [],
}: {
  highlighted?: readonly string[];
}) {
  return (
    <div className="grid gap-10 sm:grid-cols-2 sm:gap-12">
      {CITY_SIDES.map((side, index) => (
        <Reveal key={side} delay={index * 0.08}>
          <div>
            <div className="flex items-baseline justify-between gap-4 border-b border-ink-700 pb-3">
              <h3 className="font-display text-2xl text-cream-100">
                {CITY_SIDE_LABELS[side]}
              </h3>
              <span className="text-xs uppercase tracking-[0.18em] text-cream-400">
                {SERVED_DISTRICTS[side].length} ilçe
              </span>
            </div>

            <ul className="mt-5 flex flex-wrap gap-2">
              {SERVED_DISTRICTS[side].map((district) => {
                const hasGuide = highlighted.includes(district);
                return (
                  <li
                    key={district}
                    className={
                      hasGuide
                        ? "rounded-full border border-brand-500/40 bg-brand-500/10 px-3 py-1.5 text-sm text-cream-100"
                        : "rounded-full border border-ink-700 px-3 py-1.5 text-sm text-cream-300"
                    }
                  >
                    {district}
                    {hasGuide ? (
                      <span className="ml-1.5 text-[10px] uppercase tracking-wider text-brand-400">
                        rehber
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
