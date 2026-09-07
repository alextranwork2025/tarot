import Link from "next/link";
import { StoneForm } from "@/components/stones/StoneForm";
import { requireAdminProfile } from "@/lib/auth/admin";
import { getAdminStone } from "@/lib/queries/stones";
export const dynamic = "force-dynamic";
export default async function EditStonePage({ params }: { params: Promise<{ id: string }> }) { await requireAdminProfile(); const { id } = await params; const stone = await getAdminStone(id); return <main className="min-h-screen px-5 py-10 md:px-8"><div className="mx-auto max-w-5xl"><Link href={`/admin/loai-da/${id}`} className="text-sm text-antique-gold">← Chi tiết loại đá</Link><h1 className="my-6 font-serif text-5xl text-ivory">Chỉnh sửa loại đá</h1><StoneForm stone={stone} /></div></main>; }
