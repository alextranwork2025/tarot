import { Flame, Gem, Landmark, Swords, Waves } from "lucide-react";

import { Reveal } from "@/components/Reveal";
import { SacredGeometry } from "@/components/SacredGeometry";
import { SectionHeading } from "@/components/SectionHeading";
import { symbols } from "@/data/symbols";

const iconMap = {
  major: Landmark,
  wands: Flame,
  cups: Waves,
  swords: Swords,
  pentacles: Gem,
};

export function SymbolLibrary() {
  return (
    <section id="library" className="relative overflow-hidden py-24 md:py-32">
      <SacredGeometry variant="moon" className="absolute -right-16 top-10 h-72 w-72 text-antique-gold/10" />
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Thư viện biểu tượng"
            title="Những ngôn ngữ của bộ bài"
            description="Từ Ẩn chính tới bốn bộ nhỏ, mỗi nhóm biểu tượng mở ra một địa hạt khác nhau của trải nghiệm con người."
          />
        </Reveal>
        <div className="mt-14 grid gap-5 lg:grid-cols-4">
          {symbols.map((symbol, index) => {
            const Icon = iconMap[symbol.kind];
            const featured = symbol.kind === "major";
            return (
              <Reveal
                key={symbol.name}
                delay={index * 0.06}
                className={featured ? "lg:col-span-2 lg:row-span-2" : ""}
              >
                <article className={`group h-full rounded-lg border border-gilded/40 bg-card-deep/74 p-6 transition hover:border-fox-red/85 hover:bg-card-muted ${featured ? "min-h-[360px] p-8" : "min-h-[220px]"}`}>
                  <div className="flex items-start justify-between gap-5">
                    <div className="grid size-13 place-items-center rounded-full border border-gilded/55 text-antique-gold">
                      <Icon size={featured ? 30 : 24} strokeWidth={1.3} aria-hidden="true" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-mist">
                      {symbol.count}
                    </span>
                  </div>
                  <h3 className={`mt-8 font-serif font-semibold text-ivory ${featured ? "text-4xl" : "text-3xl"}`}>
                    {symbol.name}
                  </h3>
                  <p className="mt-4 text-base leading-8 text-stone-mist">{symbol.description}</p>
                  {featured ? (
                    <SacredGeometry variant="sun" className="mt-10 h-40 w-40 text-antique-gold/35" />
                  ) : null}
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
