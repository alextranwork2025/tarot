import { ArrowRight } from "lucide-react";
import Image from "next/image";

import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";

export function ReaderProfile() {
  return (
    <section id="about" className="py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:grid-cols-[1fr_0.86fr] md:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Giới thiệu"
            title="Người giữ không gian"
            description="Cách đọc Tarot tại Huyền Cảnh tập trung vào biểu tượng, đối thoại và tự nhận thức. Người đọc giữ nhịp cho câu hỏi, còn ý nghĩa sâu nhất luôn được tìm thấy trong chính trải nghiệm của bạn."
          />
          <p className="mt-7 text-base leading-8 text-stone-mist md:text-lg">
            Mỗi phiên đọc được thiết kế như một nghi thức tĩnh lặng: đủ cấu trúc để bạn
            không lạc hướng, đủ rộng để trực giác có chỗ lên tiếng. Những lá bài trở
            thành điểm tựa cho việc nhìn lại, lựa chọn và bước tiếp.
          </p>
          <a className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-full border border-antique-gold/70 px-6 text-sm font-semibold uppercase tracking-[0.15em] text-antique-gold transition hover:bg-antique-gold hover:text-obsidian focus:outline-none focus:ring-2 focus:ring-antique-gold" href="#final-cta">
            Tìm hiểu thêm
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="relative mx-auto aspect-[3/4] w-full max-w-[420px] overflow-hidden rounded-t-full border border-gilded/50 bg-card-deep">
            <Image
              src="/images/reader-portrait.svg"
              alt="Chân dung nghệ thuật trừu tượng của người đọc Tarot."
              fill
              className="object-cover"
              sizes="(min-width: 768px) 36vw, 90vw"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
