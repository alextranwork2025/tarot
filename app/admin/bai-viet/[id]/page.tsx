import { format } from "date-fns";
import Link from "next/link";

import { AdminBlogActions } from "@/components/blog/AdminBlogActions";
import { BlogImage } from "@/components/blog/BlogImage";
import { MarkdownContent } from "@/components/blog/MarkdownContent";
import { requireAdminProfile } from "@/lib/auth/admin";
import { getAdminBlogPost } from "@/lib/queries/blog";
import { blogStatusLabels } from "@/lib/validations/blog";

export const dynamic = "force-dynamic";

export default async function AdminBlogPostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminProfile();
  const { id } = await params;
  const post = await getAdminBlogPost(id);

  return (
    <main className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/admin/bai-viet" className="text-sm text-antique-gold">← Quản lý bài viết</Link>
            <h1 className="mt-4 font-serif text-5xl text-ivory">{post.title}</h1>
          </div>
          <Link href={`/admin/bai-viet/${post.id}/chinh-sua`} className="inline-flex min-h-10 items-center justify-center rounded-full border border-antique-gold px-4 text-sm text-antique-gold hover:bg-antique-gold hover:text-obsidian">
            Chỉnh sửa
          </Link>
        </div>

        <section className="mt-8 grid gap-6 rounded-lg border border-gilded/40 bg-card-deep/75 p-5">
          <BlogImage src={post.cover_image_url} alt={post.title} priority />
          <div className="grid gap-2 text-sm text-stone-mist">
            <p className="text-antique-gold">/{post.slug}</p>
            <p>{blogStatusLabels[post.status]} · {post.profiles?.full_name ?? "Không rõ tác giả"}</p>
            <p>Xuất bản: {post.published_at ? format(new Date(post.published_at), "dd/MM/yyyy HH:mm") : "Chưa có"} · Cập nhật: {format(new Date(post.updated_at), "dd/MM/yyyy HH:mm")}</p>
            {post.excerpt ? <p>{post.excerpt}</p> : null}
          </div>
          <AdminBlogActions post={post} />
          <MarkdownContent content={post.content} />
        </section>
      </div>
    </main>
  );
}
