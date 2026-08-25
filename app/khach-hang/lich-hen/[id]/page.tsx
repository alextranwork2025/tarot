import Link from "next/link";

import { requireCustomer } from "@/lib/auth/customer";
import { formatAdminAppointmentRange } from "@/lib/queries/admin";
import { getCustomerAppointmentDetail } from "@/lib/queries/customer";

export const dynamic = "force-dynamic";

export default async function CustomerAppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const customer = await requireCustomer();
  const { id } = await params;
  const appointment = await getCustomerAppointmentDetail(customer.id, id);

  return (
    <main className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/khach-hang" className="text-sm text-antique-gold">← Tài khoản</Link>
        <h1 className="mt-4 font-serif text-5xl text-ivory">{appointment.booking_code}</h1>
        <section className="mt-8 rounded-lg border border-gilded/40 bg-card-deep/75 p-5 text-stone-mist">
          <p>Dịch vụ: {appointment.services?.name ?? "Dịch vụ"}</p>
          <p>Thời gian: {formatAdminAppointmentRange(appointment)}</p>
          <p>Trạng thái: {appointment.status}</p>
          <p>Thời lượng: {appointment.services?.duration_minutes ?? "-"} phút</p>
          <p>Giá: {appointment.services?.price === 0 ? "Đang cập nhật" : `${appointment.services?.price.toLocaleString("vi-VN")}đ`}</p>
          <p>Lời nhắn của bạn: {appointment.customer_message ?? "Không có"}</p>
        </section>
      </div>
    </main>
  );
}
