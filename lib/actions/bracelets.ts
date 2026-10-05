"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminProfile } from "@/lib/auth/admin";
import { sanitizeBlogMarkdown } from "@/lib/blog/markdown";
import { createAdminClient } from "@/lib/supabase/admin";
import { removeStoneImages, uploadStoneImage, uploadStoneImages } from "@/lib/stones/upload";
import { braceletFormSchema, braceletStatusUpdateSchema, contactSettingsSchema, type BraceletFormValues } from "@/lib/validations/bracelets";
import type { Json } from "@/types/database.types";
import type { BraceletStatus } from "@/types/bracelets";

export type BraceletActionState = { ok: true; message: string } | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

const emptyConflict = "Nội dung đã được cập nhật ở nơi khác. Vui lòng tải lại trang.";
const readString = (data: FormData, key: string) => typeof data.get(key) === "string" ? String(data.get(key)) : "";
const readFile = (data: FormData, key: string) => data.get(key) instanceof File ? data.get(key) as File : null;
const readFiles = (data: FormData, key: string) => data.getAll(key).filter((value): value is File => value instanceof File && value.size > 0);
const nullable = (value?: string) => value?.trim() || null;
const messageFrom = (errors: Record<string, string[] | undefined>) => Object.values(errors).flat().find(Boolean) ?? "Dữ liệu chưa hợp lệ.";

function input(data: FormData) {
  return {
    id: readString(data, "id") || undefined,
    name: readString(data, "name"),
    slug: readString(data, "slug"),
    featuredImage: readString(data, "featuredImage"),
    shortDescription: readString(data, "shortDescription"),
    content: readString(data, "content"),
    beadSizesMm: readString(data, "beadSizesMm"),
    wristSizesCm: readString(data, "wristSizesCm"),
    gallery: readString(data, "gallery"),
    colors: readString(data, "colors"),
    style: readString(data, "style"),
    beadCount: readString(data, "beadCount"),
    cordMaterial: readString(data, "cordMaterial"),
    accessoryMaterial: readString(data, "accessoryMaterial"),
    price: readString(data, "price"),
    availability: readString(data, "availability") || "available",
    meaning: readString(data, "meaning"),
    suitableElements: readString(data, "suitableElements"),
    wristMeasurementGuide: readString(data, "wristMeasurementGuide"),
    careGuide: readString(data, "careGuide"),
    policy: readString(data, "policy"),
    origin: readString(data, "origin"),
    treatment: readString(data, "treatment"),
    certification: readString(data, "certification"),
    isFeatured: readString(data, "isFeatured") === "on",
    displayOrder: readString(data, "displayOrder") || "0",
    status: readString(data, "status") || "draft",
    seoTitle: readString(data, "seoTitle"),
    seoDescription: readString(data, "seoDescription"),
    stoneIds: readString(data, "stoneIds"),
    expectedUpdatedAt: readString(data, "expectedUpdatedAt"),
  };
}

async function images(data: FormData, existingGallery: string[]) {
  const featured = await uploadStoneImage(readFile(data, "featuredImageFile"), "bracelets");
  if (featured && !featured.ok) return featured;
  const gallery = await uploadStoneImages(readFiles(data, "galleryFiles"), "bracelets");
  if (!gallery.ok) return gallery;
  return { ok: true as const, featuredImage: featured?.ok ? featured.url : readString(data, "featuredImage") || null, gallery: [...existingGallery, ...gallery.urls] };
}

function payload(value: BraceletFormValues, profileId: string, uploaded: { featuredImage: string | null; gallery: string[] }, publishedAt?: string | null) {
  return {
    name: value.name,
    slug: value.slug,
    featured_image: uploaded.featuredImage!,
    short_description: value.shortDescription,
    content: sanitizeBlogMarkdown(value.content),
    bead_sizes_mm: value.beadSizesMm,
    wrist_sizes_cm: value.wristSizesCm,
    gallery: uploaded.gallery,
    colors: value.colors,
    style: nullable(value.style),
    bead_count: nullable(value.beadCount),
    cord_material: nullable(value.cordMaterial),
    accessory_material: nullable(value.accessoryMaterial),
    price: value.price,
    availability: value.availability,
    meaning: nullable(value.meaning),
    suitable_elements: value.suitableElements,
    wrist_measurement_guide: nullable(value.wristMeasurementGuide),
    care_guide: nullable(value.careGuide),
    policy: nullable(value.policy),
    origin: nullable(value.origin),
    treatment: nullable(value.treatment),
    certification: nullable(value.certification),
    is_featured: value.isFeatured,
    display_order: value.displayOrder,
    status: value.status,
    seo_title: nullable(value.seoTitle),
    seo_description: nullable(value.seoDescription),
    created_by: profileId,
    published_at: value.status === "published" ? publishedAt ?? new Date().toISOString() : null,
  };
}

async function uniqueSlug(slug: string, id?: string) {
  let query = createAdminClient().from("bracelets").select("id").eq("slug", slug).is("deleted_at", null);
  if (id) query = query.neq("id", id);
  const { data, error } = await query.maybeSingle();
  if (error) return { ok: false as const, message: `Không thể kiểm tra slug: ${error.message}` };
  return data ? { ok: false as const, message: "Slug đã tồn tại." } : { ok: true as const };
}

function revalidateBraceletRoutes(slug?: string) {
  revalidatePath("/vong-tay-phong-thuy");
  revalidatePath("/admin/vong-tay");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/vong-tay-phong-thuy/${slug}`);
}

async function replaceStones(braceletId: string, stoneIds: string[]) {
  return createAdminClient().rpc("replace_bracelet_stones", { p_bracelet_id: braceletId, p_stone_ids: stoneIds as unknown as Json });
}

export async function createBracelet(_: BraceletActionState, data: FormData): Promise<BraceletActionState> {
  const profile = await requireAdminProfile();
  const uploaded = await images(data, []);
  if (!uploaded.ok) return uploaded;
  if (!uploaded.featuredImage) return { ok: false, message: "Vui lòng tải ảnh đại diện." };
  const parsed = braceletFormSchema.safeParse({ ...input(data), featuredImage: uploaded.featuredImage, gallery: JSON.stringify(uploaded.gallery) });
  if (!parsed.success) { await removeStoneImages([uploaded.featuredImage, ...uploaded.gallery]); const fieldErrors = parsed.error.flatten().fieldErrors; return { ok: false, message: messageFrom(fieldErrors), fieldErrors }; }
  const unique = await uniqueSlug(parsed.data.slug); if (!unique.ok) return unique;
  const admin = createAdminClient();
  const { data: row, error } = await admin.from("bracelets").insert(payload(parsed.data, profile.id, uploaded)).select("id,slug").single();
  if (error || !row) { await removeStoneImages([uploaded.featuredImage, ...uploaded.gallery]); return { ok: false, message: `Không thể tạo vòng tay: ${error?.message ?? "Không rõ lỗi"}` }; }
  const linkResult = await replaceStones(row.id, parsed.data.stoneIds);
  if (linkResult.error) { await admin.from("bracelets").delete().eq("id", row.id); await removeStoneImages([uploaded.featuredImage, ...uploaded.gallery]); return { ok: false, message: `Không thể lưu loại đá: ${linkResult.error.message}` }; }
  revalidateBraceletRoutes(row.slug);
  redirect(`/admin/vong-tay/${row.id}`);
}

export async function updateBracelet(_: BraceletActionState, data: FormData): Promise<BraceletActionState> {
  const profile = await requireAdminProfile();
  const parsedBase = input(data);
  if (!parsedBase.id) return { ok: false, message: "Thiếu vòng tay." };
  const admin = createAdminClient();
  const { data: current } = await admin.from("bracelets").select("slug,featured_image,gallery,published_at,updated_at").eq("id", parsedBase.id).is("deleted_at", null).maybeSingle();
  if (!current) return { ok: false, message: "Không tìm thấy vòng tay." };
  if (parsedBase.expectedUpdatedAt && current.updated_at !== parsedBase.expectedUpdatedAt) return { ok: false, message: emptyConflict };
  const uploaded = await images(data, JSON.parse(parsedBase.gallery || "[]"));
  if (!uploaded.ok) return uploaded;
  if (!uploaded.featuredImage) return { ok: false, message: "Vui lòng tải ảnh đại diện." };
  const parsed = braceletFormSchema.safeParse({ ...parsedBase, featuredImage: uploaded.featuredImage, gallery: JSON.stringify(uploaded.gallery) });
  if (!parsed.success) { const fieldErrors = parsed.error.flatten().fieldErrors; return { ok: false, message: messageFrom(fieldErrors), fieldErrors }; }
  const braceletId = parsed.data.id;
  if (!braceletId) return { ok: false, message: "Thiếu vòng tay." };
  const unique = await uniqueSlug(parsed.data.slug, parsed.data.id); if (!unique.ok) return unique;
  const { data: row, error } = await admin.from("bracelets").update(payload(parsed.data, profile.id, uploaded, current.published_at)).eq("id", braceletId).eq("updated_at", current.updated_at).select("slug").maybeSingle();
  if (error || !row) return { ok: false, message: error ? `Không thể lưu vòng tay: ${error.message}` : emptyConflict };
  const linkResult = await replaceStones(braceletId, parsed.data.stoneIds);
  if (linkResult.error) return { ok: false, message: `Vòng tay đã lưu nhưng chưa thể cập nhật loại đá: ${linkResult.error.message}` };
  const kept = new Set([uploaded.featuredImage, ...uploaded.gallery]);
  await removeStoneImages([current.featured_image, ...current.gallery].filter((url): url is string => Boolean(url) && !kept.has(url)));
  revalidateBraceletRoutes(current.slug);
  revalidateBraceletRoutes(row.slug);
  revalidatePath(`/admin/vong-tay/${braceletId}`);
  return { ok: true, message: "Đã lưu vòng tay." };
}

async function changeStatus(data: FormData, status: BraceletStatus | "deleted") {
  await requireAdminProfile();
  const parsed = braceletStatusUpdateSchema.safeParse({ id: readString(data, "id"), expectedUpdatedAt: readString(data, "expectedUpdatedAt") });
  if (!parsed.success) return { ok: false, message: "Nội dung không hợp lệ." } satisfies BraceletActionState;
  const admin = createAdminClient();
  const { data: current } = await admin
    .from("bracelets")
    .select("slug,featured_image,bead_sizes_mm,wrist_sizes_cm,published_at,updated_at")
    .eq("id", parsed.data.id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!current) return { ok: false, message: "Không tìm thấy vòng tay." } satisfies BraceletActionState;
  if (parsed.data.expectedUpdatedAt && current.updated_at !== parsed.data.expectedUpdatedAt) return { ok: false, message: emptyConflict } satisfies BraceletActionState;
  if (status === "published") {
    const hasValidBeadSize = current.bead_sizes_mm.some((size) => Number(size) > 0);
    const hasValidWristSize = current.wrist_sizes_cm.some((size) => size.trim() && !size.toLocaleLowerCase("vi").includes("cần cập nhật"));
    if (!current.featured_image || !hasValidBeadSize || !hasValidWristSize) {
      return { ok: false, message: "Vui lòng bổ sung ảnh thật, kích thước hạt và kích cỡ vòng trước khi công khai." } satisfies BraceletActionState;
    }
  }
  const update = status === "deleted" ? { deleted_at: new Date().toISOString() } : { status, published_at: status === "published" ? current.published_at ?? new Date().toISOString() : null };
  const { error } = await admin.from("bracelets").update(update).eq("id", parsed.data.id).eq("updated_at", current.updated_at);
  if (error) return { ok: false, message: `Không thể cập nhật: ${error.message}` } satisfies BraceletActionState;
  revalidateBraceletRoutes(current.slug);
  return { ok: true, message: status === "deleted" ? "Đã xóa vòng tay." : "Đã cập nhật trạng thái." } satisfies BraceletActionState;
}

export async function publishBracelet(_: BraceletActionState, data: FormData) { return changeStatus(data, "published"); }
export async function hideBracelet(_: BraceletActionState, data: FormData) { return changeStatus(data, "hidden"); }
export async function deleteBracelet(_: BraceletActionState, data: FormData) { return changeStatus(data, "deleted"); }

export async function updateContactSettings(_: BraceletActionState, data: FormData): Promise<BraceletActionState> {
  const profile = await requireAdminProfile();
  const parsed = contactSettingsSchema.safeParse({ zaloUrl: readString(data, "zaloUrl"), facebookUrl: readString(data, "facebookUrl") });
  if (!parsed.success) { const fieldErrors = parsed.error.flatten().fieldErrors; return { ok: false, message: messageFrom(fieldErrors), fieldErrors }; }
  const { error } = await createAdminClient().from("site_contact_settings").update({
    zalo_url: nullable(parsed.data.zaloUrl),
    facebook_url: nullable(parsed.data.facebookUrl),
    updated_by: profile.id,
  }).eq("id", 1);
  if (error) return { ok: false, message: `Không thể lưu cấu hình: ${error.message}` };
  revalidatePath("/vong-tay-phong-thuy");
  return { ok: true, message: "Đã lưu cấu hình tư vấn." };
}
