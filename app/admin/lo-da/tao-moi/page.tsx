import Link from "next/link";
import { StoneJarForm } from "@/components/stones/StoneJarForm";
import { requireAdminProfile } from "@/lib/auth/admin";
import { getStoneOptions } from "@/lib/queries/stones";
export const dynamic = "force-dynamic";
export default async function NewJarPage() { await requireAdminProfile(); const stones = await getStoneOptions(); return <main className="min-h-screen px-5 py-10 md:px-8"><div className="mx-auto max-w-5xl"><Link href="/admin/lo-da" className="text-sm text-antique-gold">← Quản lý lọ đá</Link><h1 className="my-6 font-serif text-5xl text-ivory">Tạo lọ đá</h1><StoneJarForm stones={stones} /></div></main>; }
