import { format } from "date-fns";
import Link from "next/link";

import { BlogImage } from "@/components/blog/BlogImage";
import type { BlogPostSummary } from "@/types/blog";

export function BlogCard({ post }: { post: BlogPostSummary }) {
  return (
    <article className="grid gap-4">
      <BlogImage src={post.cover_image_url} alt={post.title} />
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-antique-gold">
          {post.published_at ? format(new Date(post.published_at), "dd/MM/yyyy") : "Chưa xuất bản"}
        </p>
        <h3 className="mt-2 font-serif text-3xl leading-tight text-ivory">{post.title}</h3>
        {post.excerpt ? <p className="mt-3 text-sm leading-7 text-stone-mist">{post.excerpt}</p> : null}
        <Link href={`/blog/${post.slug}`} className="mt-4 inline-flex min-h-10 items-center rounded-full border border-antique-gold px-4 text-sm text-antique-gold hover:bg-antique-gold hover:text-obsidian">
          Đọc thêm
        </Link>
      </div>
    </article>
  );
}
