import Link from "next/link";

import { ServiceForm } from "@/components/services/ServiceForm";
import { requireAdminProfile } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export default async function CreateServicePage() {
  await requireAdminProfile();

  return (
    <main className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin/dich-vu" className="text-sm text-antique-gold">← Quản lý dịch vụ</Link>
        <h1 className="mt-4 font-serif text-5xl text-ivory">Tạo dịch vụ</h1>
        <div className="mt-8">
          <ServiceForm />
        </div>
      </div>
    </main>
  );
}
