import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { StoneImage } from "@/components/stones/StoneImage";
import { braceletAvailabilityLabels } from "@/lib/validations/bracelets";
import type { BraceletSummary } from "@/types/bracelets";

const priceText = (price: number | null) => price == null ? "Liên hệ tư vấn" : `${price.toLocaleString("vi-VN")}đ`;

export function BraceletCard({ bracelet }: { bracelet: BraceletSummary }) {
  const href = `/vong-tay-phong-thuy/${bracelet.slug}`;
  return (
    <article className="grid gap-4 rounded-lg border border-gilded/40 bg-card-deep/75 p-4 transition hover:-translate-y-1 hover:border-fox-red/80">
      <Link href={href} aria-label={`Xem chi tiết ${bracelet.name}`}>
        <StoneImage src={bracelet.featured_image} alt={bracelet.name} />
      </Link>
      <div>
        <div className="flex flex-wrap gap-2">
          {bracelet.stones.slice(0, 3).map((stone) => (
            <span key={stone.id} className="rounded-full border border-antique-gold/35 px-3 py-1 text-xs text-antique-gold">{stone.name}</span>
          ))}
        </div>
        <Link href={href} className="mt-4 block font-serif text-3xl text-ivory hover:text-antique-gold">{bracelet.name}</Link>
        <dl className="mt-4 grid gap-2 text-sm text-stone-mist">
          <div className="flex justify-between gap-4"><dt>Loại đá</dt><dd className="text-right text-ivory">{bracelet.stones.map((stone) => stone.name).join(", ") || "Đang cập nhật"}</dd></div>
          <div className="flex justify-between gap-4"><dt>Kích thước hạt</dt><dd className="text-right text-ivory">{bracelet.bead_sizes_mm.map((size) => `${size} mm`).join(", ")}</dd></div>
          <div className="flex justify-between gap-4"><dt>Tình trạng</dt><dd className="text-right text-ivory">{braceletAvailabilityLabels[bracelet.availability]}</dd></div>
        </dl>
        <p className="mt-4 font-serif text-2xl text-antique-gold">{priceText(bracelet.price)}</p>
        <Link href={href} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full border border-gilded/60 px-4 text-sm text-ivory hover:border-antique-gold hover:text-antique-gold">
          Xem chi tiết <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
