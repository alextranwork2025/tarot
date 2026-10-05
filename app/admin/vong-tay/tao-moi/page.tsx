import Link from "next/link";

import { BraceletForm } from "@/components/bracelets/BraceletForm";
import { requireAdminProfile } from "@/lib/auth/admin";
import { getStoneOptions } from "@/lib/queries/stones";

export const dynamic = "force-dynamic";

export default async function NewBraceletPage() {
  await requireAdminProfile();
  const stones = await getStoneOptions();
  return <main className="min-h-screen px-5 py-10 md:px-8"><div className="mx-auto max-w-5xl"><Link href="/admin/vong-tay" className="text-sm text-antique-gold">← Quản lý vòng tay</Link><h1 className="my-6 font-serif text-5xl text-ivory">Tạo vòng tay</h1><BraceletForm stones={stones} /></div></main>;
}
