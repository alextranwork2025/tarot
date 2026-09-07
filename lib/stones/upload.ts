import "server-only";

import { randomUUID } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";
import { stoneImageUploadSchema } from "@/lib/validations/stones";

export const STONE_IMAGE_BUCKET = "stone-images";
const extensions = new Map([["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"]]);

export type StoneImageUploadResult = { ok: true; url: string; path: string } | { ok: false; message: string };

export async function uploadStoneImage(file: File | null, folder: "stones" | "jars"): Promise<StoneImageUploadResult | null> {
  if (!file || file.size === 0) return null;
  const parsed = stoneImageUploadSchema.safeParse({ mimeType: file.type, size: file.size });
  if (!parsed.success) {
    return { ok: false, message: file.size > 5 * 1024 * 1024 ? "Ảnh không được vượt quá 5 MB." : "Chỉ hỗ trợ JPEG, PNG hoặc WebP." };
  }
  const path = `${folder}/${randomUUID()}.${extensions.get(file.type) ?? "jpg"}`;
  const { error } = await createAdminClient().storage.from(STONE_IMAGE_BUCKET).upload(path, file, {
    contentType: file.type, cacheControl: "31536000", upsert: false,
  });
  return error ? { ok: false, message: `Không thể tải ảnh: ${error.message}` } : { ok: true, path, url: `/stone-images/${path}` };
}

export async function uploadStoneImages(files: File[], folder: "stones" | "jars") {
  const urls: string[] = [];
  for (const file of files) {
    const result = await uploadStoneImage(file, folder);
    if (result && !result.ok) return { ok: false as const, message: result.message, urls };
    if (result?.ok) urls.push(result.url);
  }
  return { ok: true as const, urls };
}

export async function removeStoneImages(urls: string[]) {
  const paths = urls.flatMap((url) => url.startsWith("/stone-images/") ? [url.slice("/stone-images/".length)] : []);
  if (!paths.length) return;
  const { error } = await createAdminClient().storage.from(STONE_IMAGE_BUCKET).remove(paths);
  if (error) console.warn("Could not remove unused stone images.", error);
}
