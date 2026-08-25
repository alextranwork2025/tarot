import Link from "next/link";

import { requireAdminProfile } from "@/lib/auth/admin";
import { formatAdminAppointmentDate, getAppointments } from "@/lib/queries/admin";
import { getAllServicesForAdmin } from "@/lib/queries/services";
import type { AppointmentStatus } from "@/types/database.types";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    q?: string;
    date?: string;
    service?: string;
    status?: AppointmentStatus | "all";
    page?: string;
    view?: "list" | "calendar";
  }>;
};

export default async function AdminAppointmentsPage({ searchParams }: Props) {
  await requireAdminProfile();
  const params = await searchParams;
  const [services, result] = await Promise.all([
    getAllServicesForAdmin(),
    getAppointments({
      query: params.q,
      date: params.date,
      serviceId: params.service,
      status: params.status,
      page: params.page ? Number(params.page) : 1,
    }),
  ]);

  return (
    <main className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/admin" className="text-sm text-antique-gold">← Dashboard</Link>
        <h1 className="mt-4 font-serif text-5xl text-ivory">Lịch hẹn</h1>
        <form className="mt-8 grid gap-3 rounded-lg border border-gilded/40 bg-card-deep/75 p-4 md:grid-cols-5">
          <input name="q" defaultValue={params.q} placeholder="Mã lịch hẹn" className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory" />
          <input name="date" type="date" defaultValue={params.date} className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory" />
          <select name="service" defaultValue={params.service ?? ""} className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory">
            <option value="">Tất cả dịch vụ</option>
            {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
          </select>
          <select name="status" defaultValue={params.status ?? "all"} className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory">
            {["all", "pending", "confirmed", "declined", "rescheduled", "completed", "cancelled", "no_show"].map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <button className="min-h-10 rounded-full bg-antique-gold px-4 text-sm text-obsidian">Lọc</button>
        </form>
        <div className="mt-6 text-sm text-stone-mist">Chế độ: {params.view === "calendar" ? "lịch" : "danh sách"} · Tổng {result.count}</div>
        <div className="mt-6 hidden overflow-hidden rounded-lg border border-gilded/40 md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-card-deep text-antique-gold">
              <tr><th className="p-3">Mã</th><th className="p-3">Thời gian</th><th className="p-3">Trạng thái</th><th className="p-3">Chi tiết</th></tr>
            </thead>
            <tbody>
              {result.appointments.map((item) => (
                <tr key={item.id} className="border-t border-gilded/30 text-stone-mist">
                  <td className="p-3">{item.booking_code}</td>
                  <td className="p-3">{formatAdminAppointmentDate(item)}</td>
                  <td className="p-3">{item.status}</td>
                  <td className="p-3"><Link className="text-antique-gold" href={`/admin/lich-hen/${item.id}`}>Mở</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 grid gap-3 md:hidden">
          {result.appointments.map((item) => (
            <Link key={item.id} href={`/admin/lich-hen/${item.id}`} className="rounded-lg border border-gilded/40 bg-card-deep/75 p-4">
              <p className="text-antique-gold">{item.booking_code}</p>
              <p className="text-stone-mist">{formatAdminAppointmentDate(item)} · {item.status}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
