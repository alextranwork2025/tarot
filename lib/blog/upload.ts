import "server-only";

import { randomUUID } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";
import { blogImageUploadSchema } from "@/lib/validations/blog";

export const BLOG_IMAGE_BUCKET = "blog-images";
export const MAX_BLOG_IMAGE_BYTES = 5 * 1024 * 1024;

const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export type BlogImageUploadResult =
  | { ok: true; url: string; path: string }
  | { ok: false; message: string };

export async function uploadBlogImage(file: File | null, folder: "cover" | "content"): Promise<BlogImageUploadResult | null> {
  if (!file || file.size === 0) {
    return null;
  }

  const parsed = blogImageUploadSchema.safeParse({ mimeType: file.type, size: file.size });
  if (!parsed.success) {
    return { ok: false, message: file.size > MAX_BLOG_IMAGE_BYTES ? "Ảnh không được vượt quá 5 MB." : "Chỉ hỗ trợ ảnh JPEG, PNG hoặc WebP." };
  }

  const extension = allowedTypes.get(parsed.data.mimeType) ?? "jpg";
  const admin = createAdminClient();
  const path = `${folder}/${randomUUID()}.${extension}`;
  const { error } = await admin.storage.from(BLOG_IMAGE_BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) {
    return { ok: false, message: `Không thể tải ảnh lên: ${error.message}` };
  }

  return { ok: true, path, url: `/blog-images/${path}` };
}
