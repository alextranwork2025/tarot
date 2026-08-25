import Image from "next/image";

import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";

export function Introduction() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:grid-cols-[0.9fr_1.1fr] md:px-8">
        <Reveal>
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-full border border-gilded/50 bg-card-deep">
            <Image
              src="/images/abstract-gate.svg"
              alt="Minh họa cánh cửa trừu tượng với mặt trăng và các vòng tròn thiêng."
              fill
              className="object-cover"
              sizes="(min-width: 768px) 42vw, 90vw"
            />
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <SectionHeading
            eyebrow="Tự phản chiếu"
            title="Cánh cửa dẫn vào nội tâm"
            description="Tarot trong Huyền Cảnh được xem như một ngôn ngữ biểu tượng: một cách đặt câu hỏi, quan sát cảm xúc và nhận diện những khuôn mẫu đang dẫn dắt lựa chọn của ta."
          />
          <div className="mt-8 space-y-6 text-base leading-8 text-stone-mist md:text-lg">
            <p>
              Mỗi trải bài không khẳng định tương lai sẽ diễn ra chính xác như thế nào.
              Nó giúp bạn nhìn lại điều đang có mặt, gọi tên phần còn mơ hồ và bước
              vào đối thoại với chính mình bằng sự dịu dàng tỉnh thức.
            </p>
            <blockquote className="border-l border-antique-gold pl-6 font-serif text-2xl leading-10 text-ivory">
              “Điều linh thiêng đôi khi chỉ là khoảnh khắc ta thôi chạy trốn câu hỏi thật.”
            </blockquote>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
