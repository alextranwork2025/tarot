"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { sanitizeBlogMarkdown } from "@/lib/blog/markdown";
import { uploadBlogImage } from "@/lib/blog/upload";
import { requireAdminProfile } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { blogPostFormSchema, blogPostStatusSchema } from "@/lib/validations/blog";

export type BlogActionState =
  | { ok: true; message: string; redirectTo?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

const initialConflictMessage = "Bài viết đã được cập nhật bởi người khác. Vui lòng tải lại dữ liệu.";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function readFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File ? value : null;
}

function firstZodMessage(fieldErrors: Record<string, string[] | undefined>) {
  return Object.values(fieldErrors).flat().find(Boolean) ?? "Dữ liệu chưa hợp lệ.";
}

function revalidateBlogRoutes(slug?: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/bai-viet");
  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
}

async function ensureUniqueSlug(slug: string, excludingId?: string) {
  const admin = createAdminClient();
  let query = admin.from("blog_posts").select("id").eq("slug", slug).is("deleted_at", null);
  if (excludingId) {
    query = query.neq("id", excludingId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    return { ok: false as const, message: `Không thể kiểm tra slug: ${error.message}` };
  }

  if (data) {
    return { ok: false as const, message: "Slug đã tồn tại. Vui lòng chọn slug khác." };
  }

  return { ok: true as const };
}

export async function createBlogPost(_previous: BlogActionState, formData: FormData): Promise<BlogActionState> {
  const profile = await requireAdminProfile();
  const parsed = blogPostFormSchema.safeParse({
    title: readString(formData, "title"),
    slug: readString(formData, "slug"),
    excerpt: readString(formData, "excerpt"),
    content: readString(formData, "content"),
    coverImageUrl: readString(formData, "coverImageUrl"),
    status: readString(formData, "status") || "draft",
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return { ok: false, message: firstZodMessage(fieldErrors), fieldErrors };
  }

  const uniqueSlug = await ensureUniqueSlug(parsed.data.slug);
  if (!uniqueSlug.ok) {
    return { ok: false, message: uniqueSlug.message };
  }

  const coverUpload = await uploadBlogImage(readFile(formData, "coverImageFile"), "cover");
  if (coverUpload && !coverUpload.ok) {
    return { ok: false, message: coverUpload.message };
  }

  const contentUpload = await uploadBlogImage(readFile(formData, "contentImageFile"), "content");
  if (contentUpload && !contentUpload.ok) {
    return { ok: false, message: contentUpload.message };
  }

  const content = sanitizeBlogMarkdown(
    `${parsed.data.content}${contentUpload?.ok ? `\n\n![Ảnh minh họa](${contentUpload.url})` : ""}`,
  );
  const admin = createAdminClient();
  const now = new Date().toISOString();
  const { data, error } = await admin
    .from("blog_posts")
    .insert({
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt || null,
      content,
      cover_image_url: coverUpload?.ok ? coverUpload.url : parsed.data.coverImageUrl || null,
      status: parsed.data.status,
      author_id: profile.id,
      published_at: parsed.data.status === "published" ? now : null,
    })
    .select("id,slug")
    .single();

  if (error || !data) {
    return { ok: false, message: `Chưa thể tạo bài viết: ${error?.message ?? "Không rõ lỗi"}` };
  }

  revalidateBlogRoutes(data.slug);
  redirect(`/admin/bai-viet/${data.id}`);
}

export async function updateBlogPost(_previous: BlogActionState, formData: FormData): Promise<BlogActionState> {
  const profile = await requireAdminProfile();
  const parsed = blogPostFormSchema.safeParse({
    id: readString(formData, "id"),
    title: readString(formData, "title"),
    slug: readString(formData, "slug"),
    excerpt: readString(formData, "excerpt"),
    content: readString(formData, "content"),
    coverImageUrl: readString(formData, "coverImageUrl"),
    status: readString(formData, "status") || "draft",
    expectedUpdatedAt: readString(formData, "expectedUpdatedAt"),
  });

  if (!parsed.success || !parsed.data.id) {
    const fieldErrors = parsed.success ? {} : parsed.error.flatten().fieldErrors;
    return { ok: false, message: parsed.success ? "Thiếu bài viết cần cập nhật." : firstZodMessage(fieldErrors), fieldErrors };
  }

  const admin = createAdminClient();
  const { data: current } = await admin
    .from("blog_posts")
    .select("id,slug,status,published_at,updated_at")
    .eq("id", parsed.data.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!current) {
    return { ok: false, message: "Không tìm thấy bài viết cần cập nhật." };
  }

  if (parsed.data.expectedUpdatedAt && current.updated_at !== parsed.data.expectedUpdatedAt) {
    return { ok: false, message: initialConflictMessage };
  }

  const uniqueSlug = await ensureUniqueSlug(parsed.data.slug, parsed.data.id);
  if (!uniqueSlug.ok) {
    return { ok: false, message: uniqueSlug.message };
  }

  const coverUpload = await uploadBlogImage(readFile(formData, "coverImageFile"), "cover");
  if (coverUpload && !coverUpload.ok) {
    return { ok: false, message: coverUpload.message };
  }

  const contentUpload = await uploadBlogImage(readFile(formData, "contentImageFile"), "content");
  if (contentUpload && !contentUpload.ok) {
    return { ok: false, message: contentUpload.message };
  }

  const content = sanitizeBlogMarkdown(
    `${parsed.data.content}${contentUpload?.ok ? `\n\n![Ảnh minh họa](${contentUpload.url})` : ""}`,
  );
  const nextPublishedAt = parsed.data.status === "published" ? current.published_at ?? new Date().toISOString() : null;
  const coverImageUrl = coverUpload?.ok ? coverUpload.url : parsed.data.coverImageUrl || null;

  let query = admin
    .from("blog_posts")
    .update({
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt || null,
      content,
      cover_image_url: coverImageUrl,
      status: parsed.data.status,
      author_id: profile.id,
      published_at: nextPublishedAt,
    })
    .eq("id", parsed.data.id);

  if (current.updated_at) {
    query = query.eq("updated_at", current.updated_at);
  }

  const { data, error } = await query.select("id,slug").maybeSingle();
  if (error) {
    return { ok: false, message: `Chưa thể cập nhật bài viết: ${error.message}` };
  }

  if (!data) {
    return { ok: false, message: initialConflictMessage };
  }

  revalidateBlogRoutes(current.slug);
  revalidateBlogRoutes(data.slug);
  revalidatePath(`/admin/bai-viet/${parsed.data.id}`);
  return { ok: true, message: "Đã lưu bài viết." };
}

async function changeBlogPostStatus(formData: FormData, status: "draft" | "published" | "archived" | "deleted") {
  const profile = await requireAdminProfile();
  const parsed = blogPostStatusSchema.safeParse({
    id: readString(formData, "id"),
    expectedUpdatedAt: readString(formData, "expectedUpdatedAt"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Bài viết không hợp lệ." } satisfies BlogActionState;
  }

  const admin = createAdminClient();
  const { data: current } = await admin
    .from("blog_posts")
    .select("id,slug,status,published_at,updated_at")
    .eq("id", parsed.data.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!current) {
    return { ok: false, message: "Không tìm thấy bài viết." } satisfies BlogActionState;
  }

  if (parsed.data.expectedUpdatedAt && current.updated_at !== parsed.data.expectedUpdatedAt) {
    return { ok: false, message: initialConflictMessage } satisfies BlogActionState;
  }

  const payload =
    status === "deleted"
      ? { deleted_at: new Date().toISOString(), author_id: profile.id }
      : {
          status,
          author_id: profile.id,
          published_at: status === "published" ? current.published_at ?? new Date().toISOString() : null,
        };

  const { data, error } = await admin
    .from("blog_posts")
    .update(payload)
    .eq("id", parsed.data.id)
    .eq("updated_at", current.updated_at)
    .select("slug")
    .maybeSingle();

  if (error) {
    return { ok: false, message: `Chưa thể cập nhật trạng thái: ${error.message}` } satisfies BlogActionState;
  }

  if (!data) {
    return { ok: false, message: initialConflictMessage } satisfies BlogActionState;
  }

  revalidateBlogRoutes(current.slug);
  revalidatePath(`/admin/bai-viet/${parsed.data.id}`);
  return { ok: true, message: status === "deleted" ? "Đã xóa mềm bài viết." : "Đã cập nhật trạng thái bài viết." } satisfies BlogActionState;
}

export async function publishBlogPost(_previous: BlogActionState, formData: FormData) {
  return changeBlogPostStatus(formData, "published");
}

export async function unpublishBlogPost(_previous: BlogActionState, formData: FormData) {
  return changeBlogPostStatus(formData, "draft");
}

export async function archiveBlogPost(_previous: BlogActionState, formData: FormData) {
  return changeBlogPostStatus(formData, "archived");
}

export async function deleteBlogPost(_previous: BlogActionState, formData: FormData) {
  return changeBlogPostStatus(formData, "deleted");
}
