import { MessageCircleMore } from "lucide-react";
import Link from "next/link";

import { StoneImage } from "@/components/stones/StoneImage";
import { buildStoneJarContactHref } from "@/lib/stones/contact";
import type { StoneJarSummary } from "@/types/stones";

export function StoneJarCard({ jar }: { jar: StoneJarSummary }) {
  return <article className="grid gap-4 rounded-lg border border-gilded/40 bg-card-deep/75 p-4 transition hover:-translate-y-1 hover:border-fox-red/80">
    <StoneImage src={jar.featured_image} alt={jar.name} />
    <div><h2 className="font-serif text-3xl text-ivory">{jar.name}</h2><p className="mt-3 text-sm leading-7 text-stone-mist">{jar.short_description ?? "Thông tin đang được cập nhật."}</p>
      <p className="mt-3 text-sm text-antique-gold">{jar.price == null ? jar.price_label : `${jar.price.toLocaleString("vi-VN")}đ`}</p>
      <div className="mt-5 flex flex-wrap gap-3"><Link href={`/lo-da-phong-thuy/${jar.slug}`} className="inline-flex min-h-10 items-center rounded-full border border-gilded/60 px-4 text-sm text-ivory hover:border-antique-gold hover:text-antique-gold">Xem chi tiết</Link>
        <a href={buildStoneJarContactHref(jar.name, `/lo-da-phong-thuy/${jar.slug}`)} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-antique-gold px-4 text-sm font-semibold text-obsidian"><MessageCircleMore size={16} aria-hidden="true" />Liên hệ tư vấn</a></div>
    </div>
  </article>;
}
