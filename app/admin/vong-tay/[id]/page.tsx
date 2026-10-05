import Link from "next/link";

import { AdminBraceletActions } from "@/components/bracelets/AdminBraceletActions";
import { MarkdownContent } from "@/components/blog/MarkdownContent";
import { StoneImage } from "@/components/stones/StoneImage";
import { requireAdminProfile } from "@/lib/auth/admin";
import { getAdminBracelet } from "@/lib/queries/bracelets";
import { braceletAvailabilityLabels } from "@/lib/validations/bracelets";
import { stoneStatusLabels } from "@/lib/validations/stones";

export const dynamic = "force-dynamic";

function Row({ label, value }: { label: string; value: string | null }) {
  return value ? <p><span className="text-stone-mist">{label}: </span>{value}</p> : null;
}

export default async function AdminBraceletDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminProfile();
  const { id } = await params;
  const bracelet = await getAdminBracelet(id);
  return (
    <main className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin/vong-tay" className="text-sm text-antique-gold">← Quản lý vòng tay</Link>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div><h1 className="font-serif text-5xl text-ivory">{bracelet.name}</h1><p className="mt-2 text-stone-mist">{bracelet.product_code} · {stoneStatusLabels[bracelet.status]} · /{bracelet.slug}</p></div>
          <AdminBraceletActions item={bracelet} />
        </div>
        <section className="mt-8 grid gap-8 rounded-lg border border-gilded/40 bg-card-deep/75 p-5 lg:grid-cols-[320px_1fr]">
          <StoneImage src={bracelet.featured_image} alt={bracelet.name} />
          <div>
            <p className="text-antique-gold">{bracelet.price == null ? "Liên hệ tư vấn" : `${bracelet.price.toLocaleString("vi-VN")}đ`} · {braceletAvailabilityLabels[bracelet.availability]}</p>
            <p className="mt-3 text-lg text-stone-mist">{bracelet.short_description}</p>
            <div className="mt-5 grid gap-2 text-sm text-ivory">
              <Row label="Loại đá" value={bracelet.stones.map((stone) => stone.name).join(", ")} />
              <Row label="Kích thước hạt" value={bracelet.bead_sizes_mm.map((size) => `${size} mm`).join(", ")} />
              <Row label="Kích cỡ vòng" value={bracelet.wrist_sizes_cm.join(", ")} />
              <Row label="Mệnh phù hợp" value={bracelet.suitable_elements.join(", ") || null} />
            </div>
            <div className="mt-8"><MarkdownContent content={bracelet.content} /></div>
          </div>
        </section>
      </div>
    </main>
  );
}
