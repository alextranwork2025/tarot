import Link from "next/link";

import { customerSignOutAction } from "@/lib/actions/customer/account";
import { requireCustomer } from "@/lib/auth/customer";
import { maskPhone } from "@/lib/format/privacy";
import { formatAdminAppointmentDate } from "@/lib/queries/admin";
import { getCustomerAppointments } from "@/lib/queries/customer";

export const dynamic = "force-dynamic";

export default async function CustomerDashboardPage() {
  const customer = await requireCustomer();
  const appointments = await getCustomerAppointments(customer.id);

  return (
    <main className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-antique-gold">Xin chào {customer.full_name}</p>
            <h1 className="font-serif text-5xl text-ivory">Tài khoản khách hàng</h1>
            <p className="mt-3 text-sm text-stone-mist">Số điện thoại: {maskPhone(customer.phone)}</p>
          </div>
          <form action={customerSignOutAction}>
            <button className="min-h-10 rounded-full border border-gilded px-4 text-sm text-stone-mist hover:text-antique-gold">Đăng xuất</button>
          </form>
        </div>
        <nav className="mt-8 flex flex-wrap gap-3">
          <Link href="/khach-hang/ho-so" className="rounded-full border border-gilded/50 px-4 py-2 text-sm text-stone-mist hover:border-antique-gold hover:text-antique-gold">Hồ sơ</Link>
          <Link href="/khach-hang/doi-mat-khau" className="rounded-full border border-gilded/50 px-4 py-2 text-sm text-stone-mist hover:border-antique-gold hover:text-antique-gold">Đổi mật khẩu</Link>
        </nav>
        <section className="mt-10 rounded-lg border border-gilded/40 bg-card-deep/75 p-5">
          <h2 className="font-serif text-3xl text-ivory">Lịch hẹn của bạn</h2>
          <div className="mt-5 grid gap-3">
            {appointments.length === 0 ? (
              <p className="text-stone-mist">Bạn chưa có lịch hẹn nào.</p>
            ) : (
              appointments.map((appointment) => (
                <Link key={appointment.id} href={`/khach-hang/lich-hen/${appointment.id}`} className="rounded-sm border border-gilded/30 p-4 text-stone-mist hover:border-antique-gold">
                  <span className="text-antique-gold">{appointment.booking_code}</span> · {appointment.services?.name ?? "Dịch vụ"} · {formatAdminAppointmentDate(appointment)} · {appointment.status}
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
