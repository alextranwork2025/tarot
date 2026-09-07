import { format } from "date-fns";
import Link from "next/link";

import { AdminServiceActions } from "@/components/services/AdminServiceActions";
import { ServiceImage } from "@/components/services/ServiceImage";
import { MarkdownContent } from "@/components/blog/MarkdownContent";
import { requireAdminProfile } from "@/lib/auth/admin";
import { getAdminService } from "@/lib/queries/services";
import { serviceStatusLabels } from "@/lib/validations/services";

export const dynamic = "force-dynamic";

export default async function AdminServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminProfile();
  const { id } = await params;
  const service = await getAdminService(id);

  return (
    <main className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/admin/dich-vu" className="text-sm text-antique-gold">← Quản lý dịch vụ</Link>
            <h1 className="mt-4 font-serif text-5xl text-ivory">{service.name}</h1>
          </div>
          <Link href={`/admin/dich-vu/${service.id}/chinh-sua`} className="inline-flex min-h-10 items-center justify-center rounded-full border border-antique-gold px-4 text-sm text-antique-gold hover:bg-antique-gold hover:text-obsidian">
            Chỉnh sửa
          </Link>
        </div>

        <section className="mt-8 grid gap-6 rounded-lg border border-gilded/40 bg-card-deep/75 p-5">
          <ServiceImage src={service.cover_image_url} alt={service.name} priority />
          <div className="grid gap-2 text-sm text-stone-mist">
            <p className="text-antique-gold">/{service.slug}</p>
            <p>{serviceStatusLabels[service.status]} · {service.is_active ? "Đang bật" : "Đang tắt"} · Thứ tự {service.display_order}</p>
            <p>{service.duration_minutes} phút · {service.price === 0 ? "Giá đang cập nhật" : `${service.price.toLocaleString("vi-VN")}đ`}</p>
            <p>Xuất bản: {service.published_at ? format(new Date(service.published_at), "dd/MM/yyyy HH:mm") : "Chưa có"} · Cập nhật: {service.updated_at ? format(new Date(service.updated_at), "dd/MM/yyyy HH:mm") : "Chưa có"}</p>
            {service.short_description ? <p>{service.short_description}</p> : null}
          </div>
          <AdminServiceActions service={service} />
          {service.content ? <MarkdownContent content={service.content} /> : null}
        </section>
      </div>
    </main>
  );
}
