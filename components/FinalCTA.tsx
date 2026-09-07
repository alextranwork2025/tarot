import { Sparkles } from "lucide-react";

import { Reveal } from "@/components/Reveal";

export function FinalCTA() {
  return (
    <section id="final-cta" className="px-5 py-24 md:px-8 md:py-32">
      <Reveal>
        <div className="fox-highlight mx-auto max-w-5xl overflow-hidden rounded-lg border border-antique-gold/55 px-6 py-14 text-center md:px-16">
          <Sparkles className="mx-auto text-antique-gold" size={32} strokeWidth={1.3} aria-hidden="true" />
          <h2 className="mt-6 font-serif text-4xl font-semibold leading-tight text-ivory md:text-6xl">
            Bạn đã sẵn sàng gặp chính mình?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-stone-mist md:text-lg">
            Bắt đầu bằng một câu hỏi thật. Phần còn lại là khoảng lặng nơi biểu tượng
            soi sáng điều bạn đã biết nhưng chưa gọi tên.
          </p>
          <a className="mt-9 inline-flex min-h-12 items-center justify-center rounded-full bg-antique-gold px-7 text-sm font-semibold uppercase tracking-[0.15em] text-obsidian transition hover:bg-ivory focus:outline-none focus:ring-2 focus:ring-ivory" href="#readings">
            Rút lá bài đầu tiên
          </a>
        </div>
      </Reveal>
    </section>
  );
}
