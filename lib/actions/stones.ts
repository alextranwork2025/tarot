"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminProfile } from "@/lib/auth/admin";
import { sanitizeBlogMarkdown } from "@/lib/blog/markdown";
import { removeStoneImages, uploadStoneImage, uploadStoneImages } from "@/lib/stones/upload";
import { createAdminClient } from "@/lib/supabase/admin";
import { stoneFormSchema, stoneJarFormSchema, stoneStatusUpdateSchema, type StoneFormValues, type StoneJarFormValues } from "@/lib/validations/stones";
import type { Json } from "@/types/database.types";
import type { StoneStatus } from "@/types/stones";

export type StoneActionState = { ok: true; message: string } | { ok: false; message: string; fieldErrors?: Record<string, string[]> };
const emptyConflict = "Nội dung đã được cập nhật ở nơi khác. Vui lòng tải lại trang.";

const readString = (data: FormData, key: string) => typeof data.get(key) === "string" ? String(data.get(key)) : "";
const readFile = (data: FormData, key: string) => data.get(key) instanceof File ? data.get(key) as File : null;
const readFiles = (data: FormData, key: string) => data.getAll(key).filter((value): value is File => value instanceof File && value.size > 0);
const nullable = (value?: string) => value?.trim() || null;
const messageFrom = (errors: Record<string, string[] | undefined>) => Object.values(errors).flat().find(Boolean) ?? "Dữ liệu chưa hợp lệ.";

function commonInput(data: FormData) {
  return {
    id: readString(data, "id") || undefined,
    name: readString(data, "name"), slug: readString(data, "slug"),
    shortDescription: readString(data, "shortDescription"), content: readString(data, "content"),
    featuredImage: readString(data, "featuredImage"), gallery: readString(data, "gallery"),
    status: readString(data, "status") || "draft", isFeatured: readString(data, "isFeatured") === "on",
    seoTitle: readString(data, "seoTitle"), seoDescription: readString(data, "seoDescription"),
    expectedUpdatedAt: readString(data, "expectedUpdatedAt"),
  };
}

function revalidateStoneRoutes(kind: "stone" | "jar", slug?: string) {
  const publicRoot = kind === "stone" ? "/da-phong-thuy" : "/lo-da-phong-thuy";
  const adminRoot = kind === "stone" ? "/admin/loai-da" : "/admin/lo-da";
  revalidatePath(publicRoot); revalidatePath(adminRoot); revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`${publicRoot}/${slug}`);
}

async function uniqueSlug(table: "stones" | "stone_jars", slug: string, id?: string) {
  let query = createAdminClient().from(table).select("id").eq("slug", slug).is("deleted_at", null);
  if (id) query = query.neq("id", id);
  const { data, error } = await query.maybeSingle();
  if (error) return { ok: false as const, message: `Không thể kiểm tra slug: ${error.message}` };
  return data ? { ok: false as const, message: "Slug đã tồn tại." } : { ok: true as const };
}

async function images(data: FormData, folder: "stones" | "jars", existingGallery: string[]) {
  const featured = await uploadStoneImage(readFile(data, "featuredImageFile"), folder);
  if (featured && !featured.ok) return featured;
  const gallery = await uploadStoneImages(readFiles(data, "galleryFiles"), folder);
  if (!gallery.ok) return gallery;
  return { ok: true as const, featuredImage: featured?.ok ? featured.url : readString(data, "featuredImage") || null, gallery: [...existingGallery, ...gallery.urls] };
}

function stoneInput(data: FormData) {
  return { ...commonInput(data), benefits: readString(data, "benefits"), suitableFor: readString(data, "suitableFor"), elements: readString(data, "elements"), zodiacSigns: readString(data, "zodiacSigns"), colors: readString(data, "colors"), origin: readString(data, "origin") };
}

function stonePayload(value: StoneFormValues, profileId: string, uploaded: { featuredImage: string | null; gallery: string[] }, publishedAt?: string | null) {
  return {
    name: value.name, slug: value.slug, short_description: nullable(value.shortDescription),
    content: nullable(value.content ? sanitizeBlogMarkdown(value.content) : ""), benefits: nullable(value.benefits),
    suitable_for: nullable(value.suitableFor), elements: value.elements, zodiac_signs: value.zodiacSigns,
    colors: value.colors, origin: nullable(value.origin), featured_image: uploaded.featuredImage,
    gallery: uploaded.gallery, status: value.status, is_featured: value.isFeatured,
    seo_title: nullable(value.seoTitle), seo_description: nullable(value.seoDescription), created_by: profileId,
    published_at: value.status === "published" ? publishedAt ?? new Date().toISOString() : null,
  };
}

export async function createStone(_: StoneActionState, data: FormData): Promise<StoneActionState> {
  const profile = await requireAdminProfile();
  const parsed = stoneFormSchema.safeParse(stoneInput(data));
  if (!parsed.success) { const fieldErrors = parsed.error.flatten().fieldErrors; return { ok: false, message: messageFrom(fieldErrors), fieldErrors }; }
  const unique = await uniqueSlug("stones", parsed.data.slug); if (!unique.ok) return unique;
  const uploaded = await images(data, "stones", parsed.data.gallery); if (!uploaded.ok) return uploaded;
  const { data: row, error } = await createAdminClient().from("stones").insert(stonePayload(parsed.data, profile.id, uploaded)).select("id,slug").single();
  if (error || !row) { await removeStoneImages([uploaded.featuredImage ?? "", ...uploaded.gallery]); return { ok: false, message: `Không thể tạo loại đá: ${error?.message ?? "Không rõ lỗi"}` }; }
  revalidateStoneRoutes("stone", row.slug); redirect(`/admin/loai-da/${row.id}`);
}

export async function updateStone(_: StoneActionState, data: FormData): Promise<StoneActionState> {
  const profile = await requireAdminProfile();
  const parsed = stoneFormSchema.safeParse(stoneInput(data));
  if (!parsed.success || !parsed.data.id) { const fieldErrors = parsed.success ? {} : parsed.error.flatten().fieldErrors; return { ok: false, message: parsed.success ? "Thiếu loại đá." : messageFrom(fieldErrors), fieldErrors }; }
  const admin = createAdminClient();
  const { data: current } = await admin.from("stones").select("slug,featured_image,gallery,published_at,updated_at").eq("id", parsed.data.id).is("deleted_at", null).maybeSingle();
  if (!current) return { ok: false, message: "Không tìm thấy loại đá." };
  if (parsed.data.expectedUpdatedAt && current.updated_at !== parsed.data.expectedUpdatedAt) return { ok: false, message: emptyConflict };
  const unique = await uniqueSlug("stones", parsed.data.slug, parsed.data.id); if (!unique.ok) return unique;
  const uploaded = await images(data, "stones", parsed.data.gallery); if (!uploaded.ok) return uploaded;
  const { data: row, error } = await admin.from("stones").update(stonePayload(parsed.data, profile.id, uploaded, current.published_at)).eq("id", parsed.data.id).eq("updated_at", current.updated_at).select("slug").maybeSingle();
  if (error || !row) return { ok: false, message: error ? `Không thể lưu loại đá: ${error.message}` : emptyConflict };
  const kept = new Set([uploaded.featuredImage, ...uploaded.gallery]);
  await removeStoneImages([current.featured_image, ...current.gallery].filter((url): url is string => Boolean(url) && !kept.has(url)));
  revalidateStoneRoutes("stone", current.slug); revalidateStoneRoutes("stone", row.slug); revalidatePath(`/admin/loai-da/${parsed.data.id}`);
  return { ok: true, message: "Đã lưu loại đá." };
}

function jarInput(data: FormData) {
  return { ...commonInput(data), meaning: readString(data, "meaning"), usage: readString(data, "usage"), price: readString(data, "price"), priceLabel: readString(data, "priceLabel") || "Liên hệ", contactMessage: readString(data, "contactMessage"), items: readString(data, "items") };
}

function jarPayload(value: StoneJarFormValues, profileId: string, uploaded: { featuredImage: string | null; gallery: string[] }, publishedAt?: string | null) {
  return {
    name: value.name, slug: value.slug, short_description: nullable(value.shortDescription), content: nullable(value.content ? sanitizeBlogMarkdown(value.content) : ""),
    meaning: nullable(value.meaning), usage: nullable(value.usage), featured_image: uploaded.featuredImage, gallery: uploaded.gallery,
    price: value.price, price_label: value.priceLabel, contact_message: nullable(value.contactMessage), status: value.status,
    is_featured: value.isFeatured, seo_title: nullable(value.seoTitle), seo_description: nullable(value.seoDescription), created_by: profileId,
    published_at: value.status === "published" ? publishedAt ?? new Date().toISOString() : null,
  };
}

async function replaceItems(jarId: string, items: StoneJarFormValues["items"]) {
  return createAdminClient().rpc("replace_stone_jar_items", { p_stone_jar_id: jarId, p_items: items as unknown as Json });
}

export async function createStoneJar(_: StoneActionState, data: FormData): Promise<StoneActionState> {
  const profile = await requireAdminProfile(); const parsed = stoneJarFormSchema.safeParse(jarInput(data));
  if (!parsed.success) { const fieldErrors = parsed.error.flatten().fieldErrors; return { ok: false, message: messageFrom(fieldErrors), fieldErrors }; }
  const unique = await uniqueSlug("stone_jars", parsed.data.slug); if (!unique.ok) return unique;
  const uploaded = await images(data, "jars", parsed.data.gallery); if (!uploaded.ok) return uploaded;
  const admin = createAdminClient();
  const { data: row, error } = await admin.from("stone_jars").insert(jarPayload(parsed.data, profile.id, uploaded)).select("id,slug").single();
  if (error || !row) { await removeStoneImages([uploaded.featuredImage ?? "", ...uploaded.gallery]); return { ok: false, message: `Không thể tạo lọ đá: ${error?.message ?? "Không rõ lỗi"}` }; }
  const itemsResult = await replaceItems(row.id, parsed.data.items);
  if (itemsResult.error) { await admin.from("stone_jars").delete().eq("id", row.id); await removeStoneImages([uploaded.featuredImage ?? "", ...uploaded.gallery]); return { ok: false, message: `Không thể lưu thành phần lọ đá: ${itemsResult.error.message}` }; }
  revalidateStoneRoutes("jar", row.slug); redirect(`/admin/lo-da/${row.id}`);
}

export async function updateStoneJar(_: StoneActionState, data: FormData): Promise<StoneActionState> {
  const profile = await requireAdminProfile(); const parsed = stoneJarFormSchema.safeParse(jarInput(data));
  if (!parsed.success || !parsed.data.id) { const fieldErrors = parsed.success ? {} : parsed.error.flatten().fieldErrors; return { ok: false, message: parsed.success ? "Thiếu lọ đá." : messageFrom(fieldErrors), fieldErrors }; }
  const admin = createAdminClient();
  const { data: current } = await admin.from("stone_jars").select("slug,featured_image,gallery,published_at,updated_at").eq("id", parsed.data.id).is("deleted_at", null).maybeSingle();
  if (!current) return { ok: false, message: "Không tìm thấy lọ đá." };
  if (parsed.data.expectedUpdatedAt && current.updated_at !== parsed.data.expectedUpdatedAt) return { ok: false, message: emptyConflict };
  const unique = await uniqueSlug("stone_jars", parsed.data.slug, parsed.data.id); if (!unique.ok) return unique;
  const uploaded = await images(data, "jars", parsed.data.gallery); if (!uploaded.ok) return uploaded;
  const { data: row, error } = await admin.from("stone_jars").update(jarPayload(parsed.data, profile.id, uploaded, current.published_at)).eq("id", parsed.data.id).eq("updated_at", current.updated_at).select("slug").maybeSingle();
  if (error || !row) return { ok: false, message: error ? `Không thể lưu lọ đá: ${error.message}` : emptyConflict };
  const itemsResult = await replaceItems(parsed.data.id, parsed.data.items);
  if (itemsResult.error) return { ok: false, message: `Lọ đá đã lưu nhưng chưa thể cập nhật thành phần: ${itemsResult.error.message}` };
  const kept = new Set([uploaded.featuredImage, ...uploaded.gallery]);
  await removeStoneImages([current.featured_image, ...current.gallery].filter((url): url is string => Boolean(url) && !kept.has(url)));
  revalidateStoneRoutes("jar", current.slug); revalidateStoneRoutes("jar", row.slug); revalidatePath(`/admin/lo-da/${parsed.data.id}`);
  return { ok: true, message: "Đã lưu lọ đá." };
}

async function changeStatus(table: "stones" | "stone_jars", kind: "stone" | "jar", data: FormData, status: StoneStatus | "deleted") {
  await requireAdminProfile(); const parsed = stoneStatusUpdateSchema.safeParse({ id: readString(data, "id"), expectedUpdatedAt: readString(data, "expectedUpdatedAt") });
  if (!parsed.success) return { ok: false, message: "Nội dung không hợp lệ." } satisfies StoneActionState;
  const admin = createAdminClient(); const { data: current } = await admin.from(table).select("slug,published_at,updated_at").eq("id", parsed.data.id).is("deleted_at", null).maybeSingle();
  if (!current) return { ok: false, message: "Không tìm thấy nội dung." } satisfies StoneActionState;
  if (parsed.data.expectedUpdatedAt && current.updated_at !== parsed.data.expectedUpdatedAt) return { ok: false, message: emptyConflict } satisfies StoneActionState;
  const payload = status === "deleted" ? { deleted_at: new Date().toISOString() } : { status, published_at: status === "published" ? current.published_at ?? new Date().toISOString() : null };
  const { data: row, error } = await admin.from(table).update(payload).eq("id", parsed.data.id).eq("updated_at", current.updated_at).select("slug").maybeSingle();
  if (error || !row) return { ok: false, message: error ? `Không thể cập nhật: ${error.message}` : emptyConflict } satisfies StoneActionState;
  revalidateStoneRoutes(kind, current.slug); return { ok: true, message: status === "deleted" ? "Đã xóa nội dung." : "Đã cập nhật trạng thái." } satisfies StoneActionState;
}

export async function publishStone(_: StoneActionState, data: FormData) { return changeStatus("stones", "stone", data, "published"); }
export async function hideStone(_: StoneActionState, data: FormData) { return changeStatus("stones", "stone", data, "hidden"); }
export async function deleteStone(_: StoneActionState, data: FormData) { return changeStatus("stones", "stone", data, "deleted"); }
export async function publishStoneJar(_: StoneActionState, data: FormData) { return changeStatus("stone_jars", "jar", data, "published"); }
export async function hideStoneJar(_: StoneActionState, data: FormData) { return changeStatus("stone_jars", "jar", data, "hidden"); }
export async function deleteStoneJar(_: StoneActionState, data: FormData) { return changeStatus("stone_jars", "jar", data, "deleted"); }
