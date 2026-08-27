import { format } from "date-fns";
import Link from "next/link";

import { AdminBlogActions } from "@/components/blog/AdminBlogActions";
import { BlogImage } from "@/components/blog/BlogImage";
import { requireAdminProfile } from "@/lib/auth/admin";
import { getAdminBlogPosts, parseBlogStatus } from "@/lib/queries/blog";
import { blogStatusLabels } from "@/lib/validations/blog";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    sort?: "newest" | "oldest" | "published";
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
  return `/admin/bai-viet?${query.toString()}`;
}

export default async function AdminBlogPostsPage({ searchParams }: Props) {
  await requireAdminProfile();
  const params = await searchParams;
  const status = parseBlogStatus(params.status);
  const result = await getAdminBlogPosts({
    q: params.q,
    status,
    sort: params.sort,
    page: params.page ? Number(params.page) : 1,
  });
  const totalPages = Math.max(1, Math.ceil(result.count / result.pageSize));

  return (
    <main className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/admin" className="text-sm text-antique-gold">← Dashboard</Link>
            <h1 className="mt-4 font-serif text-5xl text-ivory">Quản lý bài viết</h1>
          </div>
          <Link href="/admin/bai-viet/tao-moi" className="inline-flex min-h-11 items-center justify-center rounded-full bg-antique-gold px-5 text-sm font-semibold text-obsidian hover:bg-ivory">
            Tạo bài viết
          </Link>
        </div>

        <form className="mt-8 grid gap-3 rounded-lg border border-gilded/40 bg-card-deep/75 p-4 md:grid-cols-4">
          <input name="q" defaultValue={params.q} placeholder="Tìm theo tiêu đề hoặc slug" className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory md:col-span-2" />
          <select name="status" defaultValue={status} className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory">
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(blogStatusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
          <select name="sort" defaultValue={params.sort ?? "newest"} className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory">
            <option value="newest">Mới cập nhật</option>
            <option value="oldest">Cũ nhất</option>
            <option value="published">Ngày xuất bản</option>
          </select>
          <button className="min-h-10 rounded-full bg-antique-gold px-4 text-sm text-obsidian md:col-start-4">Lọc</button>
        </form>

        <p className="mt-6 text-sm text-stone-mist">Tổng {result.count} bài viết · Trang {result.page}/{totalPages}</p>

        {result.posts.length === 0 ? (
          <section className="mt-6 rounded-lg border border-gilded/40 bg-card-deep/75 p-8 text-center text-stone-mist">
            Chưa có bài viết phù hợp.
          </section>
        ) : (
          <div className="mt-6 grid gap-4">
            {result.posts.map((post) => (
              <article key={post.id} className="grid gap-4 rounded-lg border border-gilded/40 bg-card-deep/75 p-4 md:grid-cols-[180px_1fr_auto]">
                <BlogImage src={post.cover_image_url} alt={post.title} />
                <div className="text-sm text-stone-mist">
                  <h2 className="font-serif text-3xl leading-tight text-ivory">{post.title}</h2>
                  <p className="mt-1 text-antique-gold">/{post.slug}</p>
                  <p className="mt-2">{post.excerpt ?? "Chưa có mô tả ngắn."}</p>
                  <p className="mt-3">
                    {blogStatusLabels[post.status]} · {post.profiles?.full_name ?? "Không rõ tác giả"} · Xuất bản: {post.published_at ? format(new Date(post.published_at), "dd/MM/yyyy HH:mm") : "Chưa có"} · Cập nhật: {format(new Date(post.updated_at), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
                <AdminBlogActions post={post} compact />
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
