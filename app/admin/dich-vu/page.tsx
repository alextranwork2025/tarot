import Link from "next/link";

import { ServiceEditForm } from "@/components/admin/AdminActionForm";
import { requireOwnerAdmin } from "@/lib/auth/admin";
import { getAllServicesForAdmin } from "@/lib/queries/services";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  await requireOwnerAdmin();
  const services = await getAllServicesForAdmin();

  return (
    <main className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/admin" className="text-sm text-antique-gold">← Dashboard</Link>
        <h1 className="mt-4 font-serif text-5xl text-ivory">Dịch vụ</h1>
        <p className="mt-3 text-stone-mist">Giá 0 được giữ là placeholder, không tự suy đoán giá thật.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {services.map((service) => <ServiceEditForm key={service.id} service={service} />)}
        </div>
      </div>
    </main>
  );
}
