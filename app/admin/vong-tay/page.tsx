import { format } from "date-fns";
import Link from "next/link";

import { AdminBraceletActions } from "@/components/bracelets/AdminBraceletActions";
import { StoneImage } from "@/components/stones/StoneImage";
import { requireAdminProfile } from "@/lib/auth/admin";
import { getBraceletFilterOptions, getAdminBracelets, parseBraceletSort, parseBraceletStatus } from "@/lib/queries/bracelets";
import { braceletAvailabilityLabels } from "@/lib/validations/bracelets";
import { stoneStatusLabels } from "@/lib/validations/stones";

export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<{ q?: string; status?: string; stoneId?: string; sort?: string; page?: string }> };

function pageHref(params: Awaited<Props["searchParams"]>, page: number) {
  const query = new URLSearchParams(Object.entries(params).filter(([key, value]) => key !== "page" && value) as [string, string][]);
  query.set("page", String(page));
  return `/admin/vong-tay?${query}`;
}

export default async function AdminBraceletsPage({ searchParams }: Props) {
  await requireAdminProfile();
  const params = await searchParams;
  const status = parseBraceletStatus(params.status);
  const sort = parseBraceletSort(params.sort);
  const [filters, result] = await Promise.all([
    getBraceletFilterOptions(),
    getAdminBracelets({ q: params.q, status, stoneId: params.stoneId, sort, page: Number(params.page) || 1 }),
  ]);
  const pages = Math.max(1, Math.ceil(result.count / result.pageSize));

  return (
    <main className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div><Link href="/admin" className="text-sm text-antique-gold">← Dashboard</Link><h1 className="mt-4 font-serif text-5xl text-ivory">Quản lý vòng tay</h1></div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/cau-hinh-tu-van" className="inline-flex min-h-11 items-center justify-center rounded-full border border-gilded/60 px-5 text-sm text-ivory hover:border-antique-gold">Cấu hình tư vấn</Link>
            <Link href="/admin/vong-tay/tao-moi" className="inline-flex min-h-11 items-center justify-center rounded-full bg-antique-gold px-5 text-sm font-semibold text-obsidian">Tạo vòng tay</Link>
          </div>
        </div>
        <form className="mt-8 grid gap-3 rounded-lg border border-gilded/40 bg-card-deep/75 p-4 md:grid-cols-5">
          <input name="q" defaultValue={params.q} placeholder="Tìm tên hoặc mã" className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory md:col-span-2" />
          <select name="stoneId" defaultValue={params.stoneId ?? ""} className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory"><option value="">Tất cả loại đá</option>{filters.stones.map((stone) => <option key={stone.id} value={stone.id}>{stone.name}</option>)}</select>
          <select name="status" defaultValue={status} className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory"><option value="all">Tất cả trạng thái</option>{Object.entries(stoneStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <select name="sort" defaultValue={sort} className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory"><option value="newest">Mới cập nhật</option><option value="oldest">Cũ nhất</option><option value="display">Thứ tự hiển thị</option></select>
          <button className="min-h-10 rounded-full bg-antique-gold px-4 text-sm text-obsidian md:col-start-5">Lọc</button>
        </form>
        <p className="mt-6 text-sm text-stone-mist">Tổng {result.count} vòng tay · Trang {result.page}/{pages}</p>
        {result.bracelets.length === 0 ? (
          <section className="mt-6 rounded-lg border border-gilded/40 bg-card-deep/75 p-8 text-center text-stone-mist">Chưa có vòng tay phù hợp.</section>
        ) : (
          <div className="mt-6 grid gap-4">
            {result.bracelets.map((bracelet) => (
              <article key={bracelet.id} className="grid gap-4 rounded-lg border border-gilded/40 bg-card-deep/75 p-4 md:grid-cols-[160px_1fr_auto]">
                <StoneImage src={bracelet.featured_image} alt={bracelet.name} sizes="160px" />
                <div className="text-sm text-stone-mist">
                  <h2 className="font-serif text-3xl text-ivory">{bracelet.name}</h2>
                  <p className="text-antique-gold">{bracelet.product_code}</p>
                  <p className="mt-2">Đá: {bracelet.stones.map((stone) => stone.name).join(", ") || "Chưa chọn"}</p>
                  <p>Kích thước hạt: {bracelet.bead_sizes_mm.map((size) => `${size} mm`).join(", ")}</p>
                  <p>Giá: {bracelet.price == null ? "Liên hệ tư vấn" : `${bracelet.price.toLocaleString("vi-VN")}đ`} · {braceletAvailabilityLabels[bracelet.availability]}</p>
                  <p className="mt-2">{stoneStatusLabels[bracelet.status]} · Cập nhật {format(new Date(bracelet.updated_at), "dd/MM/yyyy HH:mm")}</p>
                </div>
                <AdminBraceletActions item={bracelet} compact />
              </article>
            ))}
          </div>
        )}
        <nav className="mt-8 flex justify-between text-sm">{result.page > 1 ? <Link href={pageHref(params, result.page - 1)} className="text-antique-gold">← Trang trước</Link> : <span />}{result.page < pages ? <Link href={pageHref(params, result.page + 1)} className="text-antique-gold">Trang sau →</Link> : <span />}</nav>
      </div>
    </main>
  );
}
