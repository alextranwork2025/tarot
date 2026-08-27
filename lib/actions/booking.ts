"use server";

import { format } from "date-fns";
import { headers } from "next/headers";

import {
  calculateEndTime,
  combineDateAndTime,
  generateBookingCode,
  hasAppointmentConflict,
  hasBlockedConflict,
  isInsideWorkingHours,
  isPastDate,
  type TimeRange,
} from "@/lib/booking/time";
import { checkRateLimit } from "@/lib/rate-limit/memory";
import { createAdminClient } from "@/lib/supabase/admin";
import { bookingRequestSchema, cancelLookupSchema, lookupSchema } from "@/lib/validations/booking";

export type ActionState =
  | { ok: true; message: string; bookingCode?: string }
  | { ok: false; message: string };

async function getClientKey(prefix: string, phone?: string) {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `${prefix}:${phone ?? forwarded ?? "unknown"}`;
}

function toFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function isExclusionError(error: { code?: string; message?: string } | null) {
  return error?.code === "23P01" || error?.message?.toLowerCase().includes("conflict");
}

export async function createAppointmentAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = bookingRequestSchema.safeParse({
    serviceId: toFormValue(formData, "serviceId"),
    date: toFormValue(formData, "date"),
    startTime: toFormValue(formData, "startTime"),
    fullName: toFormValue(formData, "fullName"),
    phone: toFormValue(formData, "phone"),
    email: toFormValue(formData, "email"),
    birthDate: toFormValue(formData, "birthDate"),
    message: toFormValue(formData, "message"),
    company: toFormValue(formData, "company"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Dữ liệu chưa hợp lệ." };
  }

  const limited = checkRateLimit(await getClientKey("booking", parsed.data.phone), 5, 15 * 60 * 1000);
  if (!limited.allowed) {
    return { ok: false, message: "Bạn thao tác hơi nhanh. Vui lòng thử lại sau ít phút." };
  }

  if (isPastDate(parsed.data.date)) {
    return { ok: false, message: "Không thể đặt lịch cho ngày trong quá khứ." };
  }

  const admin = createAdminClient();
  const { data: service, error: serviceError } = await admin
    .from("services")
    .select("id,duration_minutes,price,is_active")
    .eq("id", parsed.data.serviceId)
    .eq("is_active", true)
    .maybeSingle();

  if (serviceError || !service) {
    return { ok: false, message: "Dịch vụ hiện không khả dụng." };
  }

  const start = combineDateAndTime(parsed.data.date, parsed.data.startTime);
  const end = calculateEndTime(start, service.duration_minutes);
  const range: TimeRange = { start, end };

  const [{ data: workingHours }, { data: blockedTimes }, { data: appointments }] = await Promise.all([
    admin.from("working_hours").select("day_of_week,start_time,end_time,is_active").eq("is_active", true),
    admin
      .from("blocked_times")
      .select("blocked_date,start_time,end_time")
      .eq("blocked_date", parsed.data.date)
      .lt("start_time", format(end, "HH:mm:ss"))
      .gt("end_time", format(start, "HH:mm:ss")),
    admin
      .from("appointments")
      .select("appointment_date,start_time,end_time")
      .is("deleted_at", null)
      .in("status", ["pending", "confirmed"])
      .eq("appointment_date", parsed.data.date)
      .lt("start_time", format(end, "HH:mm:ss"))
      .gt("end_time", format(start, "HH:mm:ss")),
  ]);

  if (!isInsideWorkingHours(range, workingHours ?? [])) {
    return { ok: false, message: "Khung giờ này nằm ngoài lịch làm việc." };
  }

  const blockedRanges = (blockedTimes ?? []).map((item) => ({
    start: combineDateAndTime(item.blocked_date, item.start_time.slice(0, 5)),
    end: combineDateAndTime(item.blocked_date, item.end_time.slice(0, 5)),
  }));

  if (hasBlockedConflict(range, blockedRanges)) {
    return { ok: false, message: "Khung giờ này đang được tạm khóa." };
  }

  const occupiedRanges = (appointments ?? []).map((item) => ({
    start: combineDateAndTime(item.appointment_date, item.start_time.slice(0, 5)),
    end: combineDateAndTime(item.appointment_date, item.end_time.slice(0, 5)),
  }));

  if (hasAppointmentConflict(range, occupiedRanges)) {
    return { ok: false, message: "Khung giờ này vừa có người đặt. Vui lòng chọn giờ khác." };
  }

  const { data: existingCustomer } = await admin
    .from("customers")
    .select("id")
    .eq("phone", parsed.data.phone)
    .maybeSingle();

  const customerId =
    existingCustomer?.id ??
    (
      await admin
        .from("customers")
        .insert({
          full_name: parsed.data.fullName,
          phone: parsed.data.phone,
          email: parsed.data.email || null,
          date_of_birth: parsed.data.birthDate || null,
        })
        .select("id")
        .single()
    ).data?.id;

  if (!customerId) {
    return { ok: false, message: "Không thể tạo thông tin khách hàng. Vui lòng thử lại." };
  }

  const bookingCode = generateBookingCode();
  const { error: insertError } = await admin.from("appointments").insert({
    booking_code: bookingCode,
    customer_id: customerId,
    service_id: service.id,
    appointment_date: parsed.data.date,
    start_time: format(start, "HH:mm:ss"),
    end_time: format(end, "HH:mm:ss"),
    status: "pending",
    source: "website",
    customer_message: parsed.data.message || null,
  });

  if (isExclusionError(insertError)) {
    return { ok: false, message: "Khung giờ này vừa được giữ bởi yêu cầu khác. Vui lòng chọn giờ khác." };
  }

  if (insertError) {
    return { ok: false, message: "Chưa thể gửi yêu cầu đặt lịch. Vui lòng thử lại sau." };
  }

  return { ok: true, message: "Yêu cầu đặt lịch đã được ghi nhận.", bookingCode };
}

export async function lookupAppointmentAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = lookupSchema.safeParse({
    bookingCode: toFormValue(formData, "bookingCode"),
    phone: toFormValue(formData, "phone"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Vui lòng nhập đúng mã lịch hẹn và số điện thoại." };
  }

  const limited = checkRateLimit(await getClientKey("lookup", parsed.data.phone), 8, 15 * 60 * 1000);
  if (!limited.allowed) {
    return { ok: false, message: "Bạn tra cứu quá nhanh. Vui lòng thử lại sau ít phút." };
  }

  const admin = createAdminClient();
  type LookupAppointment = {
    booking_code: string;
    service_id: string;
    start_time: string;
    status: string;
  };

  const { data } = await admin
    .from("appointments")
    .select("booking_code,customer_id,service_id,appointment_date,start_time,end_time,status")
    .eq("booking_code", parsed.data.bookingCode)
    .is("deleted_at", null)
    .maybeSingle();
  const appointment = data as unknown as (LookupAppointment & { customer_id: string; appointment_date: string }) | null;

  if (!appointment) {
    return { ok: false, message: "Không tìm thấy lịch hẹn khớp với thông tin đã nhập." };
  }

  const [{ data: customer }, { data: service }] = await Promise.all([
    admin.from("customers").select("id").eq("id", appointment.customer_id).eq("phone", parsed.data.phone).maybeSingle(),
    admin.from("services").select("name").eq("id", appointment.service_id).maybeSingle(),
  ]);

  if (!customer) {
    return { ok: false, message: "Không tìm thấy lịch hẹn khớp với thông tin đã nhập." };
  }

  return {
    ok: true,
    message: `Mã ${appointment.booking_code}: ${service?.name ?? "Dịch vụ"} vào ${appointment.appointment_date} ${appointment.start_time.slice(0, 5)} đang ở trạng thái ${appointment.status}.`,
    bookingCode: appointment.booking_code,
  };
}

export async function requestCancelAppointmentAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = cancelLookupSchema.safeParse({
    bookingCode: toFormValue(formData, "bookingCode"),
    phone: toFormValue(formData, "phone"),
    reason: toFormValue(formData, "reason"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Thông tin hủy lịch chưa hợp lệ." };
  }

  const admin = createAdminClient();
  type CancelAppointment = { id: string; customer_id: string; appointment_date: string; start_time: string; status: string };

  const { data } = await admin
    .from("appointments")
    .select("id,customer_id,appointment_date,start_time,status")
    .eq("booking_code", parsed.data.bookingCode)
    .maybeSingle();
  const appointment = data as unknown as CancelAppointment | null;

  if (!appointment) {
    return { ok: false, message: "Không tìm thấy lịch hẹn để hủy." };
  }

  const { data: customer } = await admin
    .from("customers")
    .select("id")
    .eq("id", appointment.customer_id)
    .eq("phone", parsed.data.phone)
    .maybeSingle();

  if (!customer) {
    return { ok: false, message: "Không tìm thấy lịch hẹn để hủy." };
  }

  if (new Date(`${appointment.appointment_date}T${appointment.start_time}`) <= new Date()) {
    return { ok: false, message: "Lịch hẹn đã bắt đầu nên không thể gửi yêu cầu hủy." };
  }

  if (["completed", "cancelled", "rejected", "no_show"].includes(appointment.status)) {
    return { ok: false, message: "Lịch hẹn đã ở trạng thái kết thúc." };
  }

  const { error } = await admin
    .from("appointments")
    .update({ status: "cancelled", customer_message: parsed.data.reason ?? null })
    .eq("id", appointment.id);

  if (error) {
    return { ok: false, message: "Chưa thể gửi yêu cầu hủy lịch." };
  }

  return { ok: true, message: "Yêu cầu hủy lịch đã được ghi nhận." };
}
