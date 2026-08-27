import Link from "next/link";

import { BlogPostForm } from "@/components/blog/BlogPostForm";
import { requireAdminProfile } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export default async function CreateBlogPostPage() {
  await requireAdminProfile();

  return (
    <main className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin/bai-viet" className="text-sm text-antique-gold">← Quản lý bài viết</Link>
        <h1 className="mt-4 font-serif text-5xl text-ivory">Tạo bài viết</h1>
        <div className="mt-8">
          <BlogPostForm />
        </div>
      </div>
    </main>
  );
}
