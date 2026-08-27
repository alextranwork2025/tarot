import Link from "next/link";

import { StatusBadge, StatusQuickActions } from "@/components/admin/AdminActionForm";
import { appointmentStatusLabels } from "@/lib/booking/status";
import { requireAdminProfile } from "@/lib/auth/admin";
import {
  formatAdminAppointmentRange,
  formatAdminDate,
  getAppointments,
  getAppointmentStats,
  parseAppointmentStatus,
} from "@/lib/queries/admin";
import { getAllServicesForAdmin } from "@/lib/queries/services";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    q?: string;
    bookingCode?: string;
    customerName?: string;
    phone?: string;
    date?: string;
    fromDate?: string;
    toDate?: string;
    service?: string;
    status?: string;
    page?: string;
    sort?: "upcoming" | "newest";
  }>;
};

function buildPageHref(params: Awaited<Props["searchParams"]>, page: number) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value && key !== "page") {
      query.set(key, value);
    }
  });
  query.set("page", String(page));
  return `/admin/lich-hen?${query.toString()}`;
}

export default async function AdminAppointmentsPage({ searchParams }: Props) {
  await requireAdminProfile();
  const params = await searchParams;
  const status = parseAppointmentStatus(params.status);
  const [services, result, stats] = await Promise.all([
    getAllServicesForAdmin(),
    getAppointments({
      query: params.q,
      bookingCode: params.bookingCode,
      customerName: params.customerName,
      phone: params.phone,
      date: params.date,
      fromDate: params.fromDate,
      toDate: params.toDate,
      serviceId: params.service,
      status,
      page: params.page ? Number(params.page) : 1,
      sort: params.sort,
    }),
    getAppointmentStats(),
  ]);
  const totalPages = Math.max(1, Math.ceil(result.count / result.pageSize));
  const hasFilters = Boolean(params.q || params.bookingCode || params.customerName || params.phone || params.date || params.fromDate || params.toDate || params.service || (params.status && params.status !== "all"));

  return (
    <main className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/admin" className="text-sm text-antique-gold">← Dashboard</Link>
            <h1 className="mt-4 font-serif text-5xl text-ivory">Quản lý lịch hẹn</h1>
          </div>
          <Link href="/admin/lich-hen/tao-moi" className="inline-flex min-h-11 items-center justify-center rounded-full bg-antique-gold px-5 text-sm font-semibold text-obsidian hover:bg-ivory">
            Tạo lịch hẹn
          </Link>
        </div>

        <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Lịch hôm nay", stats.today],
            ["Chờ xác nhận", stats.pending],
            ["Đã xác nhận", stats.confirmed],
            ["Đã hoàn thành", stats.completed],
            ["Đã hủy/từ chối", stats.cancelledOrRejected],
          ].map(([label, value]) => (
            <article key={label} className="rounded-lg border border-gilded/40 bg-card-deep/75 p-4">
              <p className="text-sm text-stone-mist">{label}</p>
              <p className="mt-2 font-serif text-3xl text-ivory">{value}</p>
            </article>
          ))}
        </section>

        <form className="mt-8 grid gap-3 rounded-lg border border-gilded/40 bg-card-deep/75 p-4 lg:grid-cols-6">
          <input name="q" defaultValue={params.q} placeholder="Từ khóa" className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory" />
          <input name="bookingCode" defaultValue={params.bookingCode} placeholder="Mã lịch" className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory" />
          <input name="customerName" defaultValue={params.customerName} placeholder="Tên khách hàng" className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory" />
          <input name="phone" defaultValue={params.phone} placeholder="Số điện thoại" className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory" />
          <input name="date" type="date" defaultValue={params.date} className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory" />
          <select name="status" defaultValue={status} className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory">
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(appointmentStatusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
          <input name="fromDate" type="date" defaultValue={params.fromDate} className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory" />
          <input name="toDate" type="date" defaultValue={params.toDate} className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory" />
          <select name="service" defaultValue={params.service ?? ""} className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory lg:col-span-2">
            <option value="">Tất cả dịch vụ</option>
            {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
          </select>
          <select name="sort" defaultValue={params.sort ?? "upcoming"} className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory">
            <option value="upcoming">Sắp tới</option>
            <option value="newest">Mới tạo</option>
          </select>
          <button className="min-h-10 rounded-full bg-antique-gold px-4 text-sm text-obsidian">Lọc</button>
        </form>

        <div className="mt-6 text-sm text-stone-mist">Tổng {result.count} lịch hẹn · Trang {result.page}/{totalPages}</div>

        {result.appointments.length === 0 ? (
          <section className="mt-6 rounded-lg border border-gilded/40 bg-card-deep/75 p-8 text-center text-stone-mist">
            {hasFilters ? "Không có kết quả phù hợp với bộ lọc." : "Chưa có lịch hẹn nào."}
          </section>
        ) : (
          <>
            <div className="mt-6 hidden overflow-x-auto rounded-lg border border-gilded/40 md:block">
              <table className="w-full min-w-[1024px] text-left text-sm">
                <thead className="bg-card-deep text-antique-gold">
                  <tr>
                    {["Mã lịch", "Ngày hẹn", "Khung giờ", "Khách hàng", "Số điện thoại", "Dịch vụ", "Thời lượng", "Trạng thái", "Ngày tạo", "Thao tác"].map((header) => (
                      <th key={header} className="p-3 font-medium">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.appointments.map((item) => (
                    <tr key={item.id} className="border-t border-gilded/30 text-stone-mist">
                      <td className="p-3 text-antique-gold">{item.booking_code}</td>
                      <td className="p-3">{formatAdminAppointmentRange(item).split(" ")[0]}</td>
                      <td className="p-3">{item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}</td>
                      <td className="p-3 text-ivory">{item.customers?.full_name ?? "Không rõ"}</td>
                      <td className="p-3">{item.customers?.phone ?? "Không rõ"}</td>
                      <td className="p-3">{item.services?.name ?? "Không rõ"}</td>
                      <td className="p-3">{item.services?.duration_minutes ?? "-"} phút</td>
                      <td className="p-3"><StatusBadge status={item.status} /></td>
                      <td className="p-3">{formatAdminDate(item.created_at)}</td>
                      <td className="p-3">
                        <div className="grid gap-2">
                          <div className="flex gap-3">
                            <Link className="text-antique-gold" href={`/admin/lich-hen/${item.id}`}>Xem</Link>
                            <Link className="text-antique-gold" href={`/admin/lich-hen/${item.id}/chinh-sua`}>Sửa</Link>
                          </div>
                          <StatusQuickActions appointmentId={item.id} currentStatus={item.status} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 grid gap-3 md:hidden">
              {result.appointments.map((item) => (
                <article key={item.id} className="rounded-lg border border-gilded/40 bg-card-deep/75 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-antique-gold">{item.booking_code}</p>
                      <p className="text-sm text-ivory">{item.customers?.full_name ?? "Không rõ"}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-3 text-sm text-stone-mist">{formatAdminAppointmentRange(item)}</p>
                  <p className="text-sm text-stone-mist">{item.customers?.phone ?? "Không rõ"} · {item.services?.name ?? "Không rõ"}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    <Link className="text-antique-gold" href={`/admin/lich-hen/${item.id}`}>Xem chi tiết</Link>
                    <Link className="text-antique-gold" href={`/admin/lich-hen/${item.id}/chinh-sua`}>Chỉnh sửa</Link>
                  </div>
                  <div className="mt-3">
                    <StatusQuickActions appointmentId={item.id} currentStatus={item.status} />
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        <nav className="mt-8 flex items-center justify-between text-sm">
          {result.page > 1 ? <Link className="text-antique-gold" href={buildPageHref(params, result.page - 1)}>← Trang trước</Link> : <span />}
          {result.page < totalPages ? <Link className="text-antique-gold" href={buildPageHref(params, result.page + 1)}>Trang sau →</Link> : <span />}
        </nav>
      </div>
    </main>
  );
}
