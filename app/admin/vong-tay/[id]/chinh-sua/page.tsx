import Link from "next/link";

import { BraceletForm } from "@/components/bracelets/BraceletForm";
import { requireAdminProfile } from "@/lib/auth/admin";
import { getAdminBracelet } from "@/lib/queries/bracelets";
import { getStoneOptions } from "@/lib/queries/stones";

export const dynamic = "force-dynamic";

export default async function EditBraceletPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminProfile();
  const { id } = await params;
  const [bracelet, stones] = await Promise.all([getAdminBracelet(id), getStoneOptions()]);
  return <main className="min-h-screen px-5 py-10 md:px-8"><div className="mx-auto max-w-5xl"><Link href={`/admin/vong-tay/${id}`} className="text-sm text-antique-gold">← Chi tiết vòng tay</Link><h1 className="my-6 font-serif text-5xl text-ivory">Chỉnh sửa vòng tay</h1><BraceletForm bracelet={bracelet} stones={stones} /></div></main>;
}
