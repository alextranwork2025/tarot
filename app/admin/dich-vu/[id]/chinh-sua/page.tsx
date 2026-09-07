import Link from "next/link";

import { ServiceForm } from "@/components/services/ServiceForm";
import { requireAdminProfile } from "@/lib/auth/admin";
import { getAdminService } from "@/lib/queries/services";

export const dynamic = "force-dynamic";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminProfile();
  const { id } = await params;
  const service = await getAdminService(id);

  return (
    <main className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href={`/admin/dich-vu/${service.id}`} className="text-sm text-antique-gold">← Chi tiết dịch vụ</Link>
        <h1 className="mt-4 font-serif text-5xl text-ivory">Chỉnh sửa dịch vụ</h1>
        <div className="mt-8">
          <ServiceForm service={service} />
        </div>
      </div>
    </main>
  );
}
