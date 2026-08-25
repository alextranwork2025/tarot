import Link from "next/link";

import { WorkingHourForm } from "@/components/admin/AdminActionForm";
import { requireOwnerAdmin } from "@/lib/auth/admin";
import { getWorkingHours } from "@/lib/queries/admin";

export const dynamic = "force-dynamic";

export default async function AdminWorkingHoursPage() {
  await requireOwnerAdmin();
  const hours = await getWorkingHours();

  return (
    <main className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/admin" className="text-sm text-antique-gold">← Dashboard</Link>
        <h1 className="mt-4 font-serif text-5xl text-ivory">Lịch làm việc</h1>
        <div className="mt-8 grid gap-4">
          {hours.map((hour) => <WorkingHourForm key={hour.id} hour={hour} />)}
          <WorkingHourForm />
        </div>
      </div>
    </main>
  );
}
