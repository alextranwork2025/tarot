import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { readings } from "@/data/readings";

export function ReadingTypes() {
  return (
    <section id="readings" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Trải bài"
            title="Ba nhịp mở lá"
            description="Chọn một hình thức đủ gần với câu hỏi hiện tại. Mỗi trải bài là một không gian quan sát, không phải lời phán quyết."
          />
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {readings.map((reading, index) => {
            const Icon = reading.icon;
            return (
              <Reveal key={reading.title} delay={index * 0.08}>
                <article className="group flex min-h-[430px] flex-col rounded-lg border border-gilded/45 bg-card-deep/82 p-7 transition duration-500 hover:-translate-y-2 hover:border-antique-gold/90 hover:shadow-2xl hover:shadow-antique-gold/10">
                  <div className="grid size-14 place-items-center rounded-full border border-gilded/60 text-antique-gold transition group-hover:bg-antique-gold group-hover:text-obsidian">
                    <Icon size={25} strokeWidth={1.35} aria-hidden="true" />
                  </div>
                  <p className="mt-10 text-sm font-semibold uppercase tracking-[0.18em] text-antique-gold">
                    {reading.spread}
                  </p>
                  <h3 className="mt-4 font-serif text-3xl font-semibold leading-tight text-ivory">
                    {reading.title}
                  </h3>
                  <p className="mt-5 flex-1 text-base leading-8 text-stone-mist">
                    {reading.description}
                  </p>
                  <a className="mt-8 inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-gilded/60 px-5 text-sm font-semibold text-ivory transition hover:border-antique-gold hover:text-antique-gold focus:outline-none focus:ring-2 focus:ring-antique-gold" href="#final-cta">
                    Khám phá
                    <ArrowRight size={17} aria-hidden="true" />
                  </a>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
