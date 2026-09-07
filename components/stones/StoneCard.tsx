import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { StoneImage } from "@/components/stones/StoneImage";
import type { StoneSummary } from "@/types/stones";

export function StoneCard({ stone }: { stone: StoneSummary }) {
  return <article className="grid gap-4 rounded-lg border border-gilded/40 bg-card-deep/75 p-4 transition hover:-translate-y-1 hover:border-fox-red/80">
    <StoneImage src={stone.featured_image} alt={stone.name} square />
    <div><div className="flex flex-wrap gap-2">{stone.elements.slice(0, 3).map((item) => <span key={item} className="rounded-full border border-antique-gold/35 px-3 py-1 text-xs text-antique-gold">{item}</span>)}</div>
      <h2 className="mt-4 font-serif text-3xl text-ivory">{stone.name}</h2>
      <p className="mt-3 text-sm leading-7 text-stone-mist">{stone.short_description ?? "Thông tin đang được cập nhật."}</p>
      <Link href={`/da-phong-thuy/${stone.slug}`} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full border border-gilded/60 px-4 text-sm text-ivory hover:border-antique-gold hover:text-antique-gold">Khám phá <ArrowRight size={16} aria-hidden="true" /></Link>
    </div>
  </article>;
}
