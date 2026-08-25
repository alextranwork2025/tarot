import { createAdminClient } from "@/lib/supabase/admin";

export type CustomerAppointment = {
  id: string;
  booking_code: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  service_id: string;
  services?: { name: string; duration_minutes: number; price: number } | null;
};

export async function getCustomerAppointments(customerId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("appointments")
    .select("id,booking_code,appointment_date,start_time,end_time,status,service_id")
    .eq("customer_id", customerId)
    .is("deleted_at", null)
    .order("appointment_date", { ascending: false })
    .order("start_time", { ascending: false });

  if (error) {
    throw new Error(`Không thể tải lịch hẹn khách hàng: ${error.message}`);
  }

  const appointments = data as CustomerAppointment[];
  const serviceIds = Array.from(new Set(appointments.map((item) => item.service_id)));

  if (serviceIds.length === 0) {
    return [];
  }

  const { data: services } = await admin
    .from("services")
    .select("id,name,duration_minutes,price")
    .in("id", serviceIds);
  const serviceMap = new Map((services ?? []).map((service) => [service.id, service]));

  return appointments.map((appointment) => ({
    ...appointment,
    services: serviceMap.get(appointment.service_id) ?? null,
  }));
}

export async function getCustomerAppointmentDetail(customerId: string, appointmentId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("appointments")
    .select("id,booking_code,appointment_date,start_time,end_time,status,customer_message,service_id")
    .eq("id", appointmentId)
    .eq("customer_id", customerId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) {
    throw new Error(error ? `Không thể tải chi tiết lịch hẹn: ${error.message}` : "Không tìm thấy lịch hẹn.");
  }

  const { data: service } = await admin
    .from("services")
    .select("name,description,duration_minutes,price")
    .eq("id", data.service_id)
    .maybeSingle();

  return {
    ...data,
    services: service,
  };
}
