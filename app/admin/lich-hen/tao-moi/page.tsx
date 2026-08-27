import Link from "next/link";

import { AppointmentForm } from "@/components/admin/AppointmentForm";
import { requireAdminProfile } from "@/lib/auth/admin";
import { getAdminCustomerOptions } from "@/lib/queries/admin";
import { getActiveServices } from "@/lib/queries/services";

export const dynamic = "force-dynamic";

export default async function CreateAdminAppointmentPage() {
  await requireAdminProfile();
  const [services, customers] = await Promise.all([getActiveServices(), getAdminCustomerOptions()]);

  return (
    <main className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin/lich-hen" className="text-sm text-antique-gold">← Quản lý lịch hẹn</Link>
        <h1 className="mt-4 font-serif text-5xl text-ivory">Tạo lịch hẹn</h1>
        <div className="mt-8">
          <AppointmentForm mode="create" services={services} customers={customers} />
        </div>
      </div>
    </main>
  );
}
