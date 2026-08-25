import { format } from "date-fns";

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

export type AdminAppointmentListItem = {
  id: string;
  booking_code: string;
  customer_id: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  customer_message: string | null;
  internal_note: string | null;
};

export type AdminAppointmentDetail = {
  id: string;
  booking_code: string;
  customer_id: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  customer_message: string | null;
  internal_note: string | null;
  customers: { full_name: string; phone: string; email: string | null } | null;
  services: { name: string } | null;
};

export type AppointmentListParams = {
  query?: string;
  date?: string;
  serviceId?: string;
  status?: AppointmentStatus | "all";
  page?: number;
  pageSize?: number;
};

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

  const todayAppointments = data as unknown as DashboardAppointment[];
  const counts = {
    today: todayAppointments.length,
    pending: todayAppointments.filter((item) => item.status === "pending").length,
    confirmed: todayAppointments.filter((item) => item.status === "confirmed").length,
    completed: todayAppointments.filter((item) => item.status === "completed").length,
    cancelled: todayAppointments.filter((item) => item.status === "cancelled").length,
  };

  return { counts, todayAppointments };
}

export async function getAppointments(params: AppointmentListParams) {
  const admin = createAdminClient();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = admin
    .from("appointments")
    .select("id,booking_code,customer_id,service_id,appointment_date,start_time,end_time,status,customer_message,internal_note", { count: "exact" })
    .is("deleted_at", null)
    .order("appointment_date", { ascending: false })
    .order("start_time", { ascending: false })
    .range(from, to);

  if (params.date) {
    query = query.eq("appointment_date", params.date);
  }

  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  if (params.serviceId) {
    query = query.eq("service_id", params.serviceId);
  }

  if (params.query) {
    query = query.or(`booking_code.ilike.%${params.query}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Không thể tải lịch hẹn: ${error.message}`);
  }

  return { appointments: data as unknown as AdminAppointmentListItem[], count: count ?? 0, page, pageSize };
}

export async function getAppointmentDetail(id: string) {
  const admin = createAdminClient();
  const { data: appointment, error } = await admin
    .from("appointments")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !appointment) {
    throw new Error(error ? `Không tìm thấy lịch hẹn: ${error.message}` : "Không tìm thấy lịch hẹn.");
  }

  const [{ data: customer }, { data: service }] = await Promise.all([
    admin
      .from("customers")
      .select("full_name,phone,email")
      .eq("id", appointment.customer_id)
      .maybeSingle(),
    admin.from("services").select("name").eq("id", appointment.service_id).maybeSingle(),
  ]);

  return {
    ...appointment,
    customers: customer,
    services: service,
  } as unknown as AdminAppointmentDetail;
}

export async function getWorkingHours() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("working_hours")
    .select("*")
    .order("weekday")
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
