import Link from "next/link";

import { AppointmentForm } from "@/components/admin/AppointmentForm";
import { isTerminalStatus } from "@/lib/booking/status";
import { requireAdminProfile } from "@/lib/auth/admin";
import { getAdminCustomerOptions, getAppointmentDetail } from "@/lib/queries/admin";
import { getActiveServices } from "@/lib/queries/services";

export const dynamic = "force-dynamic";

export default async function EditAdminAppointmentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminProfile();
  const { id } = await params;
  const [appointment, services, customers] = await Promise.all([
    getAppointmentDetail(id),
    getActiveServices(),
    getAdminCustomerOptions(),
  ]);

  return (
    <main className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href={`/admin/lich-hen/${appointment.id}`} className="text-sm text-antique-gold">← Chi tiết lịch hẹn</Link>
        <h1 className="mt-4 font-serif text-5xl text-ivory">Chỉnh sửa lịch hẹn</h1>
        <div className="mt-8">
          <AppointmentForm
            mode="edit"
            services={services}
            customers={customers}
            initial={appointment}
            locked={isTerminalStatus(appointment.status)}
          />
        </div>
      </div>
    </main>
  );
}
