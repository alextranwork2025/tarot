import Link from "next/link";

import { BlogCard } from "@/components/blog/BlogCard";
import { SectionHeading } from "@/components/SectionHeading";
import { getLatestPublishedBlogPosts } from "@/lib/queries/blog";

export async function BlogHighlights() {
  const posts = await getLatestPublishedBlogPosts(3);

  if (posts.length === 0) {
    return null;
  }

  return (
    <section id="blog" className="px-5 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Góc chia sẻ"
            title="Bài viết mới"
            description="Những mảnh ghi chú về Tarot, biểu tượng và các câu hỏi nội tâm đang cần một chút ánh sáng."
          />
          <Link href="/blog" className="inline-flex min-h-11 items-center justify-center rounded-full border border-antique-gold px-5 text-sm text-antique-gold hover:bg-antique-gold hover:text-obsidian">
            Xem tất cả bài viết
          </Link>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {posts.map((post) => <BlogCard key={post.id} post={post} />)}
        </div>
      </div>
    </section>
  );
}
