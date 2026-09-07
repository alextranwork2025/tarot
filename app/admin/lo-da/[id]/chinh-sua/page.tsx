import Link from "next/link";
import { StoneJarForm } from "@/components/stones/StoneJarForm";
import { requireAdminProfile } from "@/lib/auth/admin";
import { getAdminStoneJar, getStoneOptions } from "@/lib/queries/stones";
export const dynamic = "force-dynamic";
export default async function EditJarPage({ params }: { params: Promise<{ id: string }> }) { await requireAdminProfile(); const { id } = await params; const [jar, stones] = await Promise.all([getAdminStoneJar(id), getStoneOptions()]); return <main className="min-h-screen px-5 py-10 md:px-8"><div className="mx-auto max-w-5xl"><Link href={`/admin/lo-da/${id}`} className="text-sm text-antique-gold">← Chi tiết lọ đá</Link><h1 className="my-6 font-serif text-5xl text-ivory">Chỉnh sửa lọ đá</h1><StoneJarForm jar={jar} stones={stones} /></div></main>; }
