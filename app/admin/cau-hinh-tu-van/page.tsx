import Link from "next/link";

import { ContactSettingsForm } from "@/components/bracelets/ContactSettingsForm";
import { requireAdminProfile } from "@/lib/auth/admin";
import { getContactSettings } from "@/lib/queries/bracelets";

export const dynamic = "force-dynamic";

export default async function ContactSettingsPage() {
  await requireAdminProfile();
  const settings = await getContactSettings();
  return (
    <main className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/admin" className="text-sm text-antique-gold">← Dashboard</Link>
        <h1 className="my-6 font-serif text-5xl text-ivory">Cấu hình tư vấn</h1>
        <ContactSettingsForm settings={settings} />
      </div>
    </main>
  );
}
