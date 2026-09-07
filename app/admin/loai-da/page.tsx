import { format } from "date-fns";
import Link from "next/link";

import { AdminStoneActions } from "@/components/stones/AdminStoneActions";
import { StoneImage } from "@/components/stones/StoneImage";
import { requireAdminProfile } from "@/lib/auth/admin";
import { getAdminStones, parseStoneSort, parseStoneStatus } from "@/lib/queries/stones";
import { stoneStatusLabels } from "@/lib/validations/stones";

export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<{ q?: string; status?: string; element?: string; sort?: string; page?: string }> };
function pageHref(params: Awaited<Props["searchParams"]>, page: number) { const query = new URLSearchParams(Object.entries(params).filter(([key, value]) => key !== "page" && value) as [string, string][]); query.set("page", String(page)); return `/admin/loai-da?${query}`; }

export default async function AdminStonesPage({ searchParams }: Props) {
  await requireAdminProfile(); const params = await searchParams; const status = parseStoneStatus(params.status); const sort = parseStoneSort(params.sort);
  const result = await getAdminStones({ q: params.q, status, element: params.element, sort, page: Number(params.page) || 1 }); const pages = Math.max(1, Math.ceil(result.count / result.pageSize));
  return <main className="min-h-screen px-5 py-10 md:px-8"><div className="mx-auto max-w-7xl"><div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><Link href="/admin" className="text-sm text-antique-gold">← Dashboard</Link><h1 className="mt-4 font-serif text-5xl text-ivory">Quản lý loại đá</h1></div><Link href="/admin/loai-da/tao-moi" className="inline-flex min-h-11 items-center justify-center rounded-full bg-antique-gold px-5 text-sm font-semibold text-obsidian">Tạo loại đá</Link></div>
    <form className="mt-8 grid gap-3 rounded-lg border border-gilded/40 bg-card-deep/75 p-4 md:grid-cols-5"><input name="q" defaultValue={params.q} placeholder="Tìm tên hoặc slug" className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory md:col-span-2" /><select name="status" defaultValue={status} className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory"><option value="all">Tất cả trạng thái</option>{Object.entries(stoneStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><input name="element" defaultValue={params.element} placeholder="Lọc theo mệnh" className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory" /><select name="sort" defaultValue={sort} className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory"><option value="newest">Mới cập nhật</option><option value="oldest">Cũ nhất</option><option value="published">Mới xuất bản</option></select><button className="min-h-10 rounded-full bg-antique-gold px-4 text-sm text-obsidian md:col-start-5">Lọc</button></form>
    <p className="mt-6 text-sm text-stone-mist">Tổng {result.count} loại đá · Trang {result.page}/{pages}</p>{result.stones.length === 0 ? <section className="mt-6 rounded-lg border border-gilded/40 bg-card-deep/75 p-8 text-center text-stone-mist">Chưa có loại đá phù hợp.</section> : <div className="mt-6 grid gap-4">{result.stones.map((stone) => <article key={stone.id} className="grid gap-4 rounded-lg border border-gilded/40 bg-card-deep/75 p-4 md:grid-cols-[150px_1fr_auto]"><StoneImage src={stone.featured_image} alt={stone.name} square sizes="150px" /><div className="text-sm text-stone-mist"><h2 className="font-serif text-3xl text-ivory">{stone.name}</h2><p className="text-antique-gold">/{stone.slug}</p><p className="mt-2">{stone.elements.join(", ") || "Chưa xác định mệnh"}</p><p className="mt-2">{stoneStatusLabels[stone.status]} · Cập nhật {format(new Date(stone.updated_at), "dd/MM/yyyy HH:mm")}</p></div><AdminStoneActions item={stone} kind="stone" compact /></article>)}</div>}
    <nav className="mt-8 flex justify-between text-sm">{result.page > 1 ? <Link href={pageHref(params, result.page - 1)} className="text-antique-gold">← Trang trước</Link> : <span />}{result.page < pages ? <Link href={pageHref(params, result.page + 1)} className="text-antique-gold">Trang sau →</Link> : <span />}</nav>
  </div></main>;
}
