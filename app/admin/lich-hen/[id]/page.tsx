import Link from "next/link";

import { InternalNoteForm, StatusForm } from "@/components/admin/AdminActionForm";
import { requireAdminProfile } from "@/lib/auth/admin";
import { formatAdminAppointmentRange, getAppointmentDetail } from "@/lib/queries/admin";

export const dynamic = "force-dynamic";

export default async function AdminAppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminProfile();
  const { id } = await params;
  const appointment = await getAppointmentDetail(id);

  return (
    <main className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin/lich-hen" className="text-sm text-antique-gold">← Danh sách lịch hẹn</Link>
        <h1 className="mt-4 font-serif text-5xl text-ivory">{appointment.booking_code}</h1>
        <div className="mt-8 grid gap-6 md:grid-cols-[1fr_360px]">
          <section className="rounded-lg border border-gilded/40 bg-card-deep/75 p-5 text-stone-mist">
            <p>Dịch vụ: {appointment.services?.name}</p>
            <p>Thời gian: {formatAdminAppointmentRange(appointment)}</p>
            <p>Trạng thái: {appointment.status}</p>
            <p>Khách: {appointment.customers?.full_name} · {appointment.customers?.phone}</p>
            <p>Lời nhắn: {appointment.customer_message ?? "Không có"}</p>
            <div className="mt-6">
              <h2 className="font-serif text-3xl text-ivory">Ghi chú nội bộ</h2>
              <div className="mt-3">
                <InternalNoteForm appointmentId={appointment.id} defaultValue={appointment.internal_note ?? ""} />
              </div>
            </div>
          </section>
          <StatusForm appointmentId={appointment.id} currentStatus={appointment.status} />
        </div>
      </div>
    </main>
  );
}
