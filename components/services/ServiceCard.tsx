import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

import { ServiceImage } from "@/components/services/ServiceImage";
import { ServiceSelectButton } from "@/components/services/ServiceSelectButton";
import type { PublicService } from "@/lib/queries/services";

function formatPrice(price: number) {
  return price === 0 ? "Giá đang cập nhật" : `${price.toLocaleString("vi-VN")}đ`;
}

export function ServiceCard({ service }: { service: PublicService }) {
  const benefits = service.benefits?.split(/\r?\n/).map((item) => item.trim()).filter(Boolean).slice(0, 3) ?? [];
  const formats = service.delivery_modes.map((mode) => mode === "online" ? "Online" : "Trực tiếp").join(" · ");
  return (
    <article className="relative grid content-start gap-5 rounded-lg border border-gilded/40 bg-card-deep/78 p-4 transition hover:-translate-y-1 hover:border-antique-gold/80 hover:shadow-lg hover:shadow-wine/15">
      {service.is_featured ? <span className="absolute right-3 top-3 z-10 rounded-full border border-antique-gold/60 bg-obsidian/90 px-3 py-1 text-xs font-semibold text-antique-gold">Phổ biến</span> : null}
      <ServiceImage src={service.cover_image_url} alt={service.name} sizes="(min-width: 1024px) 30vw, 100vw" />
      <div className="grid gap-3">
        <h2 className="font-serif text-3xl leading-tight text-ivory">{service.name}</h2>
        <p className="text-sm leading-6 text-stone-mist">
          {service.short_description ?? service.description ?? "Thông tin chi tiết đang được cập nhật."}
        </p>
        <p className="text-sm text-antique-gold">
          {service.duration_minutes} phút · {formats} · {formatPrice(service.price)}
        </p>
        {service.suitable_for ? <p className="text-sm leading-6 text-stone-mist"><span className="text-ivory">Phù hợp:</span> {service.suitable_for}</p> : null}
        {benefits.length ? <ul className="grid gap-2 text-sm text-stone-mist">{benefits.map((benefit) => <li key={benefit} className="flex gap-2"><Check className="mt-0.5 shrink-0 text-antique-gold" size={15} aria-hidden="true" /><span>{benefit}</span></li>)}</ul> : null}
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href={`/dich-vu/${service.slug}`} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-gilded/60 px-4 text-sm text-ivory hover:border-antique-gold hover:text-antique-gold">
            Xem chi tiết
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <ServiceSelectButton serviceId={service.id} />
        </div>
      </div>
    </article>
  );
}
