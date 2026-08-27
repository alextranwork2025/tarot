"use server";

import { format } from "date-fns";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { canTransitionAppointmentStatus, isTerminalStatus } from "@/lib/booking/status";
import {
  calculateEndTime,
  combineDateAndTime,
  hasAppointmentConflict,
  hasBlockedConflict,
  isInsideWorkingHours,
  isPastDate,
  type TimeRange,
} from "@/lib/booking/time";
import { requireAdminProfile, requireOwnerAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  adminNoteSchema,
  adminStatusSchema,
  appointmentFormSchema,
  serviceUpdateSchema,
  workingHourUpdateSchema,
} from "@/lib/validations/booking";
import { normalizeVietnamPhone } from "@/lib/validations/phone";

export type AdminActionState =
  | { ok: true; message: string; redirectTo?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

const CONFLICT_MESSAGE = "Lịch hẹn đã được cập nhật bởi người khác. Vui lòng tải lại dữ liệu.";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function firstZodMessage(fieldErrors: Record<string, string[] | undefined>) {
  return Object.values(fieldErrors).flat().find(Boolean) ?? "Dữ liệu chưa hợp lệ.";
}

function isExclusionError(error: { code?: string; message?: string } | null) {
  return error?.code === "23P01" || error?.message?.toLowerCase().includes("conflict");
}

function redirectAfterSuccess(path?: string) {
  if (path) {
    redirect(path);
  }
}

async function validateAppointmentSlot(params: {
  serviceId: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  excludeAppointmentId?: string;
}) {
  if (isPastDate(params.date)) {
    return { ok: false as const, message: "Không thể đặt lịch cho ngày trong quá khứ." };
  }

  const admin = createAdminClient();
  const start = combineDateAndTime(params.date, params.startTime);
  const end = calculateEndTime(start, params.durationMinutes);
  const range: TimeRange = { start, end };

  const [{ data: service }, { data: workingHours }, { data: blockedTimes }, { data: appointments }] = await Promise.all([
    admin
      .from("services")
      .select("id,duration_minutes,is_active")
      .eq("id", params.serviceId)
      .eq("is_active", true)
      .maybeSingle(),
    admin.from("working_hours").select("day_of_week,start_time,end_time,is_active").eq("is_active", true),
    admin
      .from("blocked_times")
      .select("blocked_date,start_time,end_time")
      .eq("blocked_date", params.date)
      .lt("start_time", format(end, "HH:mm:ss"))
      .gt("end_time", format(start, "HH:mm:ss")),
    admin
      .from("appointments")
      .select("id,appointment_date,start_time,end_time")
      .is("deleted_at", null)
      .in("status", ["pending", "confirmed"])
      .eq("appointment_date", params.date)
      .lt("start_time", format(end, "HH:mm:ss"))
      .gt("end_time", format(start, "HH:mm:ss")),
  ]);

  if (!service) {
    return { ok: false as const, message: "Dịch vụ hiện không khả dụng." };
  }

  if (!isInsideWorkingHours(range, workingHours ?? [])) {
    return { ok: false as const, message: "Khung giờ này nằm ngoài lịch làm việc." };
  }

  const blockedRanges = (blockedTimes ?? []).map((item) => ({
    start: combineDateAndTime(item.blocked_date, item.start_time.slice(0, 5)),
    end: combineDateAndTime(item.blocked_date, item.end_time.slice(0, 5)),
  }));

  if (hasBlockedConflict(range, blockedRanges)) {
    return { ok: false as const, message: "Khung giờ này đang được tạm khóa." };
  }

  const occupiedRanges = (appointments ?? [])
    .filter((item) => item.id !== params.excludeAppointmentId)
    .map((item) => ({
      start: combineDateAndTime(item.appointment_date, item.start_time.slice(0, 5)),
      end: combineDateAndTime(item.appointment_date, item.end_time.slice(0, 5)),
    }));

  if (hasAppointmentConflict(range, occupiedRanges)) {
    return { ok: false as const, message: "Khung giờ này đã có lịch hẹn khác." };
  }

  return { ok: true as const, start, end };
}

async function resolveCustomer(formData: FormData, mode: "existing" | "quick") {
  const admin = createAdminClient();

  if (mode === "existing") {
    const customerId = readString(formData, "customerId");
    const { data: customer } = await admin
      .from("customers")
      .select("id")
      .eq("id", customerId)
      .eq("is_active", true)
      .maybeSingle();

    return customer?.id ?? null;
  }

  const fullName = readString(formData, "fullName").trim();
  const phone = normalizeVietnamPhone(readString(formData, "phone"));
  const { data: existingCustomer } = await admin.from("customers").select("id").eq("phone", phone).maybeSingle();

  if (existingCustomer) {
    return existingCustomer.id;
  }

  const { data: customer, error } = await admin
    .from("customers")
    .insert({ full_name: fullName, phone, must_change_password: false })
    .select("id")
    .single();

  if (error) {
    return null;
  }

  return customer.id;
}

export async function createAppointment(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const profile = await requireAdminProfile();
  const parsed = appointmentFormSchema.safeParse({
    customerMode: readString(formData, "customerMode"),
    customerId: readString(formData, "customerId"),
    fullName: readString(formData, "fullName"),
    phone: readString(formData, "phone"),
    serviceId: readString(formData, "serviceId"),
    date: readString(formData, "date"),
    startTime: readString(formData, "startTime"),
    durationMinutes: readString(formData, "durationMinutes"),
    customerMessage: readString(formData, "customerMessage"),
    internalNote: readString(formData, "internalNote"),
    status: readString(formData, "status") || "pending",
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return { ok: false, message: firstZodMessage(fieldErrors), fieldErrors };
  }

  if (parsed.data.customerMode === "existing" && !parsed.data.customerId) {
    return { ok: false, message: "Vui lòng chọn khách hàng." };
  }

  if (parsed.data.customerMode === "quick" && (!parsed.data.fullName || !parsed.data.phone)) {
    return { ok: false, message: "Vui lòng nhập tên và số điện thoại khách hàng." };
  }

  const slot = await validateAppointmentSlot(parsed.data);
  if (!slot.ok) {
    return { ok: false, message: slot.message };
  }

  const customerId = await resolveCustomer(formData, parsed.data.customerMode);
  if (!customerId) {
    return { ok: false, message: "Không thể xác định khách hàng cho lịch hẹn." };
  }

  const admin = createAdminClient();
  const { data: appointment, error } = await admin
    .from("appointments")
    .insert({
      customer_id: customerId,
      service_id: parsed.data.serviceId,
      appointment_date: parsed.data.date,
      start_time: format(slot.start, "HH:mm:ss"),
      end_time: format(slot.end, "HH:mm:ss"),
      status: parsed.data.status,
      source: "admin",
      customer_message: parsed.data.customerMessage || null,
      internal_note: parsed.data.internalNote || null,
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (isExclusionError(error)) {
    return { ok: false, message: "Khung giờ này vừa được giữ bởi yêu cầu khác. Vui lòng chọn giờ khác." };
  }

  if (error || !appointment) {
    return { ok: false, message: `Chưa thể tạo lịch hẹn: ${error?.message ?? "Không rõ lỗi"}` };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/lich-hen");
  redirectAfterSuccess(`/admin/lich-hen/${appointment.id}`);
  return { ok: true, message: "Đã tạo lịch hẹn.", redirectTo: `/admin/lich-hen/${appointment.id}` };
}

export async function updateAppointment(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdminProfile();
  const parsed = appointmentFormSchema.safeParse({
    appointmentId: readString(formData, "appointmentId"),
    customerMode: readString(formData, "customerMode") || "existing",
    customerId: readString(formData, "customerId"),
    fullName: readString(formData, "fullName"),
    phone: readString(formData, "phone"),
    serviceId: readString(formData, "serviceId"),
    date: readString(formData, "date"),
    startTime: readString(formData, "startTime"),
    durationMinutes: readString(formData, "durationMinutes"),
    customerMessage: readString(formData, "customerMessage"),
    internalNote: readString(formData, "internalNote"),
    status: "pending",
    expectedUpdatedAt: readString(formData, "expectedUpdatedAt"),
  });

  if (!parsed.success || !parsed.data.appointmentId) {
    const fieldErrors = parsed.success ? {} : parsed.error.flatten().fieldErrors;
    return { ok: false, message: parsed.success ? "Thiếu lịch hẹn cần cập nhật." : firstZodMessage(fieldErrors), fieldErrors };
  }

  const admin = createAdminClient();
  const { data: current, error: currentError } = await admin
    .from("appointments")
    .select("id,status,updated_at")
    .eq("id", parsed.data.appointmentId)
    .is("deleted_at", null)
    .maybeSingle();

  if (currentError || !current) {
    return { ok: false, message: "Không tìm thấy lịch hẹn cần cập nhật." };
  }

  if (isTerminalStatus(current.status)) {
    return { ok: false, message: "Không thể chỉnh sửa lịch hẹn đã ở trạng thái kết thúc." };
  }

  if (parsed.data.expectedUpdatedAt && current.updated_at !== parsed.data.expectedUpdatedAt) {
    return { ok: false, message: CONFLICT_MESSAGE };
  }

  const slot = await validateAppointmentSlot({
    ...parsed.data,
    excludeAppointmentId: parsed.data.appointmentId,
  });
  if (!slot.ok) {
    return { ok: false, message: slot.message };
  }

  const customerId = await resolveCustomer(formData, parsed.data.customerMode);
  if (!customerId) {
    return { ok: false, message: "Không thể xác định khách hàng cho lịch hẹn." };
  }

  let updateQuery = admin
    .from("appointments")
    .update({
      customer_id: customerId,
      service_id: parsed.data.serviceId,
      appointment_date: parsed.data.date,
      start_time: format(slot.start, "HH:mm:ss"),
      end_time: format(slot.end, "HH:mm:ss"),
      customer_message: parsed.data.customerMessage || null,
      internal_note: parsed.data.internalNote || null,
    })
    .eq("id", parsed.data.appointmentId)
    .eq("status", current.status);

  if (current.updated_at) {
    updateQuery = updateQuery.eq("updated_at", current.updated_at);
  }

  const { data: updated, error } = await updateQuery.select("id").maybeSingle();

  if (isExclusionError(error)) {
    return { ok: false, message: "Khung giờ này vừa được giữ bởi yêu cầu khác. Vui lòng chọn giờ khác." };
  }

  if (error) {
    return { ok: false, message: `Chưa thể cập nhật lịch hẹn: ${error.message}` };
  }

  if (!updated) {
    return { ok: false, message: CONFLICT_MESSAGE };
  }

  revalidatePath("/admin/lich-hen");
  revalidatePath(`/admin/lich-hen/${parsed.data.appointmentId}`);
  return { ok: true, message: "Đã cập nhật lịch hẹn." };
}

export async function changeAppointmentStatus(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
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
    .is("deleted_at", null)
    .maybeSingle();

  if (!current) {
    return { ok: false, message: "Không tìm thấy lịch hẹn." };
  }

  if (!canTransitionAppointmentStatus(current.status, parsed.data.status)) {
    return { ok: false, message: "Không thể chuyển sang trạng thái này." };
  }

  const { data, error } = await admin.rpc("admin_change_appointment_status", {
    p_appointment_id: parsed.data.appointmentId,
    p_actor_id: profile.id,
    p_expected_status: current.status,
    p_new_status: parsed.data.status,
    p_note: parsed.data.note || null,
  });

  if (error) {
    return { ok: false, message: error.message.includes("updated by another user") ? CONFLICT_MESSAGE : "Chưa thể cập nhật trạng thái." };
  }

  if (!data?.length) {
    return { ok: false, message: CONFLICT_MESSAGE };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/lich-hen");
  revalidatePath(`/admin/lich-hen/${parsed.data.appointmentId}`);
  return { ok: true, message: "Đã cập nhật trạng thái lịch hẹn." };
}

export const updateAppointmentStatusAction = changeAppointmentStatus;

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
      description: parsed.data.description || "",
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
    dayOfWeek: readString(formData, "dayOfWeek"),
    startTime: readString(formData, "startTime"),
    endTime: readString(formData, "endTime"),
    isActive: readString(formData, "isActive") === "on",
  });

  if (!parsed.success) {
    return { ok: false, message: "Lịch làm việc chưa hợp lệ." };
  }

  const admin = createAdminClient();
  const payload = {
    day_of_week: parsed.data.dayOfWeek,
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
