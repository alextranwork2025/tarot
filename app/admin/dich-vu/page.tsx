import { format } from "date-fns";
import Link from "next/link";

import { AdminServiceActions } from "@/components/services/AdminServiceActions";
import { ServiceImage } from "@/components/services/ServiceImage";
import { requireAdminProfile } from "@/lib/auth/admin";
import { getAdminServices, parseServiceStatus } from "@/lib/queries/services";
import { serviceStatusLabels } from "@/lib/validations/services";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
};

function pageHref(params: Awaited<Props["searchParams"]>, page: number) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value && key !== "page") {
      query.set(key, value);
    }
  });
  query.set("page", String(page));
  return `/admin/dich-vu?${query.toString()}`;
}

export default async function AdminServicesPage({ searchParams }: Props) {
  await requireAdminProfile();
  const params = await searchParams;
  const status = parseServiceStatus(params.status);
  const result = await getAdminServices({
    q: params.q,
    status,
    page: params.page ? Number(params.page) : 1,
  });
  const totalPages = Math.max(1, Math.ceil(result.count / result.pageSize));

  return (
    <main className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/admin" className="text-sm text-antique-gold">← Dashboard</Link>
            <h1 className="mt-4 font-serif text-5xl text-ivory">Quản lý dịch vụ</h1>
          </div>
          <Link href="/admin/dich-vu/tao-moi" className="inline-flex min-h-11 items-center justify-center rounded-full bg-antique-gold px-5 text-sm font-semibold text-obsidian hover:bg-ivory">
            Tạo dịch vụ
          </Link>
        </div>

        <form className="mt-8 grid gap-3 rounded-lg border border-gilded/40 bg-card-deep/75 p-4 md:grid-cols-4">
          <input name="q" defaultValue={params.q} placeholder="Tìm theo tên hoặc slug" className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory md:col-span-2" />
          <select name="status" defaultValue={status} className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory">
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(serviceStatusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
          <button className="min-h-10 rounded-full bg-antique-gold px-4 text-sm text-obsidian">Lọc</button>
        </form>

        <p className="mt-6 text-sm text-stone-mist">Tổng {result.count} dịch vụ · Trang {result.page}/{totalPages}</p>

        {result.services.length === 0 ? (
          <section className="mt-6 rounded-lg border border-gilded/40 bg-card-deep/75 p-8 text-center text-stone-mist">
            Chưa có dịch vụ phù hợp.
          </section>
        ) : (
          <div className="mt-6 grid gap-4">
            {result.services.map((service) => (
              <article key={service.id} className="grid gap-4 rounded-lg border border-gilded/40 bg-card-deep/75 p-4 md:grid-cols-[180px_1fr_auto]">
                <ServiceImage src={service.cover_image_url} alt={service.name} sizes="180px" />
                <div className="text-sm text-stone-mist">
                  <h2 className="font-serif text-3xl leading-tight text-ivory">{service.name}</h2>
                  <p className="mt-1 text-antique-gold">/{service.slug}</p>
                  <p className="mt-2">{service.short_description ?? service.description ?? "Chưa có mô tả ngắn."}</p>
                  <p className="mt-3">
                    {serviceStatusLabels[service.status]} · {service.is_active ? "Đang bật" : "Đang tắt"} · {service.duration_minutes} phút · {service.price === 0 ? "Giá đang cập nhật" : `${service.price.toLocaleString("vi-VN")}đ`}
                  </p>
                  <p className="mt-1">
                    Xuất bản: {service.published_at ? format(new Date(service.published_at), "dd/MM/yyyy HH:mm") : "Chưa có"} · Cập nhật: {service.updated_at ? format(new Date(service.updated_at), "dd/MM/yyyy HH:mm") : "Chưa có"}
                  </p>
                </div>
                <AdminServiceActions service={service} compact />
              </article>
            ))}
          </div>
        )}

        <nav className="mt-8 flex items-center justify-between text-sm">
          {result.page > 1 ? <Link className="text-antique-gold" href={pageHref(params, result.page - 1)}>← Trang trước</Link> : <span />}
          {result.page < totalPages ? <Link className="text-antique-gold" href={pageHref(params, result.page + 1)}>Trang sau →</Link> : <span />}
        </nav>
      </div>
    </main>
  );
}
