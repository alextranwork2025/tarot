import { renderBlogMarkdown } from "@/lib/blog/markdown";

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div
      className="prose prose-invert max-w-none prose-headings:font-serif prose-headings:text-ivory prose-p:text-stone-mist prose-a:text-antique-gold prose-strong:text-ivory prose-blockquote:border-antique-gold prose-blockquote:text-stone-mist prose-li:text-stone-mist prose-img:rounded-lg prose-img:border prose-img:border-gilded/40"
      dangerouslySetInnerHTML={{ __html: renderBlogMarkdown(content) }}
    />
  );
}
