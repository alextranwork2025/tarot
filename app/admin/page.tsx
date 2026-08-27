import Link from "next/link";

import { signOutAction } from "@/lib/actions/auth";
import { requireAdminProfile } from "@/lib/auth/admin";
import { formatAdminAppointmentDate, getAdminDashboard } from "@/lib/queries/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const profile = await requireAdminProfile();
  const dashboard = await getAdminDashboard();

  return (
    <main className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-antique-gold">Xin chào {profile.full_name ?? profile.id}</p>
            <h1 className="font-serif text-5xl text-ivory">Bảng điều khiển</h1>
          </div>
          <form action={signOutAction}>
            <button className="min-h-10 rounded-full border border-gilded px-4 text-sm text-stone-mist hover:text-antique-gold">Đăng xuất</button>
          </form>
        </div>
        <nav className="mt-8 flex flex-wrap gap-3">
          {[
            ["/admin/lich-hen", "Lịch hẹn"],
            ["/admin/khach-hang", "Khách hàng"],
            ["/admin/dich-vu", "Dịch vụ"],
            ["/admin/lich-lam-viec", "Lịch làm việc"],
            ["/admin/bai-viet", "Bài viết"],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="rounded-full border border-gilded/50 px-4 py-2 text-sm text-stone-mist hover:border-antique-gold hover:text-antique-gold">
              {label}
            </Link>
          ))}
        </nav>
        <section className="mt-10 grid gap-4 md:grid-cols-5">
          {[
            ["Hôm nay", dashboard.counts.today],
            ["Chờ xác nhận", dashboard.counts.pending],
            ["Đã xác nhận", dashboard.counts.confirmed],
            ["Hoàn thành", dashboard.counts.completed],
            ["Đã hủy/từ chối", dashboard.counts.cancelledOrRejected],
          ].map(([label, value]) => (
            <article key={label} className="rounded-lg border border-gilded/40 bg-card-deep/75 p-5">
              <p className="text-sm text-stone-mist">{label}</p>
              <p className="mt-3 font-serif text-4xl text-ivory">{value}</p>
            </article>
          ))}
        </section>
        <section className="mt-10 rounded-lg border border-gilded/40 bg-card-deep/75 p-5">
          <h2 className="font-serif text-3xl text-ivory">Lịch hôm nay</h2>
          <div className="mt-5 grid gap-3">
            {dashboard.todayAppointments.length === 0 ? (
              <p className="text-stone-mist">Chưa có lịch nào hôm nay.</p>
            ) : (
              dashboard.todayAppointments.map((item) => (
                <Link key={item.id} href={`/admin/lich-hen/${item.id}`} className="rounded-sm border border-gilded/30 p-4 text-stone-mist hover:border-antique-gold">
                  <span className="text-antique-gold">{item.booking_code}</span> · {formatAdminAppointmentDate(item)} · {item.status}
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
