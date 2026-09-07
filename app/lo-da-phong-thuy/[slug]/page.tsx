import type { Metadata } from "next";
import { MessageCircleMore } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MarkdownContent } from "@/components/blog/MarkdownContent";
import { StoneImage } from "@/components/stones/StoneImage";
import { StoneJarCard } from "@/components/stones/StoneJarCard";
import { getPublishedStoneJarBySlug, getRelatedStoneJars } from "@/lib/queries/stones";
import { buildStoneJarContactHref } from "@/lib/stones/contact";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://huyen-canh.local";
const absoluteImageUrl = (url: string | null) => url ? new URL(url, `${baseUrl}/`).toString() : undefined;
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; const jar = await getPublishedStoneJarBySlug(slug);
  if (!jar) return { title: "Không tìm thấy lọ đá", robots: { index: false } };
  const title = jar.seo_title || jar.name; const description = jar.seo_description || jar.short_description || "Lọ đá phong thủy tại Huyền Cảnh."; const url = `${baseUrl}/lo-da-phong-thuy/${jar.slug}`;
  const image = absoluteImageUrl(jar.featured_image);
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, type: "website", images: image ? [{ url: image, alt: jar.name }] : undefined } };
}

function TextSection({ title, value }: { title: string; value: string | null }) { return value ? <section className="border-t border-gilded/30 py-9"><h2 className="font-serif text-3xl text-ivory">{title}</h2><p className="mt-4 whitespace-pre-line text-base leading-8 text-stone-mist">{value}</p></section> : null; }

export default async function StoneJarDetailPage({ params }: Props) {
  const { slug } = await params; const jar = await getPublishedStoneJarBySlug(slug); if (!jar) notFound(); const related = await getRelatedStoneJars(jar); const images = [...new Set([jar.featured_image, ...jar.gallery].filter((url): url is string => Boolean(url)))]; const contactHref = buildStoneJarContactHref(jar.name, `/lo-da-phong-thuy/${jar.slug}`, jar.contact_message);
  const productJsonLd = { "@context": "https://schema.org", "@type": "Product", name: jar.name, description: jar.short_description ?? undefined, image: images.map((image) => absoluteImageUrl(image)), offers: jar.price == null ? undefined : { "@type": "Offer", price: jar.price, priceCurrency: "VND", url: `${baseUrl}/lo-da-phong-thuy/${jar.slug}` } };
  return <><Header /><main className="min-h-screen px-5 pb-24 pt-32 md:px-8"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} /><div className="mx-auto max-w-7xl"><nav className="text-sm text-stone-mist"><Link href="/lo-da-phong-thuy" className="text-antique-gold">Lọ đá phong thủy</Link> / {jar.name}</nav><section className="grid gap-10 py-12 lg:grid-cols-[0.9fr_1fr] lg:items-center"><StoneImage src={jar.featured_image} alt={jar.name} priority /><div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-antique-gold">Tổ hợp khoáng vật</p><h1 className="mt-4 font-serif text-5xl text-ivory md:text-7xl">{jar.name}</h1><p className="mt-6 text-lg leading-9 text-stone-mist">{jar.short_description}</p><p className="mt-5 font-serif text-3xl text-antique-gold">{jar.price == null ? jar.price_label : `${jar.price.toLocaleString("vi-VN")}đ`}</p><a href={contactHref} target="_blank" rel="noreferrer" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-antique-gold px-6 text-sm font-semibold uppercase tracking-[0.12em] text-obsidian"><MessageCircleMore size={18} />Liên hệ tư vấn</a></div></section>
    {images.length > 1 ? <section className="mb-12"><h2 className="font-serif text-3xl text-ivory">Thư viện ảnh</h2><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{images.map((url, index) => <StoneImage key={url} src={url} alt={`${jar.name} - ảnh ${index + 1}`} />)}</div></section> : null}<div className="grid gap-10 lg:grid-cols-[1fr_320px]"><div>{jar.content ? <section className="border-t border-gilded/30 py-9"><MarkdownContent content={jar.content} /></section> : null}<TextSection title="Ý nghĩa và nguồn năng lượng" value={jar.meaning} /><TextSection title="Cách sử dụng và vị trí đặt" value={jar.usage} /></div><aside className="h-fit rounded-lg border border-gilded/40 bg-card-deep/75 p-5 lg:sticky lg:top-24"><h2 className="font-serif text-2xl text-ivory">Tư vấn riêng</h2><p className="mt-3 text-sm leading-7 text-stone-mist">Trao đổi với Huyền Cảnh để chọn lọ đá phù hợp với không gian và mong muốn của bạn.</p><a href={contactHref} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-antique-gold px-5 text-sm font-semibold text-obsidian"><MessageCircleMore size={17} />Liên hệ tư vấn</a></aside></div>
    <section className="mt-14 border-t border-gilded/30 pt-10"><h2 className="font-serif text-4xl text-ivory">Các loại đá trong lọ</h2><div className="mt-7 grid gap-4 md:grid-cols-2">{jar.items.map((item) => <article key={item.id} className="grid gap-4 rounded-lg border border-gilded/40 bg-card-deep/70 p-4 sm:grid-cols-[120px_1fr]"><StoneImage src={item.stone.featured_image} alt={item.stone.name} square sizes="120px" /><div><Link href={`/da-phong-thuy/${item.stone.slug}`} className="font-serif text-2xl text-ivory hover:text-antique-gold">{item.stone.name}</Link>{item.quantity ? <p className="mt-1 text-xs text-antique-gold">{item.quantity}</p> : null}{item.description ? <p className="mt-3 text-sm leading-7 text-stone-mist">{item.description}</p> : null}</div></article>)}</div></section>
    {related.length ? <section className="mt-14 border-t border-gilded/30 pt-10"><h2 className="font-serif text-4xl text-ivory">Lọ đá liên quan</h2><div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{related.map((item) => <StoneJarCard key={item.id} jar={item} />)}</div></section> : null}</div></main><Footer /></>;
}
