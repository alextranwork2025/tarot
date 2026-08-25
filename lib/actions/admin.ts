"use server";

import { revalidatePath } from "next/cache";

import { canTransitionStatus } from "@/lib/booking/status";
import { requireAdminProfile, requireOwnerAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  adminNoteSchema,
  adminStatusSchema,
  serviceUpdateSchema,
  workingHourUpdateSchema,
} from "@/lib/validations/booking";

export type AdminActionState = { ok: true; message: string } | { ok: false; message: string };

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function updateAppointmentStatusAction(_previous: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const profile = await requireAdminProfile();
  const parsed = adminStatusSchema.safeParse({
    appointmentId: readString(formData, "appointmentId"),
    status: readString(formData, "status"),
    note: readString(formData, "note"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Trạng thái không hợp lệ." };
  }

  const admin = createAdminClient();
  const { data: current } = await admin
    .from("appointments")
    .select("status")
    .eq("id", parsed.data.appointmentId)
    .maybeSingle();

  if (!current || !canTransitionStatus(current.status, parsed.data.status)) {
    return { ok: false, message: "Không thể chuyển sang trạng thái này." };
  }

  const { error } = await admin
    .from("appointments")
    .update({
      status: parsed.data.status,
      internal_note: parsed.data.note,
      created_by: profile.id,
    })
    .eq("id", parsed.data.appointmentId);

  if (error) {
    return { ok: false, message: "Chưa thể cập nhật trạng thái." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/lich-hen");
  revalidatePath(`/admin/lich-hen/${parsed.data.appointmentId}`);
  return { ok: true, message: "Đã cập nhật trạng thái lịch hẹn." };
}

export async function updateInternalNoteAction(_previous: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdminProfile();
  const parsed = adminNoteSchema.safeParse({
    appointmentId: readString(formData, "appointmentId"),
    internalNote: readString(formData, "internalNote"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Ghi chú không hợp lệ." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("appointments")
    .update({ internal_note: parsed.data.internalNote })
    .eq("id", parsed.data.appointmentId);

  if (error) {
    return { ok: false, message: "Chưa thể lưu ghi chú." };
  }

  revalidatePath(`/admin/lich-hen/${parsed.data.appointmentId}`);
  return { ok: true, message: "Đã lưu ghi chú nội bộ." };
}

export async function updateServiceAction(_previous: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireOwnerAdmin();
  const parsed = serviceUpdateSchema.safeParse({
    serviceId: readString(formData, "serviceId"),
    name: readString(formData, "name"),
    description: readString(formData, "description"),
    durationMinutes: readString(formData, "durationMinutes"),
    price: readString(formData, "price"),
    isActive: readString(formData, "isActive") === "on",
  });

  if (!parsed.success) {
    return { ok: false, message: "Thông tin dịch vụ chưa hợp lệ." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("services")
    .update({
      name: parsed.data.name,
      description: parsed.data.description || null,
      duration_minutes: parsed.data.durationMinutes,
      price: parsed.data.price,
      is_active: parsed.data.isActive,
    })
    .eq("id", parsed.data.serviceId);

  if (error) {
    return { ok: false, message: "Chưa thể cập nhật dịch vụ." };
  }

  revalidatePath("/admin/dich-vu");
  revalidatePath("/dat-lich");
  return { ok: true, message: "Đã cập nhật dịch vụ." };
}

export async function updateWorkingHourAction(_previous: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireOwnerAdmin();
  const parsed = workingHourUpdateSchema.safeParse({
    id: readString(formData, "id") || undefined,
    weekday: readString(formData, "weekday"),
    startTime: readString(formData, "startTime"),
    endTime: readString(formData, "endTime"),
    isActive: readString(formData, "isActive") === "on",
  });

  if (!parsed.success) {
    return { ok: false, message: "Lịch làm việc chưa hợp lệ." };
  }

  const admin = createAdminClient();
  const payload = {
    weekday: parsed.data.weekday,
    start_time: parsed.data.startTime,
    end_time: parsed.data.endTime,
    is_active: parsed.data.isActive,
  };
  const request = parsed.data.id
    ? admin.from("working_hours").update(payload).eq("id", parsed.data.id)
    : admin.from("working_hours").insert(payload);
  const { error } = await request;

  if (error) {
    return { ok: false, message: "Chưa thể lưu lịch làm việc." };
  }

  revalidatePath("/admin/lich-lam-viec");
  return { ok: true, message: "Đã lưu lịch làm việc." };
}
