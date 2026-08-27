import Link from "next/link";

import { BlogCard } from "@/components/blog/BlogCard";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getPublishedBlogPosts } from "@/lib/queries/blog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog Tarot | Huyền Cảnh",
  description: "Các bài viết chia sẻ về Tarot, biểu tượng và hành trình nội tâm từ Huyền Cảnh.",
};

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams;
  const result = await getPublishedBlogPosts({ page: params.page ? Number(params.page) : 1, pageSize: 9 });
  const totalPages = Math.max(1, Math.ceil(result.count / result.pageSize));

  return (
    <>
      <Header />
      <main className="px-5 pb-20 pt-32 md:px-8">
        <section className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-antique-gold">Góc chia sẻ</p>
          <h1 className="mt-4 font-serif text-5xl text-ivory md:text-6xl">Blog Tarot</h1>
          <p className="mt-5 max-w-2xl text-stone-mist">Những ghi chú chậm rãi về lá bài, biểu tượng và cách Tarot mở ra cuộc đối thoại với chính mình.</p>
          {result.posts.length === 0 ? (
            <div className="mt-12 rounded-lg border border-gilded/40 bg-card-deep/75 p-8 text-stone-mist">
              Chưa có bài viết nào được xuất bản.
            </div>
          ) : (
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {result.posts.map((post) => <BlogCard key={post.id} post={post} />)}
            </div>
          )}
          <nav className="mt-10 flex items-center justify-between text-sm">
            {result.page > 1 ? <Link className="text-antique-gold" href={`/blog?page=${result.page - 1}`}>← Trang trước</Link> : <span />}
            {result.page < totalPages ? <Link className="text-antique-gold" href={`/blog?page=${result.page + 1}`}>Trang sau →</Link> : <span />}
          </nav>
        </section>
      </main>
      <Footer />
    </>
  );
}
