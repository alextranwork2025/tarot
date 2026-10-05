import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MarkdownContent } from "@/components/blog/MarkdownContent";
import { BraceletCard } from "@/components/bracelets/BraceletCard";
import { BraceletConsultation } from "@/components/bracelets/BraceletConsultation";
import { BraceletGallery } from "@/components/bracelets/BraceletGallery";
import { braceletAvailabilityLabels } from "@/lib/validations/bracelets";
import { getContactSettings, getPublishedBraceletBySlug, getRelatedBracelets } from "@/lib/queries/bracelets";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://huyen-canh.local";
const absoluteImageUrl = (url: string | null) => url ? new URL(url, `${baseUrl}/`).toString() : undefined;
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const bracelet = await getPublishedBraceletBySlug(slug);
  if (!bracelet) return { title: "Không tìm thấy vòng tay", robots: { index: false } };
  const title = bracelet.seo_title || bracelet.name;
  const description = bracelet.seo_description || bracelet.short_description;
  const url = `${baseUrl}/vong-tay-phong-thuy/${bracelet.slug}`;
  const image = absoluteImageUrl(bracelet.featured_image);
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, type: "website", images: image ? [{ url: image, alt: bracelet.name }] : undefined } };
}

function TextSection({ title, value }: { title: string; value: string | null }) {
  return value ? <section className="border-t border-gilded/30 py-9"><h2 className="font-serif text-3xl text-ivory">{title}</h2><p className="mt-4 whitespace-pre-line text-base leading-8 text-stone-mist">{value}</p></section> : null;
}

function SpecRow({ label, value }: { label: string; value: string | null }) {
  return value ? <div className="grid gap-1 border-b border-gilded/20 py-3 sm:grid-cols-[180px_1fr]"><dt className="text-stone-mist">{label}</dt><dd className="text-ivory">{value}</dd></div> : null;
}

export default async function BraceletDetailPage({ params }: Props) {
  const { slug } = await params;
  const bracelet = await getPublishedBraceletBySlug(slug);
  if (!bracelet) notFound();
  const [settings, related] = await Promise.all([getContactSettings(), getRelatedBracelets(bracelet)]);
  const images = [...new Set([bracelet.featured_image, ...bracelet.gallery].filter(Boolean))] as string[];
  const price = bracelet.price == null ? "Liên hệ tư vấn" : `${bracelet.price.toLocaleString("vi-VN")}đ`;
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: bracelet.name,
    sku: bracelet.product_code,
    description: bracelet.short_description,
    image: images.map((image) => absoluteImageUrl(image)),
    offers: bracelet.price == null ? undefined : { "@type": "Offer", price: bracelet.price, priceCurrency: "VND", url: `${baseUrl}/vong-tay-phong-thuy/${bracelet.slug}`, availability: bracelet.availability === "out_of_stock" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock" },
  };

  return (
    <>
      <Header />
      <main className="min-h-screen px-5 pb-44 pt-32 md:px-8 md:pb-24">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
        <div className="mx-auto max-w-7xl">
          <nav className="text-sm text-stone-mist"><Link href="/vong-tay-phong-thuy" className="text-antique-gold">Vòng tay phong thủy</Link> / {bracelet.name}</nav>
          <section className="grid gap-10 py-12 lg:grid-cols-[0.9fr_1fr]">
            <BraceletGallery images={images} name={bracelet.name} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-antique-gold">Mã {bracelet.product_code}</p>
              <h1 className="mt-4 font-serif text-5xl text-ivory md:text-7xl">{bracelet.name}</h1>
              <p className="mt-6 text-lg leading-9 text-stone-mist">{bracelet.short_description}</p>
              <div className="mt-6 grid gap-3 text-sm text-stone-mist">
                <p>Loại đá: <span className="text-ivory">{bracelet.stones.map((stone) => stone.name).join(", ")}</span></p>
                <p>Kích thước hạt: <span className="text-ivory">{bracelet.bead_sizes_mm.map((size) => `${size} mm`).join(", ")}</span></p>
                <p>Kích cỡ vòng/chu vi cổ tay: <span className="text-ivory">{bracelet.wrist_sizes_cm.join(", ")}</span></p>
                <p>Tình trạng: <span className="text-ivory">{braceletAvailabilityLabels[bracelet.availability]}</span></p>
              </div>
              <p className="mt-6 font-serif text-3xl text-antique-gold">{price}</p>
              <div className="mt-7">
                <BraceletConsultation name={bracelet.name} productCode={bracelet.product_code} beadSizesMm={bracelet.bead_sizes_mm} zaloUrl={settings.zalo_url} facebookUrl={settings.facebook_url} />
              </div>
            </div>
          </section>

          <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
            <div>
              <section className="border-t border-gilded/30 py-9"><MarkdownContent content={bracelet.content} /></section>
              <TextSection title="Ý nghĩa phong thủy" value={bracelet.meaning ? `${bracelet.meaning}\n\nNội dung phong thủy mang tính biểu tượng và tham khảo, không thay thế tư vấn chuyên môn và không cam kết chữa bệnh hay bảo đảm tài lộc.` : null} />
              <TextSection title="Hướng dẫn đo cổ tay" value={bracelet.wrist_measurement_guide} />
              <TextSection title="Hướng dẫn sử dụng và bảo quản" value={bracelet.care_guide} />
              <TextSection title="Chính sách liên quan" value={bracelet.policy} />
            </div>
            <aside className="h-fit rounded-lg border border-gilded/40 bg-card-deep/75 p-5 lg:sticky lg:top-24">
              <h2 className="font-serif text-2xl text-ivory">Thông số sản phẩm</h2>
              <dl className="mt-4 text-sm">
                <SpecRow label="Mã sản phẩm" value={bracelet.product_code} />
                <SpecRow label="Loại đá" value={bracelet.stones.map((stone) => stone.name).join(", ")} />
                <SpecRow label="Kích thước hạt" value={bracelet.bead_sizes_mm.map((size) => `${size} mm`).join(", ")} />
                <SpecRow label="Kích cỡ vòng" value={bracelet.wrist_sizes_cm.join(", ")} />
                <SpecRow label="Màu sắc" value={bracelet.colors.join(", ") || null} />
                <SpecRow label="Kiểu dáng" value={bracelet.style} />
                <SpecRow label="Số lượng hạt" value={bracelet.bead_count} />
                <SpecRow label="Chất liệu dây" value={bracelet.cord_material} />
                <SpecRow label="Charm/phụ kiện" value={bracelet.accessory_material} />
                <SpecRow label="Mệnh phù hợp" value={bracelet.suitable_elements.join(", ") || null} />
                <SpecRow label="Nguồn gốc đá" value={bracelet.origin} />
                <SpecRow label="Xử lý đá" value={bracelet.treatment} />
                <SpecRow label="Chứng nhận" value={bracelet.certification} />
              </dl>
            </aside>
          </div>

          {related.length ? <section className="mt-14 border-t border-gilded/30 pt-10"><h2 className="font-serif text-4xl text-ivory">Vòng tay liên quan</h2><div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{related.map((item) => <BraceletCard key={item.id} bracelet={item} />)}</div></section> : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
