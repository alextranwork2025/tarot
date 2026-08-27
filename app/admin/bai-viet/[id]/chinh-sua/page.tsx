import Link from "next/link";

import { BlogPostForm } from "@/components/blog/BlogPostForm";
import { requireAdminProfile } from "@/lib/auth/admin";
import { getAdminBlogPost } from "@/lib/queries/blog";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminProfile();
  const { id } = await params;
  const post = await getAdminBlogPost(id);

  return (
    <main className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href={`/admin/bai-viet/${post.id}`} className="text-sm text-antique-gold">← Chi tiết bài viết</Link>
        <h1 className="mt-4 font-serif text-5xl text-ivory">Chỉnh sửa bài viết</h1>
        <div className="mt-8">
          <BlogPostForm post={post} />
        </div>
      </div>
    </main>
  );
}
