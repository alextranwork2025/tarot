import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CalendarDays } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MarkdownContent } from "@/components/blog/MarkdownContent";
import { ServiceImage } from "@/components/services/ServiceImage";
import { getPublishedServiceBySlug } from "@/lib/queries/services";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://huyen-canh.local";

type Props = {
  params: Promise<{ slug: string }>;
};

function formatPrice(price: number) {
  return price === 0 ? "Giá đang cập nhật" : `${price.toLocaleString("vi-VN")}đ`;
}

function textBlock(value: string | null) {
  if (!value) {
    return null;
  }

  return value.split(/\r?\n/).filter(Boolean).map((line) => (
    <p key={line} className="text-base leading-8 text-stone-mist">{line}</p>
  ));
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  if (!children) {
    return null;
  }

  return (
    <section className="border-t border-gilded/30 py-10">
      <h2 className="font-serif text-3xl text-ivory">{title}</h2>
      <div className="mt-5 grid gap-3">{children}</div>
    </section>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getPublishedServiceBySlug(slug);

  if (!service) {
    return {
      title: "Không tìm thấy dịch vụ | Huyền Cảnh",
      robots: { index: false, follow: false },
    };
  }

  const title = service.seo_title || service.name;
  const description = service.seo_description || service.short_description || service.description || "Dịch vụ Tarot tại Huyền Cảnh.";
  const url = `${baseUrl}/dich-vu/${service.slug}`;
  const images = service.cover_image_url ? [{ url: service.cover_image_url, alt: service.name }] : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: service.cover_image_url ? [service.cover_image_url] : undefined,
    },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = await getPublishedServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.short_description ?? service.description ?? undefined,
    image: service.cover_image_url ?? undefined,
    provider: {
      "@type": "Organization",
      name: "Huyền Cảnh",
      url: baseUrl,
    },
    offers: {
      "@type": "Offer",
      price: service.price,
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
      url: `${baseUrl}/dat-lich?service=${service.id}`,
    },
  };
  const faqJsonLd = service.faq.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: service.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }
    : null;

  return (
    <>
      <Header />
      <main className="min-h-screen px-5 pb-24 pt-32 md:px-8">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
        {faqJsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} /> : null}
        <div className="mx-auto max-w-7xl">
          <nav className="flex flex-wrap gap-2 text-sm text-stone-mist" aria-label="Breadcrumb">
            <Link href="/" className="text-antique-gold">Trang chủ</Link>
            <span>/</span>
            <Link href="/dich-vu" className="text-antique-gold">Dịch vụ</Link>
            <span>/</span>
            <span>{service.name}</span>
          </nav>

          <section className="grid gap-10 py-12 lg:grid-cols-[1fr_0.82fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-antique-gold">Dịch vụ Tarot</p>
              <h1 className="mt-4 font-serif text-5xl font-semibold leading-tight text-ivory md:text-7xl">{service.name}</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-mist">
                {service.short_description ?? service.description ?? "Thông tin chi tiết đang được cập nhật."}
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-sm text-antique-gold">
                <span className="rounded-full border border-gilded/50 px-4 py-2">{service.duration_minutes} phút</span>
                <span className="rounded-full border border-gilded/50 px-4 py-2">{formatPrice(service.price)}</span>
              </div>
              <Link href={`/dat-lich?service=${service.id}`} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-antique-gold px-6 text-sm font-semibold uppercase tracking-[0.14em] text-obsidian hover:bg-ivory focus:outline-none focus:ring-2 focus:ring-ivory">
                <CalendarDays size={18} aria-hidden="true" />
                Đặt lịch ngay
              </Link>
            </div>
            <ServiceImage src={service.cover_image_url} alt={service.name} priority />
          </section>

          <div className="grid gap-2 lg:grid-cols-[1fr_320px] lg:gap-10">
            <div>
              {service.content ? (
                <section className="border-t border-gilded/30 py-10">
                  <h2 className="mb-5 font-serif text-3xl text-ivory">Giới thiệu</h2>
                  <MarkdownContent content={service.content} />
                </section>
              ) : null}
              <Section title="Đối tượng phù hợp">{textBlock(service.suitable_for)}</Section>
              <Section title="Lợi ích nhận được">{textBlock(service.benefits)}</Section>
              <Section title="Quy trình buổi xem bài">{textBlock(service.process)}</Section>
              <Section title="Những điều cần chuẩn bị">{textBlock(service.preparation_notes)}</Section>

              {service.testimonials.length ? (
                <section className="border-t border-gilded/30 py-10">
                  <h2 className="font-serif text-3xl text-ivory">Đánh giá khách hàng</h2>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {service.testimonials.map((item) => (
                      <blockquote key={`${item.customer_name}-${item.content}`} className="rounded-lg border border-gilded/40 bg-card-deep/75 p-5">
                        <p className="text-sm text-antique-gold">{item.rating}/5</p>
                        <p className="mt-3 text-base leading-7 text-stone-mist">{item.content}</p>
                        <footer className="mt-4 text-sm text-ivory">{item.customer_name}</footer>
                      </blockquote>
                    ))}
                  </div>
                </section>
              ) : null}

              {service.faq.length ? (
                <section className="border-t border-gilded/30 py-10">
                  <h2 className="font-serif text-3xl text-ivory">FAQ</h2>
                  <div className="mt-5 grid gap-3">
                    {service.faq.map((item) => (
                      <details key={item.question} className="rounded-lg border border-gilded/40 bg-card-deep/70 p-4">
                        <summary className="cursor-pointer font-medium text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold">{item.question}</summary>
                        <p className="mt-3 text-sm leading-7 text-stone-mist">{item.answer}</p>
                      </details>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>

            <aside className="h-fit rounded-lg border border-gilded/40 bg-card-deep/80 p-5 lg:sticky lg:top-24">
              <h2 className="font-serif text-3xl text-ivory">Thời lượng và giá</h2>
              <dl className="mt-5 grid gap-4 text-sm text-stone-mist">
                <div>
                  <dt className="text-antique-gold">Thời lượng</dt>
                  <dd>{service.duration_minutes} phút</dd>
                </div>
                <div>
                  <dt className="text-antique-gold">Giá</dt>
                  <dd>{formatPrice(service.price)}</dd>
                </div>
              </dl>
              <Link href={`/dat-lich?service=${service.id}`} className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-antique-gold px-5 text-sm font-semibold text-obsidian hover:bg-ivory">
                <CalendarDays size={17} aria-hidden="true" />
                Đặt lịch ngay
              </Link>
            </aside>
          </div>

          <section className="mt-10 rounded-lg border border-gilded/40 bg-card-deep/75 px-6 py-10 text-center">
            <h2 className="font-serif text-4xl text-ivory">Sẵn sàng mở một phiên đọc?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-stone-mist">
              Chọn một khung giờ phù hợp để Huyền Cảnh xác nhận lịch hẹn và chuẩn bị không gian đọc cho bạn.
            </p>
            <Link href={`/dat-lich?service=${service.id}`} className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-antique-gold px-6 text-sm font-semibold uppercase tracking-[0.14em] text-obsidian hover:bg-ivory">
              Đặt lịch ngay
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
