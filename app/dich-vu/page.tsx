import type { Metadata } from "next";
import Image from "next/image";
import {
  CalendarDays,
  Check,
  CircleHelp,
  Compass,
  Eye,
  HeartHandshake,
  LockKeyhole,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { BookingForm } from "@/components/booking/BookingForm";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ServiceFaq } from "@/components/services/ServiceFaq";
import { getCustomerAccess } from "@/lib/auth/customer";
import { getActiveServices } from "@/lib/queries/services";
import { serviceReviewSamples } from "@/data/service-reviews";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://huyen-canh.local";
const title = "Dịch vụ trải bài Tarot | Huyền Cảnh";
const description = "Khám phá các dịch vụ trải bài Tarot tại Huyền Cảnh, lựa chọn hình thức phù hợp và đặt lịch để lắng nghe những thông điệp dành cho bạn.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${baseUrl}/dich-vu` },
  openGraph: { title, description, url: `${baseUrl}/dich-vu`, type: "website", images: [{ url: `${baseUrl}/images/abstract-gate.svg`, alt: "Không gian trải bài Tarot tại Huyền Cảnh" }] },
  twitter: { card: "summary_large_image", title, description, images: [`${baseUrl}/images/abstract-gate.svg`] },
};

const sessionFeatures = [
  "Không gian trao đổi riêng tư",
  "Lắng nghe câu chuyện không phán xét",
  "Giải thích thông điệp rõ ràng, dễ hiểu",
  "Tập trung vào vấn đề khách hàng quan tâm",
  "Đưa ra góc nhìn và gợi ý thực tế",
  "Bảo mật nội dung buổi trải bài",
];

const moments = [
  { icon: Compass, text: "Bạn đang đứng trước một lựa chọn nhưng chưa biết nên bắt đầu từ đâu." },
  { icon: CircleHelp, text: "Bạn cảm thấy mất phương hướng trong công việc hoặc cuộc sống." },
  { icon: HeartHandshake, text: "Bạn muốn hiểu rõ hơn về cảm xúc và mối quan hệ hiện tại." },
  { icon: Sparkles, text: "Bạn đang lặp lại một vấn đề nhưng chưa nhận ra nguyên nhân." },
  { icon: Eye, text: "Bạn cần một góc nhìn khác để đánh giá tình huống." },
  { icon: MessageCircleMore, text: "Bạn muốn dành thời gian lắng nghe và kết nối với chính mình." },
];

const reasons = [
  ["Lắng nghe không phán xét", "Mỗi câu chuyện đều được đón nhận bằng sự tôn trọng."],
  ["Thông điệp dễ hiểu", "Nội dung trải bài được diễn giải rõ ràng, không tạo cảm giác mơ hồ hoặc sợ hãi."],
  ["Tập trung vào người xem", "Buổi trải bài đi theo câu hỏi và hoàn cảnh thực tế của từng khách hàng."],
  ["Tôn trọng quyền lựa chọn", "Tarot đưa ra góc nhìn, quyết định cuối cùng vẫn thuộc về bạn."],
  ["Bảo mật riêng tư", "Thông tin và nội dung trao đổi của khách hàng được giữ kín."],
  ["Đồng hành sau trải bài", "Bạn nhận được phần tổng kết hoặc gợi ý cần ghi nhớ nếu gói dịch vụ có hỗ trợ."],
] as const;

const processSteps = [
  ["Chọn dịch vụ", "Chọn gói trải bài phù hợp với vấn đề bạn đang quan tâm."],
  ["Chọn lịch hẹn", "Chọn ngày, giờ và hình thức xem bài thuận tiện."],
  ["Xác nhận lịch", "Huyền Cảnh tiếp nhận thông tin và liên hệ xác nhận với bạn."],
  ["Tham gia buổi trải bài", "Chuẩn bị câu hỏi và tham gia đúng thời gian đã xác nhận."],
] as const;

const faqItems = [
  { question: "Tôi cần chuẩn bị gì trước khi xem Tarot?", answer: "Hãy xác định vấn đề bạn đang quan tâm và chuẩn bị một vài câu hỏi cụ thể. Bạn không cần cung cấp những thông tin khiến mình cảm thấy không thoải mái." },
  { question: "Tôi nên đặt bao nhiêu câu hỏi?", answer: "Số lượng câu hỏi phụ thuộc vào thời lượng và gói dịch vụ. Bạn nên ưu tiên những câu hỏi quan trọng nhất." },
  { question: "Một buổi trải bài kéo dài bao lâu?", answer: "Thời lượng được hiển thị cụ thể trong từng dịch vụ và có thể thay đổi tùy theo nội dung trao đổi." },
  { question: "Tôi có thể xem bài online không?", answer: "Có. Bạn có thể lựa chọn hình thức online nếu dịch vụ hỗ trợ." },
  { question: "Tôi có thể thay đổi hoặc hủy lịch không?", answer: "Bạn có thể liên hệ với Huyền Cảnh để được hỗ trợ thay đổi hoặc hủy lịch theo chính sách hiện hành." },
  { question: "Nội dung buổi trải bài có được bảo mật không?", answer: "Thông tin cá nhân và nội dung trao đổi trong buổi trải bài được tôn trọng và bảo mật." },
  { question: "Tarot có dự đoán chính xác tương lai không?", answer: "Tarot mang tính tham khảo và gợi mở góc nhìn. Tarot không đưa ra kết quả chắc chắn và không quyết định thay cho bạn." },
];

function SectionHeading({ eyebrow, children, intro }: { eyebrow: string; children: React.ReactNode; intro?: string }) {
  return <div className="max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-antique-gold">{eyebrow}</p><h2 className="mt-3 font-serif text-4xl leading-tight text-ivory md:text-5xl">{children}</h2>{intro ? <p className="mt-5 text-base leading-8 text-stone-mist md:text-lg">{intro}</p> : null}</div>;
}

export default async function ServicesPage() {
  const [services, customerAccess] = await Promise.all([getActiveServices(), getCustomerAccess()]);
  const customer = customerAccess.ok ? { fullName: customerAccess.customer.full_name, phone: customerAccess.customer.phone, email: customerAccess.customer.email ?? "" } : null;
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: { "@type": "Service", name: service.name, description: service.short_description ?? service.description ?? undefined, url: `${baseUrl}/dich-vu/${service.slug}`, provider: { "@type": "Organization", name: "Huyền Cảnh" } },
    })),
  };
  const faqJsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqItems.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) };

  return (
    <>
      <Header />
      <main className="min-h-screen pb-24">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

        <section className="relative grid min-h-[calc(88svh-5rem)] items-center overflow-hidden border-b border-gilded/30 px-5 py-20 md:px-8">
          <Image src="/images/abstract-gate.svg" alt="" fill priority sizes="100vw" className="object-cover opacity-35" />
          <div className="hero-fox-atmosphere absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/85 to-obsidian/35" />
          <div className="relative mx-auto w-full max-w-7xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-antique-gold">Trải bài Tarot tại Huyền Cảnh</p>
            <h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold leading-[1.05] text-ivory md:text-7xl">Lắng nghe thông điệp dành cho bạn</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-mist md:text-lg">Tarot không quyết định tương lai, mà giúp bạn nhìn rõ hơn những điều đang diễn ra, hiểu cảm xúc của chính mình và lựa chọn hướng đi phù hợp.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#booking-form" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-antique-gold px-6 text-sm font-semibold uppercase tracking-[0.1em] text-obsidian focus:outline-none focus:ring-2 focus:ring-ivory"><CalendarDays size={17} aria-hidden="true" />Đặt lịch trải bài</a>
              <a href="#services" className="inline-flex min-h-12 items-center justify-center rounded-full border border-antique-gold/70 px-6 text-sm font-semibold text-antique-gold transition hover:bg-antique-gold/10 focus:outline-none focus:ring-2 focus:ring-antique-gold">Khám phá dịch vụ</a>
            </div>
          </div>
        </section>

        <section className="px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <SectionHeading eyebrow="Một khoảng riêng tư" intro="Tại Huyền Cảnh, mỗi buổi trải bài là một khoảng thời gian riêng tư để bạn chia sẻ câu chuyện, nhìn nhận vấn đề từ nhiều góc độ và lắng nghe những thông điệp mà bộ bài gợi mở.">Một buổi trải bài tại Huyền Cảnh</SectionHeading>
            <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">{sessionFeatures.map((feature) => <div key={feature} className="flex gap-3 border-b border-gilded/30 py-3 text-sm text-stone-mist"><Check className="mt-1 shrink-0 text-antique-gold" size={16} aria-hidden="true" /><span>{feature}</span></div>)}</div>
            <p className="border-l-2 border-antique-gold/70 pl-4 text-sm leading-7 text-stone-mist lg:col-span-2">Tarot mang tính chất tham khảo và định hướng, không thay thế tư vấn y tế, pháp lý, tài chính hoặc chuyên môn.</p>
          </div>
        </section>

        <section id="services" className="fox-section-wash border-y border-gilded/25 px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-7xl">
            <SectionHeading eyebrow="Chọn nhịp phù hợp" intro="Các dịch vụ bên dưới được cập nhật trực tiếp từ hệ thống của Huyền Cảnh.">Dịch vụ trải bài</SectionHeading>
            {services.length ? <div className="mt-10 grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">{services.map((service) => <ServiceCard key={service.id} service={service} />)}</div> : <div className="mt-10 border-y border-gilded/35 py-12 text-center text-stone-mist">Dịch vụ đang được chuẩn bị. Vui lòng quay lại sau.</div>}
          </div>
        </section>

        <section className="px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-7xl"><SectionHeading eyebrow="Một góc nhìn khác">Khi nào bạn nên tìm đến một buổi trải bài?</SectionHeading><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{moments.map(({ icon: Icon, text }) => <article key={text} className="rounded-lg border border-gilded/35 bg-card-deep/65 p-5"><Icon className="text-antique-gold" size={22} aria-hidden="true" /><p className="mt-5 text-sm leading-7 text-stone-mist">{text}</p></article>)}</div></div>
        </section>

        <section className="border-y border-gilded/25 bg-card-muted/55 px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-7xl"><SectionHeading eyebrow="Cách Huyền Cảnh đồng hành">Vì sao lựa chọn Huyền Cảnh?</SectionHeading><div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">{reasons.map(([reasonTitle, text], index) => <article key={reasonTitle} className="border-t border-antique-gold/45 pt-5"><span className="text-xs text-antique-gold">0{index + 1}</span><h3 className="mt-2 font-serif text-2xl text-ivory">{reasonTitle}</h3><p className="mt-3 text-sm leading-7 text-stone-mist">{text}</p></article>)}</div></div>
        </section>

        <section className="px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-7xl"><SectionHeading eyebrow="Từng bước rõ ràng">Quy trình trải bài</SectionHeading><ol className="mt-10 grid gap-6 md:grid-cols-4">{processSteps.map(([stepTitle, text], index) => <li key={stepTitle} className="relative border-l border-antique-gold/55 pl-5"><span className="font-serif text-4xl text-antique-gold/60">{index + 1}</span><h3 className="mt-3 font-serif text-2xl text-ivory">{stepTitle}</h3><p className="mt-3 text-sm leading-7 text-stone-mist">{text}</p></li>)}</ol></div>
        </section>

        <section className="border-y border-gilded/25 px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-7xl"><SectionHeading eyebrow="Góc nhìn sau phiên đọc">Những chia sẻ từ khách hàng</SectionHeading><div className="-mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4">{serviceReviewSamples.map((review) => <blockquote key={`${review.name}-${review.service}`} className="min-w-[82vw] snap-center rounded-lg border border-gilded/40 bg-card-deep/75 p-5 sm:min-w-[360px] md:min-w-0"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full border border-antique-gold/60 text-sm font-semibold text-antique-gold">{review.name.charAt(0)}</span><div><p className="font-medium text-ivory">{review.name}</p><p aria-label={`${review.rating} trên 5 sao`} className="text-xs text-antique-gold">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p></div></div><p className="mt-5 text-sm leading-7 text-stone-mist">“{review.content}”</p><footer className="mt-5 border-t border-gilded/25 pt-3 text-xs text-antique-gold">{review.service}</footer></blockquote>)}</div></div>
        </section>

        <section className="fox-highlight px-5 py-20 text-center md:px-8 md:py-24">
          <div className="mx-auto max-w-3xl"><Sparkles className="mx-auto text-antique-gold" size={26} aria-hidden="true" /><h2 className="mt-5 font-serif text-4xl leading-tight text-ivory md:text-5xl">Bạn không cần có tất cả câu trả lời ngay lúc này</h2><p className="mt-5 text-base leading-8 text-stone-mist">Đôi khi, điều chúng ta cần chỉ là một khoảng lặng để nhìn lại câu chuyện của mình từ một góc độ khác. Hãy để Huyền Cảnh đồng hành cùng bạn trong hành trình đó.</p><a href="#booking-form" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-antique-gold px-7 text-sm font-semibold uppercase tracking-[0.1em] text-obsidian"><CalendarDays size={17} aria-hidden="true" />Đặt lịch ngay</a></div>
        </section>

        <section className="px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-6xl"><SectionHeading eyebrow="Yêu cầu đặt lịch" intro="Chọn lịch còn trống và để lại thông tin. Bạn không cần đăng nhập để gửi yêu cầu.">Đặt lịch trải bài</SectionHeading><div className="mt-10"><BookingForm services={services} customer={customer} /></div></div>
        </section>

        <section className="border-t border-gilded/25 bg-card-muted/45 px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.65fr_1fr]"><div><ShieldCheck className="text-antique-gold" size={25} aria-hidden="true" /><SectionHeading eyebrow="Thông tin cần biết">Câu hỏi thường gặp</SectionHeading><p className="mt-5 flex items-center gap-2 text-sm text-stone-mist"><LockKeyhole size={16} className="text-antique-gold" aria-hidden="true" />Nội dung trao đổi được tôn trọng và bảo mật.</p></div><ServiceFaq items={faqItems} /></div>
        </section>
      </main>
      <Footer />
    </>
  );
}
