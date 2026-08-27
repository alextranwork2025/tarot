import { format } from "date-fns";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogImage } from "@/components/blog/BlogImage";
import { MarkdownContent } from "@/components/blog/MarkdownContent";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getBlogPostBySlug } from "@/lib/queries/blog";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {};
  }

  const title = `${post.title} | Huyền Cảnh`;
  const description = post.excerpt ?? "Bài viết Tarot từ Huyền Cảnh.";
  return {
    title,
    description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="px-5 pb-20 pt-32 md:px-8">
        <article className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-antique-gold">
            {post.published_at ? format(new Date(post.published_at), "dd/MM/yyyy") : "Blog"}
            {post.profiles?.full_name ? ` · ${post.profiles.full_name}` : ""}
          </p>
          <h1 className="mt-4 font-serif text-5xl leading-tight text-ivory md:text-6xl">{post.title}</h1>
          {post.excerpt ? <p className="mt-5 text-lg leading-8 text-stone-mist">{post.excerpt}</p> : null}
          <div className="mt-10">
            <BlogImage src={post.cover_image_url} alt={post.title} priority />
          </div>
          <div className="mt-10">
            <MarkdownContent content={post.content} />
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
