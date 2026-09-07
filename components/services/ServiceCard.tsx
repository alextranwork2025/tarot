import { ArrowRight, CalendarDays } from "lucide-react";
import Link from "next/link";

import { ServiceImage } from "@/components/services/ServiceImage";
import type { PublicService } from "@/lib/queries/services";

function formatPrice(price: number) {
  return price === 0 ? "Giá đang cập nhật" : `${price.toLocaleString("vi-VN")}đ`;
}

export function ServiceCard({ service }: { service: PublicService }) {
  return (
    <article className="grid gap-5 rounded-lg border border-gilded/40 bg-card-deep/78 p-4 transition hover:-translate-y-1 hover:border-antique-gold/80">
      <ServiceImage src={service.cover_image_url} alt={service.name} sizes="(min-width: 1024px) 30vw, 100vw" />
      <div className="grid gap-3">
        <h2 className="font-serif text-3xl leading-tight text-ivory">{service.name}</h2>
        <p className="text-sm leading-6 text-stone-mist">
          {service.short_description ?? service.description ?? "Thông tin chi tiết đang được cập nhật."}
        </p>
        <p className="text-sm text-antique-gold">
          {service.duration_minutes} phút · {formatPrice(service.price)}
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href={`/dich-vu/${service.slug}`} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-gilded/60 px-4 text-sm text-ivory hover:border-antique-gold hover:text-antique-gold">
            Xem chi tiết
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link href={`/dat-lich?service=${service.id}`} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-antique-gold px-4 text-sm font-semibold text-obsidian hover:bg-ivory">
            <CalendarDays size={16} aria-hidden="true" />
            Đặt lịch
          </Link>
        </div>
      </div>
    </article>
  );
}
