import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Sparkles } from "lucide-react";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Reveal } from "@/components/Reveal";
import { SacredGeometry } from "@/components/SacredGeometry";
import { ScrollToTopOnMount } from "@/components/ScrollToTopOnMount";
import { SectionHeading } from "@/components/SectionHeading";
import {
  brandValues,
  formationParagraphs,
  operatingPrinciples,
  readerProfiles,
  tarotPhilosophyPoints,
} from "@/data/about";

export const metadata: Metadata = {
  title: "Giới thiệu Huyền Cảnh | Câu chuyện và triết lý Tarot",
  description:
    "Tìm hiểu câu chuyện, triết lý Tarot, giá trị và nguyên tắc hoạt động của Huyền Cảnh.",
  openGraph: {
    title: "Giới thiệu Huyền Cảnh",
    description:
      "Một không gian Tarot dành cho sự lắng nghe, chiêm nghiệm và khám phá bản thân.",
    type: "website",
    locale: "vi_VN",
    siteName: "Huyền Cảnh",
  },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <ScrollToTopOnMount />
      <main className="overflow-hidden">
        <AboutHero />
        <FormationSection />
        <PhilosophySection />
        <CompanionsSection />
        <ValuesSection />
        <PrinciplesSection />
        <ClosingSection />
      </main>
      <Footer />
    </>
  );
}

function AboutHero() {
  return (
    <section className="relative min-h-[72svh] border-b border-gilded/25 px-5 py-20 md:px-8 md:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(113,31,48,0.24),transparent_32%),radial-gradient(circle_at_78%_30%,rgba(23,75,72,0.2),transparent_28%),linear-gradient(180deg,rgba(9,11,16,0.2),#090B10_94%)]" />
      <div className="absolute inset-0 sacred-grain" />
      <SacredGeometry
        variant="moon"
        className="absolute right-[-4rem] top-16 h-64 w-64 text-antique-gold/16 md:right-12 md:h-80 md:w-80"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.02fr_0.82fr]">
        <Reveal>
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-antique-gold">
              Giới thiệu
            </p>
            <h1 className="mt-5 font-serif text-5xl font-semibold leading-tight text-ivory md:text-7xl">
              Câu chuyện của Huyền Cảnh
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-9 text-stone-mist md:text-xl md:leading-10">
              Huyền Cảnh là một không gian Tarot dành cho sự lắng nghe, chiêm
              nghiệm và khám phá bản thân — nơi mỗi câu chuyện được đón nhận
              bằng sự tôn trọng và không phán xét.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[430px] overflow-hidden rounded-t-full border border-gilded/45 bg-card-deep/80 shadow-2xl shadow-black/25">
            <Image
              src="/images/abstract-gate.svg"
              alt="Họa tiết cánh cửa Tarot trừu tượng mở vào không gian chiêm nghiệm."
              fill
              priority
              sizes="(min-width: 1024px) 34vw, 88vw"
              className="object-cover"
            />
            <div className="absolute inset-x-8 bottom-8 border-t border-antique-gold/40 pt-5">
              <p className="font-serif text-2xl leading-8 text-ivory">
                Một nơi để chậm lại, nhìn sâu hơn và gọi tên điều đang hiện diện.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FormationSection() {
  return (
    <section className="px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.78fr_1fr]">
        <Reveal>
          <div className="sticky top-28">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-antique-gold">
              Hành trình hình thành
            </p>
            <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight text-ivory md:text-5xl">
              Từ một khoảng lặng riêng tư đến nền tảng đồng hành
            </h2>
          </div>
        </Reveal>

        <div className="space-y-8">
          {formationParagraphs.map((paragraph, index) => (
            <Reveal key={paragraph} delay={index * 0.06}>
              <article className="grid gap-5 border-t border-gilded/30 pt-8 sm:grid-cols-[4rem_1fr]">
                <span className="font-serif text-4xl text-antique-gold/80">
                  0{index + 1}
                </span>
                <p className="text-lg leading-9 text-stone-mist">{paragraph}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PhilosophySection() {
  return (
    <section className="relative border-y border-gilded/25 bg-[#0d1115] px-5 py-24 md:px-8 md:py-32">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(113,31,48,0.16),transparent_38%),radial-gradient(circle_at_82%_20%,rgba(184,146,79,0.12),transparent_24%)]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1fr]">
        <Reveal>
          <div className="relative min-h-[460px] overflow-hidden rounded-lg border border-gilded/35 bg-card-deep/76 p-8">
            <SacredGeometry
              variant="seal"
              className="absolute left-1/2 top-10 h-[360px] w-[230px] -translate-x-1/2 text-antique-gold/28"
            />
            <div className="relative flex min-h-[396px] flex-col justify-between">
              <Sparkles size={26} className="text-antique-gold" aria-hidden="true" />
              <blockquote className="font-serif text-4xl leading-tight text-ivory md:text-5xl">
                Tarot là một tấm gương, không phải lời phán quyết
              </blockquote>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div>
            <SectionHeading
              eyebrow="Triết lý Tarot"
              title="Nhìn rõ hiện tại trước khi nghĩ về tương lai"
              description="Cách Huyền Cảnh tiếp cận Tarot đặt trọng tâm vào sự tự nhận thức, tính chủ động và lòng tôn trọng với câu chuyện cá nhân."
            />
            <ul className="mt-10 space-y-5">
              {tarotPhilosophyPoints.map((point) => (
                <li key={point} className="flex gap-4 text-base leading-8 text-stone-mist">
                  <CheckCircle2
                    size={20}
                    className="mt-1 shrink-0 text-antique-gold"
                    aria-hidden="true"
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function CompanionsSection() {
  return (
    <section className="px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading
            eyebrow="Người đồng hành"
            title="Người đồng hành cùng bạn"
            description="Thông tin hồ sơ bên dưới được tách riêng để có thể bổ sung nhiều Tarot Reader khi đã có dữ liệu thật."
          />
        </Reveal>

        <div className="mt-14 grid gap-8">
          {readerProfiles.map((profile) => (
            <ReaderProfileArticle key={profile.name} profile={profile} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReaderProfileArticle({
  profile,
}: {
  profile: (typeof readerProfiles)[number];
}) {
  return (
    <Reveal>
      <article className="grid gap-10 border-y border-gilded/30 py-10 lg:grid-cols-[320px_1fr] lg:items-start">
        <div className="relative aspect-[4/5] w-full max-w-[320px] overflow-hidden rounded-t-full border border-gilded/45 bg-card-deep">
          <Image
            src={profile.image}
            alt={profile.imageAlt}
            fill
            sizes="(min-width: 1024px) 320px, 86vw"
            className="object-cover"
          />
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-antique-gold">
            {profile.role}
          </p>
          <h3 className="mt-3 font-serif text-4xl font-semibold text-ivory">
            {profile.name}
          </h3>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <ProfileField label="Câu chuyện đến với Tarot" value={profile.story} />
            <ProfileField label="Phong cách tư vấn" value={profile.style} />
          </div>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-antique-gold">
              Chủ đề thường đồng hành
            </p>
            <ul className="mt-4 flex flex-wrap gap-3">
              {profile.topics.map((topic) => (
                <li
                  key={topic}
                  className="rounded-full border border-gilded/40 px-4 py-2 text-sm text-stone-mist"
                >
                  {topic}
                </li>
              ))}
            </ul>
          </div>

          <blockquote className="mt-8 border-l border-antique-gold pl-6 font-serif text-2xl leading-9 text-ivory">
            “{profile.quote}”
          </blockquote>
        </div>
      </article>
    </Reveal>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-antique-gold">
        {label}
      </p>
      <p className="mt-3 text-base leading-8 text-stone-mist">{value}</p>
    </div>
  );
}

function ValuesSection() {
  return (
    <section className="relative bg-card-deep/42 px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.7fr_1fr]">
        <Reveal>
          <SectionHeading
            eyebrow="Giá trị"
            title="Những điều Huyền Cảnh chọn giữ gìn"
            description="Các giá trị này định hình cách nội dung được viết, cách phiên trải bài được dẫn dắt và cách mỗi câu chuyện được tôn trọng."
          />
        </Reveal>

        <div className="divide-y divide-gilded/25 border-y border-gilded/25">
          {brandValues.map((value, index) => {
            const Icon = value.icon;

            return (
              <Reveal key={value.title} delay={index * 0.04}>
                <article className="grid gap-5 py-7 sm:grid-cols-[3.5rem_1fr]">
                  <div className="grid size-12 place-items-center rounded-full border border-gilded/50 text-antique-gold">
                    <Icon size={21} strokeWidth={1.5} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-serif text-3xl font-semibold text-ivory">
                      {value.title}
                    </h3>
                    <p className="mt-3 text-base leading-8 text-stone-mist">
                      {value.description}
                    </p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PrinciplesSection() {
  return (
    <section className="px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Nguyên tắc hoạt động"
            title="Điều Huyền Cảnh luôn tôn trọng"
            description="Những nguyên tắc này giúp trải nghiệm Tarot giữ được sự rõ ràng, nghiêm túc và không tạo cảm giác phụ thuộc."
          />
        </Reveal>

        <Reveal delay={0.12}>
          <ol className="mt-12 divide-y divide-gilded/25 rounded-lg border border-gilded/30 bg-obsidian/45">
            {operatingPrinciples.map((principle, index) => (
              <li key={principle} className="grid gap-4 p-6 sm:grid-cols-[3rem_1fr]">
                <span className="font-serif text-3xl text-antique-gold/80">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-base leading-8 text-stone-mist">{principle}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

function ClosingSection() {
  return (
    <section className="border-t border-gilded/25 px-5 py-20 md:px-8 md:py-28">
      <Reveal>
        <div className="mx-auto max-w-5xl text-center">
          <p className="font-serif text-4xl font-semibold leading-tight text-ivory md:text-6xl">
            Huyền Cảnh không nói trước tương lai — Huyền Cảnh giúp bạn nhìn rõ
            hiện tại.
          </p>
          <Link
            href="/blog"
            className="mt-10 inline-flex min-h-12 items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-antique-gold transition hover:text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold"
          >
            Khám phá các bài viết về Tarot
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
