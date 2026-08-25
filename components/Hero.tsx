import { ArrowRight, BookOpen } from "lucide-react";

import { MysticalCard } from "@/components/MysticalCard";
import { Reveal } from "@/components/Reveal";

export function Hero() {
  return (
    <section id="home" className="relative min-h-[94svh] overflow-hidden pt-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_34%,rgba(184,146,79,0.2),transparent_25%),radial-gradient(circle_at_20%_18%,rgba(113,31,48,0.24),transparent_34%),linear-gradient(180deg,rgba(9,11,16,0.5),#090B10_90%)]" />
      <div className="absolute inset-0 sacred-grain" />
      <div className="relative mx-auto grid min-h-[calc(94svh-7rem)] max-w-7xl items-center gap-14 px-5 pb-16 md:grid-cols-[1.05fr_0.95fr] md:px-8">
        <Reveal>
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-antique-gold">
              TAROT · BIỂU TƯỢNG · NỘI TÂM
            </p>
            <h1 className="mt-6 max-w-4xl font-serif text-5xl font-semibold leading-[1.05] text-ivory md:text-7xl">
              Lắng nghe điều ẩn sâu bên trong
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-mist md:text-xl md:leading-9">
              Mỗi lá bài là một tấm gương. Điều bạn nhìn thấy không phải định mệnh,
              mà là một phần đang chờ được thấu hiểu.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-antique-gold px-6 text-sm font-semibold uppercase tracking-[0.15em] text-obsidian transition hover:bg-ivory focus:outline-none focus:ring-2 focus:ring-ivory" href="#readings">
                Bắt đầu hành trình
                <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-gilded/70 px-6 text-sm font-semibold uppercase tracking-[0.15em] text-ivory transition hover:border-antique-gold hover:text-antique-gold focus:outline-none focus:ring-2 focus:ring-antique-gold" href="#library">
                <BookOpen size={18} aria-hidden="true" />
                Khám phá thư viện
              </a>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.15} className="w-full">
          <MysticalCard>
            <p>Biểu tượng không trả lời thay bạn. Nó mở một khoảng im lặng để bạn tự nghe rõ mình hơn.</p>
          </MysticalCard>
        </Reveal>
      </div>
    </section>
  );
}
