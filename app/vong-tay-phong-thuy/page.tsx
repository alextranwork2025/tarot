import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { BraceletCard } from "@/components/bracelets/BraceletCard";
import { getBraceletFilterOptions, getPublishedBracelets } from "@/lib/queries/bracelets";

export const metadata: Metadata = {
  title: "Vòng tay phong thủy | Huyền Cảnh",
  description: "Xem các mẫu vòng tay phong thủy, loại đá, kích thước hạt và nhắn tư vấn riêng với Huyền Cảnh.",
};

type Props = { searchParams: Promise<{ q?: string; stoneId?: string; beadSize?: string; page?: string }> };

function pageHref(params: Awaited<Props["searchParams"]>, page: number) {
  const query = new URLSearchParams(Object.entries({ ...params, page: String(page) }).filter(([, value]) => value) as [string, string][]);
  return `/vong-tay-phong-thuy?${query}`;
}

export default async function BraceletsPage({ searchParams }: Props) {
  const params = await searchParams;
  const [filters, result] = await Promise.all([
    getBraceletFilterOptions(),
    getPublishedBracelets({ q: params.q, stoneId: params.stoneId, beadSize: params.beadSize, page: Number(params.page) || 1 }),
  ]);
  const pages = Math.max(1, Math.ceil(result.count / result.pageSize));

  return (
    <>
      <Header />
      <main className="min-h-screen px-5 pb-24 pt-32 md:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-antique-gold">Sản phẩm tư vấn riêng</p>
          <h1 className="mt-4 font-serif text-5xl text-ivory md:text-7xl">Vòng tay phong thủy</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-mist">Các mẫu vòng tay được giới thiệu để bạn xem chất liệu, kích thước và ý nghĩa biểu tượng trước khi nhắn Huyền Cảnh tư vấn.</p>

          <form className="mt-10 grid gap-3 border-y border-gilded/30 py-5 md:grid-cols-[1fr_220px_180px_auto]">
            <input name="q" defaultValue={params.q} placeholder="Tìm theo tên vòng tay" className="min-h-11 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory" />
            <select name="stoneId" defaultValue={params.stoneId ?? ""} className="min-h-11 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory">
              <option value="">Tất cả loại đá</option>
              {filters.stones.map((stone) => <option key={stone.id} value={stone.id}>{stone.name}</option>)}
            </select>
            <select name="beadSize" defaultValue={params.beadSize ?? ""} className="min-h-11 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory">
              <option value="">Mọi cỡ hạt</option>
              {filters.beadSizes.map((size) => <option key={size} value={String(size)}>{size} mm</option>)}
            </select>
            <button className="min-h-11 rounded-full bg-antique-gold px-5 text-sm font-semibold text-obsidian">Lọc</button>
          </form>

          {result.bracelets.length ? (
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {result.bracelets.map((bracelet) => <BraceletCard key={bracelet.id} bracelet={bracelet} />)}
            </div>
          ) : (
            <section className="mt-10 rounded-lg border border-gilded/40 bg-card-deep/75 p-10 text-center text-stone-mist">Không tìm thấy vòng tay phù hợp.</section>
          )}
          <nav className="mt-10 flex justify-between text-sm">
            {result.page > 1 ? <Link href={pageHref(params, result.page - 1)} className="text-antique-gold">← Trang trước</Link> : <span />}
            {result.page < pages ? <Link href={pageHref(params, result.page + 1)} className="text-antique-gold">Trang sau →</Link> : <span />}
          </nav>
        </div>
      </main>
      <Footer />
    </>
  );
}
