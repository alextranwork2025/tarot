import Link from "next/link";

import { InternalNoteForm, StatusBadge, StatusForm } from "@/components/admin/AdminActionForm";
import { appointmentStatusLabels, isTerminalStatus } from "@/lib/booking/status";
import { requireAdminProfile } from "@/lib/auth/admin";
import { formatAdminAppointmentRange, formatAdminDate, getAppointmentDetail } from "@/lib/queries/admin";

export const dynamic = "force-dynamic";

export default async function AdminAppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminProfile();
  const { id } = await params;
  const appointment = await getAppointmentDetail(id);

  return (
    <main className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/admin/lich-hen" className="text-sm text-antique-gold">← Danh sách lịch hẹn</Link>
            <h1 className="mt-4 font-serif text-5xl text-ivory">{appointment.booking_code}</h1>
          </div>
          {!isTerminalStatus(appointment.status) ? (
            <Link href={`/admin/lich-hen/${appointment.id}/chinh-sua`} className="inline-flex min-h-10 items-center justify-center rounded-full border border-antique-gold px-4 text-sm text-antique-gold hover:bg-antique-gold hover:text-obsidian">
              Chỉnh sửa
            </Link>
          ) : null}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-lg border border-gilded/40 bg-card-deep/75 p-5 text-sm text-stone-mist">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-serif text-3xl text-ivory">Thông tin lịch hẹn</h2>
              <StatusBadge status={appointment.status} />
            </div>
            <dl className="mt-5 grid gap-4 md:grid-cols-2">
              <div><dt className="text-antique-gold">Dịch vụ</dt><dd>{appointment.services?.name ?? "Không rõ"}</dd></div>
              <div><dt className="text-antique-gold">Thời lượng</dt><dd>{appointment.services?.duration_minutes ?? "-"} phút</dd></div>
              <div><dt className="text-antique-gold">Ngày giờ</dt><dd>{formatAdminAppointmentRange(appointment)}</dd></div>
              <div><dt className="text-antique-gold">Nguồn tạo</dt><dd>{appointment.source === "admin" ? "Quản trị" : "Website"}</dd></div>
              <div><dt className="text-antique-gold">Ngày tạo</dt><dd>{formatAdminDate(appointment.created_at)}</dd></div>
              <div><dt className="text-antique-gold">Cập nhật</dt><dd>{appointment.updated_at ? formatAdminDate(appointment.updated_at) : "Chưa có"}</dd></div>
              <div><dt className="text-antique-gold">Khách hàng</dt><dd>{appointment.customers?.full_name ?? "Không rõ"}</dd></div>
              <div><dt className="text-antique-gold">Số điện thoại</dt><dd>{appointment.customers?.phone ?? "Không rõ"}</dd></div>
            </dl>
            <div className="mt-6 grid gap-4">
              <div>
                <h3 className="font-serif text-2xl text-ivory">Lời nhắn khách hàng</h3>
                <p className="mt-2">{appointment.customer_message || "Không có"}</p>
              </div>
              {appointment.cancellation_reason ? (
                <div>
                  <h3 className="font-serif text-2xl text-ivory">Lý do hủy/từ chối</h3>
                  <p className="mt-2">{appointment.cancellation_reason}</p>
                </div>
              ) : null}
              <div>
                <h3 className="font-serif text-2xl text-ivory">Ghi chú nội bộ</h3>
                <div className="mt-3">
                  <InternalNoteForm appointmentId={appointment.id} defaultValue={appointment.internal_note ?? ""} />
                </div>
              </div>
            </div>
          </section>

          <aside className="grid gap-6 content-start">
            <StatusForm appointmentId={appointment.id} currentStatus={appointment.status} />
            <section className="rounded-lg border border-gilded/40 bg-card-deep/75 p-4">
              <h2 className="font-serif text-3xl text-ivory">Lịch sử trạng thái</h2>
              <div className="mt-4 grid gap-3">
                {appointment.history.length === 0 ? (
                  <p className="text-sm text-stone-mist">Chưa có thay đổi trạng thái.</p>
                ) : (
                  appointment.history.map((item) => (
                    <article key={item.id} className="border-l border-antique-gold/60 pl-4 text-sm text-stone-mist">
                      <p className="text-ivory">
                        {item.old_status ? appointmentStatusLabels[item.old_status] : "Khởi tạo"} → {appointmentStatusLabels[item.new_status]}
                      </p>
                      <p>{formatAdminDate(item.created_at)}</p>
                      <p>{item.profiles?.full_name ?? item.changed_by ?? "Hệ thống"}</p>
                      {item.note ? <p className="text-antique-gold">{item.note}</p> : null}
                    </article>
                  ))
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
