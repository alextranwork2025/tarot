import Link from "next/link";
import { StoneForm } from "@/components/stones/StoneForm";
import { requireAdminProfile } from "@/lib/auth/admin";
export const dynamic = "force-dynamic";
export default async function NewStonePage() { await requireAdminProfile(); return <main className="min-h-screen px-5 py-10 md:px-8"><div className="mx-auto max-w-5xl"><Link href="/admin/loai-da" className="text-sm text-antique-gold">← Quản lý loại đá</Link><h1 className="my-6 font-serif text-5xl text-ivory">Tạo loại đá</h1><StoneForm /></div></main>; }
