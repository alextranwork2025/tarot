"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { sanitizeBlogMarkdown } from "@/lib/blog/markdown";
import { requireAdminProfile } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { serviceFormSchema, serviceStatusUpdateSchema, type ServiceFormValues } from "@/lib/validations/services";

export type ServiceActionState =
  | { ok: true; message: string; redirectTo?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

const conflictMessage = "Dịch vụ đã được cập nhật bởi người khác. Vui lòng tải lại dữ liệu.";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function firstZodMessage(fieldErrors: Record<string, string[] | undefined>) {
  return Object.values(fieldErrors).flat().find(Boolean) ?? "Dữ liệu chưa hợp lệ.";
}

function toNullable(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function servicePayload(data: ServiceFormValues, publishedAt?: string | null) {
  const now = new Date().toISOString();
  return {
    name: data.name,
    slug: data.slug,
    description: toNullable(data.description),
    short_description: toNullable(data.shortDescription),
    content: toNullable(data.content ? sanitizeBlogMarkdown(data.content) : ""),
    cover_image_url: toNullable(data.coverImageUrl),
    suitable_for: toNullable(data.suitableFor),
    benefits: toNullable(data.benefits),
    process: toNullable(data.process),
    preparation_notes: toNullable(data.preparationNotes),
    faq: data.faq,
    testimonials: data.testimonials,
    seo_title: toNullable(data.seoTitle),
    seo_description: toNullable(data.seoDescription),
    duration_minutes: data.durationMinutes,
    price: data.price,
    display_order: data.displayOrder,
    is_active: data.isActive,
    status: data.status,
    published_at: data.status === "published" ? publishedAt ?? now : null,
  };
}

function revalidateServiceRoutes(slug?: string) {
  revalidatePath("/");
  revalidatePath("/dich-vu");
  revalidatePath("/dat-lich");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/dich-vu");
  revalidatePath("/admin/lich-hen");
  if (slug) {
    revalidatePath(`/dich-vu/${slug}`);
  }
}

async function ensureUniqueSlug(slug: string, excludingId?: string) {
  const admin = createAdminClient();
  let query = admin.from("services").select("id").eq("slug", slug).is("deleted_at", null);
  if (excludingId) {
    query = query.neq("id", excludingId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    return { ok: false as const, message: "Không thể kiểm tra slug dịch vụ." };
  }

  if (data) {
    return { ok: false as const, message: "Slug đã tồn tại. Vui lòng chọn slug khác." };
  }

  return { ok: true as const };
}

function readServiceForm(formData: FormData) {
  return {
    id: readString(formData, "id") || undefined,
    name: readString(formData, "name"),
    slug: readString(formData, "slug"),
    description: readString(formData, "description"),
    shortDescription: readString(formData, "shortDescription"),
    content: readString(formData, "content"),
    coverImageUrl: readString(formData, "coverImageUrl"),
    suitableFor: readString(formData, "suitableFor"),
    benefits: readString(formData, "benefits"),
    process: readString(formData, "process"),
    preparationNotes: readString(formData, "preparationNotes"),
    faq: readString(formData, "faq"),
    testimonials: readString(formData, "testimonials"),
    seoTitle: readString(formData, "seoTitle"),
    seoDescription: readString(formData, "seoDescription"),
    status: readString(formData, "status") || "draft",
    displayOrder: readString(formData, "displayOrder") || "0",
    durationMinutes: readString(formData, "durationMinutes"),
    price: readString(formData, "price") || "0",
    isActive: readString(formData, "isActive") === "on",
    expectedUpdatedAt: readString(formData, "expectedUpdatedAt"),
  };
}

export async function createService(_previous: ServiceActionState, formData: FormData): Promise<ServiceActionState> {
  await requireAdminProfile();
  const parsed = serviceFormSchema.safeParse(readServiceForm(formData));

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return { ok: false, message: firstZodMessage(fieldErrors), fieldErrors };
  }

  const uniqueSlug = await ensureUniqueSlug(parsed.data.slug);
  if (!uniqueSlug.ok) {
    return { ok: false, message: uniqueSlug.message };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("services")
    .insert(servicePayload(parsed.data))
    .select("id,slug")
    .single();

  if (error || !data) {
    return { ok: false, message: "Chưa thể tạo dịch vụ." };
  }

  revalidateServiceRoutes(data.slug);
  redirect(`/admin/dich-vu/${data.id}`);
}

export async function updateService(_previous: ServiceActionState, formData: FormData): Promise<ServiceActionState> {
  await requireAdminProfile();
  const parsed = serviceFormSchema.safeParse(readServiceForm(formData));

  if (!parsed.success || !parsed.data.id) {
    const fieldErrors = parsed.success ? {} : parsed.error.flatten().fieldErrors;
    return { ok: false, message: parsed.success ? "Thiếu dịch vụ cần cập nhật." : firstZodMessage(fieldErrors), fieldErrors };
  }

  const admin = createAdminClient();
  const { data: current } = await admin
    .from("services")
    .select("id,slug,published_at,updated_at")
    .eq("id", parsed.data.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!current) {
    return { ok: false, message: "Không tìm thấy dịch vụ cần cập nhật." };
  }

  if (parsed.data.expectedUpdatedAt && current.updated_at !== parsed.data.expectedUpdatedAt) {
    return { ok: false, message: conflictMessage };
  }

  const uniqueSlug = await ensureUniqueSlug(parsed.data.slug, parsed.data.id);
  if (!uniqueSlug.ok) {
    return { ok: false, message: uniqueSlug.message };
  }

  let query = admin
    .from("services")
    .update(servicePayload(parsed.data, current.published_at))
    .eq("id", parsed.data.id);

  if (current.updated_at) {
    query = query.eq("updated_at", current.updated_at);
  }

  const { data, error } = await query.select("id,slug").maybeSingle();
  if (error) {
    return { ok: false, message: "Chưa thể cập nhật dịch vụ." };
  }

  if (!data) {
    return { ok: false, message: conflictMessage };
  }

  revalidateServiceRoutes(current.slug);
  revalidateServiceRoutes(data.slug);
  revalidatePath(`/admin/dich-vu/${parsed.data.id}`);
  return { ok: true, message: "Đã lưu dịch vụ." };
}

async function changeServiceStatus(formData: FormData, status: "draft" | "published" | "archived" | "deleted") {
  await requireAdminProfile();
  const parsed = serviceStatusUpdateSchema.safeParse({
    id: readString(formData, "id"),
    expectedUpdatedAt: readString(formData, "expectedUpdatedAt"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Dịch vụ không hợp lệ." } satisfies ServiceActionState;
  }

  const admin = createAdminClient();
  const { data: current } = await admin
    .from("services")
    .select("id,slug,published_at,updated_at")
    .eq("id", parsed.data.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!current) {
    return { ok: false, message: "Không tìm thấy dịch vụ." } satisfies ServiceActionState;
  }

  if (parsed.data.expectedUpdatedAt && current.updated_at !== parsed.data.expectedUpdatedAt) {
    return { ok: false, message: conflictMessage } satisfies ServiceActionState;
  }

  const payload =
    status === "deleted"
      ? { deleted_at: new Date().toISOString() }
      : {
          status,
          published_at: status === "published" ? current.published_at ?? new Date().toISOString() : null,
        };

  let query = admin
    .from("services")
    .update(payload)
    .eq("id", parsed.data.id);

  if (current.updated_at) {
    query = query.eq("updated_at", current.updated_at);
  }

  const { data, error } = await query.select("slug").maybeSingle();

  if (error) {
    return { ok: false, message: "Chưa thể cập nhật trạng thái dịch vụ." } satisfies ServiceActionState;
  }

  if (!data) {
    return { ok: false, message: conflictMessage } satisfies ServiceActionState;
  }

  revalidateServiceRoutes(current.slug);
  revalidatePath(`/admin/dich-vu/${parsed.data.id}`);
  return { ok: true, message: status === "deleted" ? "Đã xóa mềm dịch vụ." : "Đã cập nhật trạng thái dịch vụ." } satisfies ServiceActionState;
}

export async function publishService(_previous: ServiceActionState, formData: FormData) {
  return changeServiceStatus(formData, "published");
}

export async function unpublishService(_previous: ServiceActionState, formData: FormData) {
  return changeServiceStatus(formData, "draft");
}

export async function archiveService(_previous: ServiceActionState, formData: FormData) {
  return changeServiceStatus(formData, "archived");
}

export async function deleteService(_previous: ServiceActionState, formData: FormData) {
  return changeServiceStatus(formData, "deleted");
}
