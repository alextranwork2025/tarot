import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { renderBlogMarkdown, sanitizeBlogMarkdown } from "@/lib/blog/markdown";
import { slugifyVietnamese } from "@/lib/blog/slug";
import { blogImageUploadSchema, blogPostFormSchema } from "@/lib/validations/blog";

describe("blog slug and validation", () => {
  it("creates URL-friendly slugs from Vietnamese titles", () => {
    expect(slugifyVietnamese("Trải bài Tarot cho mùa trăng mới!")).toBe("trai-bai-tarot-cho-mua-trang-moi");
    expect(slugifyVietnamese("Đường về nội tâm")).toBe("duong-ve-noi-tam");
  });

  it("validates blog post forms and rejects unsafe slugs", () => {
    expect(
      blogPostFormSchema.safeParse({
        title: "Một bài viết Tarot",
        slug: "mot-bai-viet-tarot",
        excerpt: "Mô tả ngắn",
        content: "Nội dung bài viết đủ dài để có thể lưu.",
        coverImageUrl: "",
        status: "draft",
      }).success,
    ).toBe(true);

    expect(
      blogPostFormSchema.safeParse({
        title: "ab",
        slug: "Slug Sai",
        content: "ngắn",
        status: "published",
      }).success,
    ).toBe(false);
  });

  it("validates blog image type and size", () => {
    expect(blogImageUploadSchema.safeParse({ mimeType: "image/webp", size: 1000 }).success).toBe(true);
    expect(blogImageUploadSchema.safeParse({ mimeType: "image/svg+xml", size: 1000 }).success).toBe(false);
    expect(blogImageUploadSchema.safeParse({ mimeType: "image/png", size: 6 * 1024 * 1024 }).success).toBe(false);
  });
});

describe("blog markdown safety", () => {
  it("removes dangerous HTML and javascript links", () => {
    const input = '<script>alert(1)</script>\n[bad](javascript:alert(1))\n<img src=x onerror="alert(1)">';
    const sanitized = sanitizeBlogMarkdown(input);
    const html = renderBlogMarkdown(input);

    expect(sanitized).not.toContain("<script>");
    expect(html).not.toContain("javascript:alert");
    expect(html).not.toContain("onerror");
  });
});

describe("blog migration security", () => {
  it("adds RLS, published-only public reads, storage policies, and no hard delete policy", () => {
    const migration = readFileSync(join(process.cwd(), "supabase/migrations/20260827001000_add_blog_posts_cms.sql"), "utf8");
    expect(migration).toContain("alter table public.blog_posts enable row level security");
    expect(migration).toContain("blog_posts_public_select_published");
    expect(migration).toContain("status = 'published'");
    expect(migration).toContain("deleted_at is null");
    expect(migration).toContain("blog_images_staff_insert");
    expect(migration).toContain("file_size_limit");
    expect(migration).not.toContain("on public.blog_posts\nfor delete");
  });
});
