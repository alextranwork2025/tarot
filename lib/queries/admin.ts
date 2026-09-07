import "server-only";

import { format } from "date-fns";

import { appointmentStatuses } from "@/lib/booking/status";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AppointmentStatus } from "@/types/database.types";

export type DashboardAppointment = {
  id: string;
  booking_code: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
};

export type AppointmentCustomerSummary = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
};

export type AppointmentServiceSummary = {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
};

export type AdminAppointmentListItem = {
  id: string;
  booking_code: string;
  customer_id: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  source: "website" | "admin";
  reading_format: "online" | "in_person" | null;
  topic: string | null;
  customer_message: string | null;
  internal_note: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string | null;
  customers: AppointmentCustomerSummary | null;
  services: AppointmentServiceSummary | null;
};

export type AdminAppointmentHistoryItem = {
  id: string;
  old_status: AppointmentStatus | null;
  new_status: AppointmentStatus;
  changed_by: string | null;
  note: string | null;
  created_at: string;
  profiles: { full_name: string | null } | null;
};

export type AdminAppointmentDetail = AdminAppointmentListItem & {
  confirmed_at: string | null;
  cancelled_at: string | null;
  created_by: string | null;
  history: AdminAppointmentHistoryItem[];
};

export type AppointmentListParams = {
  query?: string;
  bookingCode?: string;
  customerName?: string;
  phone?: string;
  date?: string;
  fromDate?: string;
  toDate?: string;
  serviceId?: string;
  status?: AppointmentStatus | "all";
  page?: number;
  pageSize?: number;
  sort?: "upcoming" | "newest";
};

export type AdminCustomerOption = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
};

export function parseAppointmentStatus(value?: string): AppointmentStatus | "all" {
  if (!value || value === "all") {
    return "all";
  }

  return appointmentStatuses.includes(value as AppointmentStatus) ? (value as AppointmentStatus) : "all";
}

function sanitizePage(value?: number) {
  if (!value || Number.isNaN(value) || value < 1) {
    return 1;
  }

  return Math.floor(value);
}

function escapeLike(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_");
}

function maybeText(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

async function hydrateAppointmentRows<T extends { customer_id: string; service_id: string }>(rows: T[]) {
  const admin = createAdminClient();
  const customerIds = Array.from(new Set(rows.map((row) => row.customer_id)));
  const serviceIds = Array.from(new Set(rows.map((row) => row.service_id)));

  const [{ data: customers }, { data: services }] = await Promise.all([
    customerIds.length
      ? admin.from("customers").select("id,full_name,phone,email").in("id", customerIds)
      : Promise.resolve({ data: [] as AppointmentCustomerSummary[] }),
    serviceIds.length
      ? admin.from("services").select("id,name,duration_minutes,price").in("id", serviceIds)
      : Promise.resolve({ data: [] as AppointmentServiceSummary[] }),
  ]);

  const customerMap = new Map((customers ?? []).map((customer) => [customer.id, customer]));
  const serviceMap = new Map((services ?? []).map((service) => [service.id, service]));

  return rows.map((row) => ({
    ...row,
    customers: customerMap.get(row.customer_id) ?? null,
    services: serviceMap.get(row.service_id) ?? null,
  }));
}

export async function getAdminDashboard() {
  const admin = createAdminClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data, error } = await admin
    .from("appointments")
    .select("id,booking_code,appointment_date,start_time,end_time,status")
    .is("deleted_at", null)
    .eq("appointment_date", today)
    .order("start_time");

  if (error) {
    throw new Error(`Không thể tải dashboard: ${error.message}`);
  }

  const todayAppointments = data;
  const counts = {
    today: todayAppointments.length,
    pending: todayAppointments.filter((item) => item.status === "pending").length,
    confirmed: todayAppointments.filter((item) => item.status === "confirmed").length,
    completed: todayAppointments.filter((item) => item.status === "completed").length,
    cancelledOrRejected: todayAppointments.filter((item) => item.status === "cancelled" || item.status === "rejected").length,
  };

  return { counts, todayAppointments };
}

export async function getAppointmentStats() {
  const admin = createAdminClient();
  const today = format(new Date(), "yyyy-MM-dd");
  const { data, error } = await admin
    .from("appointments")
    .select("appointment_date,status")
    .is("deleted_at", null)
    .or(`appointment_date.eq.${today},status.in.(pending,confirmed,completed,cancelled,rejected)`);

  if (error) {
    throw new Error(`Không thể tải thống kê lịch hẹn: ${error.message}`);
  }

  return {
    today: data.filter((item) => item.appointment_date === today).length,
    pending: data.filter((item) => item.status === "pending").length,
    confirmed: data.filter((item) => item.status === "confirmed").length,
    completed: data.filter((item) => item.status === "completed").length,
    cancelledOrRejected: data.filter((item) => item.status === "cancelled" || item.status === "rejected").length,
  };
}

export async function getAppointments(params: AppointmentListParams) {
  const admin = createAdminClient();
  const page = sanitizePage(params.page);
  const pageSize = params.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const sort = params.sort ?? "upcoming";

  let query = admin
    .from("appointments")
    .select(
      "id,booking_code,customer_id,service_id,appointment_date,start_time,end_time,status,source,reading_format,topic,customer_message,internal_note,cancellation_reason,created_at,updated_at",
      { count: "exact" },
    )
    .is("deleted_at", null);

  const globalQuery = maybeText(params.query);
  const bookingCode = maybeText(params.bookingCode);
  const customerName = maybeText(params.customerName);
  const phone = maybeText(params.phone);

  if (globalQuery) {
    const customerIds = await findCustomerIds(globalQuery);
    const escaped = escapeLike(globalQuery);
    const clauses = [`booking_code.ilike.%${escaped}%`];
    if (customerIds.length > 0) {
      clauses.push(`customer_id.in.(${customerIds.join(",")})`);
    }
    query = query.or(clauses.join(","));
  }

  if (bookingCode) {
    query = query.ilike("booking_code", `%${escapeLike(bookingCode)}%`);
  }

  if (customerName || phone) {
    const customerIds = await findCustomerIds(customerName, phone);
    if (customerIds.length === 0) {
      return { appointments: [] as AdminAppointmentListItem[], count: 0, page, pageSize };
    }
    query = query.in("customer_id", customerIds);
  }

  if (params.date) {
    query = query.eq("appointment_date", params.date);
  }

  if (params.fromDate) {
    query = query.gte("appointment_date", params.fromDate);
  }

  if (params.toDate) {
    query = query.lte("appointment_date", params.toDate);
  }

  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  if (params.serviceId) {
    query = query.eq("service_id", params.serviceId);
  }

  query =
    sort === "newest"
      ? query.order("created_at", { ascending: false })
      : query.order("appointment_date", { ascending: true }).order("start_time", { ascending: true });

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(`Không thể tải lịch hẹn: ${error.message}`);
  }

  const appointments = await hydrateAppointmentRows(data);
  return { appointments: appointments as AdminAppointmentListItem[], count: count ?? 0, page, pageSize };
}

async function findCustomerIds(name?: string, phone?: string) {
  const admin = createAdminClient();
  let query = admin.from("customers").select("id");
  const clauses: string[] = [];

  if (name) {
    clauses.push(`full_name.ilike.%${escapeLike(name)}%`);
  }

  if (phone) {
    clauses.push(`phone.ilike.%${escapeLike(phone)}%`);
  }

  if (clauses.length > 0) {
    query = query.or(clauses.join(","));
  }

  const { data, error } = await query.limit(200);
  if (error) {
    throw new Error(`Không thể lọc khách hàng: ${error.message}`);
  }

  return data.map((customer) => customer.id);
}

export async function getAppointmentDetail(id: string) {
  const admin = createAdminClient();
  const { data: appointment, error } = await admin
    .from("appointments")
    .select(
      "id,booking_code,customer_id,service_id,appointment_date,start_time,end_time,status,source,reading_format,topic,customer_message,internal_note,cancellation_reason,confirmed_at,cancelled_at,created_by,created_at,updated_at",
    )
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !appointment) {
    throw new Error(error ? `Không tìm thấy lịch hẹn: ${error.message}` : "Không tìm thấy lịch hẹn.");
  }

  const hydrated = await hydrateAppointmentRows([appointment]);
  const { data: history, error: historyError } = await admin
    .from("appointment_status_history")
    .select("id,old_status,new_status,changed_by,note,created_at")
    .eq("appointment_id", id)
    .order("created_at", { ascending: false });

  if (historyError) {
    throw new Error(`Không thể tải lịch sử trạng thái: ${historyError.message}`);
  }

  const actorIds = Array.from(new Set((history ?? []).map((item) => item.changed_by).filter((id): id is string => Boolean(id))));
  const { data: profiles } = actorIds.length
    ? await admin.from("profiles").select("id,full_name").in("id", actorIds)
    : { data: [] as { id: string; full_name: string | null }[] };
  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return {
    ...hydrated[0],
    history: (history ?? []).map((item) => ({
      ...item,
      profiles: item.changed_by ? { full_name: profileMap.get(item.changed_by)?.full_name ?? null } : null,
    })),
  } as AdminAppointmentDetail;
}

export async function getAdminCustomerOptions() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("customers")
    .select("id,full_name,phone,email")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    throw new Error(`Không thể tải khách hàng: ${error.message}`);
  }

  return data;
}

export async function getWorkingHours() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("working_hours")
    .select("*")
    .order("day_of_week")
    .order("start_time");

  if (error) {
    throw new Error("Không thể tải lịch làm việc.");
  }

  return data;
}

export function formatAdminDate(value: string) {
  return format(new Date(value), "dd/MM/yyyy HH:mm");
}

export function formatAdminAppointmentDate(appointment: {
  appointment_date?: string | null;
  start_time: string;
}) {
  if (appointment.appointment_date) {
    const time = appointment.start_time.slice(0, 5);
    return `${format(new Date(`${appointment.appointment_date}T00:00:00`), "dd/MM/yyyy")} ${time}`;
  }

  return format(new Date(appointment.start_time), "dd/MM/yyyy HH:mm");
}

export function formatAdminAppointmentRange(appointment: {
  appointment_date?: string | null;
  start_time: string;
  end_time: string;
}) {
  if (appointment.appointment_date) {
    const date = format(new Date(`${appointment.appointment_date}T00:00:00`), "dd/MM/yyyy");
    return `${date} ${appointment.start_time.slice(0, 5)} - ${appointment.end_time.slice(0, 5)}`;
  }

  return `${formatAdminDate(appointment.start_time)} - ${formatAdminDate(appointment.end_time)}`;
}
