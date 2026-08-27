"use client";

import { Bold, Heading2, ImageIcon, Italic, LinkIcon, List, Quote } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { createBlogPost, updateBlogPost, type BlogActionState } from "@/lib/actions/blog";
import { slugifyVietnamese } from "@/lib/blog/slug";
import { blogStatusLabels } from "@/lib/validations/blog";
import type { BlogPostDetail } from "@/types/blog";

type BlogEditorValues = {
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string;
  content: string;
  status: "draft" | "published" | "archived";
};

const emptyState: BlogActionState = { ok: false, message: "" };

function tool(label: string, icon: React.ReactNode, insert: string) {
  return { label, icon, insert };
}

const editorTools = [
  tool("Tiêu đề", <Heading2 size={16} />, "## Tiêu đề\n"),
  tool("In đậm", <Bold size={16} />, "**văn bản**"),
  tool("In nghiêng", <Italic size={16} />, "*văn bản*"),
  tool("Danh sách", <List size={16} />, "- Mục nội dung\n"),
  tool("Trích dẫn", <Quote size={16} />, "> Trích dẫn\n"),
  tool("Liên kết", <LinkIcon size={16} />, "[nhãn](https://example.com)"),
  tool("Ảnh", <ImageIcon size={16} />, "![mô tả ảnh](https://example.com/image.webp)"),
];

export function BlogPostForm({ post }: { post?: BlogPostDetail }) {
  const { register, handleSubmit, setValue, getValues } = useForm<BlogEditorValues>({
    defaultValues: {
      title: post?.title ?? "",
      slug: post?.slug ?? "",
      excerpt: post?.excerpt ?? "",
      coverImageUrl: post?.cover_image_url ?? "",
      content: post?.content ?? "",
      status: post?.status ?? "draft",
    },
  });
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<BlogActionState>(emptyState);
  const [slugTouched, setSlugTouched] = useState(Boolean(post?.slug));

  function insertMarkdown(markdown: string) {
    const current = getValues("content");
    setValue("content", `${current}${current.endsWith("\n") || !current ? "" : "\n"}${markdown}`);
  }

  function onSubmit(values: BlogEditorValues, event?: React.BaseSyntheticEvent) {
    const formElement = event?.target instanceof HTMLFormElement ? event.target : null;
    const formData = new FormData(formElement ?? undefined);
    if (post) {
      formData.set("id", post.id);
      formData.set("expectedUpdatedAt", post.updated_at);
    }
    formData.set("title", values.title);
    formData.set("slug", values.slug);
    formData.set("excerpt", values.excerpt);
    formData.set("coverImageUrl", values.coverImageUrl);
    formData.set("content", values.content);
    formData.set("status", values.status);

    startTransition(async () => {
      const action = post ? updateBlogPost : createBlogPost;
      const result = await action(emptyState, formData);
      setMessage(result);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 rounded-lg border border-gilded/40 bg-card-deep/80 p-5">
      <fieldset disabled={pending} className="grid gap-5 disabled:opacity-70">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-stone-mist">
            Tiêu đề
            <input
              {...register("title", {
                onChange: (event) => {
                  if (!slugTouched) {
                    setValue("slug", slugifyVietnamese(String(event.target.value)));
                  }
                },
              })}
              className="min-h-11 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory"
            />
          </label>
          <label className="grid gap-2 text-sm text-stone-mist">
            Slug
            <input
              {...register("slug", {
                onChange: () => setSlugTouched(true),
              })}
              className="min-h-11 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory"
            />
          </label>
        </div>

        <label className="grid gap-2 text-sm text-stone-mist">
          Mô tả ngắn
          <textarea {...register("excerpt")} rows={3} className="rounded-sm border border-gilded/50 bg-obsidian px-3 py-2 text-ivory" />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-stone-mist">
            URL ảnh đại diện
            <input {...register("coverImageUrl")} className="min-h-11 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory" />
          </label>
          <label className="grid gap-2 text-sm text-stone-mist">
            Tải ảnh đại diện
            <input name="coverImageFile" type="file" accept="image/jpeg,image/png,image/webp" className="min-h-11 rounded-sm border border-gilded/50 bg-obsidian px-3 py-2 text-ivory" />
          </label>
        </div>

        <div className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            {editorTools.map((item) => (
              <button
                key={item.label}
                type="button"
                title={item.label}
                onClick={() => insertMarkdown(item.insert)}
                className="grid size-10 place-items-center rounded-sm border border-gilded/50 text-stone-mist hover:border-antique-gold hover:text-antique-gold"
              >
                {item.icon}
              </button>
            ))}
          </div>
          <label className="grid gap-2 text-sm text-stone-mist">
            Nội dung
            <textarea {...register("content")} rows={16} className="rounded-sm border border-gilded/50 bg-obsidian px-3 py-2 font-mono text-sm text-ivory" />
          </label>
          <label className="grid gap-2 text-sm text-stone-mist">
            Tải ảnh chèn vào nội dung
            <input name="contentImageFile" type="file" accept="image/jpeg,image/png,image/webp" className="min-h-11 rounded-sm border border-gilded/50 bg-obsidian px-3 py-2 text-ivory" />
          </label>
        </div>

        <label className="grid gap-2 text-sm text-stone-mist">
          Trạng thái
          <select {...register("status")} className="min-h-11 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory">
            {Object.entries(blogStatusLabels).map(([status, label]) => (
              <option key={status} value={status}>{label}</option>
            ))}
          </select>
        </label>
      </fieldset>

      <button disabled={pending} className="min-h-11 rounded-full bg-antique-gold px-5 text-sm font-semibold text-obsidian hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? "Đang lưu..." : post ? "Lưu bài viết" : "Tạo bài viết"}
      </button>
      {message.message ? <p role="status" className={message.ok ? "text-antique-gold" : "text-red-200"}>{message.message}</p> : null}
    </form>
  );
}
