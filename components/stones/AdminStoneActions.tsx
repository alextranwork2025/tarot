"use client";

import { Eye, EyeOff, FilePenLine, Send, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import { deleteStone, deleteStoneJar, hideStone, hideStoneJar, publishStone, publishStoneJar, type StoneActionState } from "@/lib/actions/stones";
import type { StoneStatus } from "@/types/stones";

const empty: StoneActionState = { ok: false, message: "" };
export function AdminStoneActions({ item, kind, compact = false }: { item: { id: string; slug: string; status: StoneStatus; updated_at: string }; kind: "stone" | "jar"; compact?: boolean }) {
  const [pending, start] = useTransition(); const [message, setMessage] = useState<StoneActionState>(empty);
  const adminRoot = kind === "stone" ? "/admin/loai-da" : "/admin/lo-da"; const publicRoot = kind === "stone" ? "/da-phong-thuy" : "/lo-da-phong-thuy";
  function run(action: (previous: StoneActionState, data: FormData) => Promise<StoneActionState>) { const data = new FormData(); data.set("id", item.id); data.set("expectedUpdatedAt", item.updated_at); start(async () => setMessage(await action(empty, data))); }
  const publish = kind === "stone" ? publishStone : publishStoneJar; const hide = kind === "stone" ? hideStone : hideStoneJar; const remove = kind === "stone" ? deleteStone : deleteStoneJar;
  return <div className="grid gap-2"><div className="flex flex-wrap gap-2">
    <Link title="Xem" href={`${adminRoot}/${item.id}`} className="grid size-9 place-items-center rounded-sm border border-gilded/50 text-stone-mist hover:border-antique-gold"><Eye size={16} /></Link>
    <Link title="Chỉnh sửa" href={`${adminRoot}/${item.id}/chinh-sua`} className="grid size-9 place-items-center rounded-sm border border-gilded/50 text-stone-mist hover:border-antique-gold"><FilePenLine size={16} /></Link>
    {item.status !== "published" ? <button disabled={pending} title="Xuất bản" onClick={() => run(publish)} className="grid size-9 place-items-center rounded-sm border border-gilded/50 text-stone-mist hover:border-antique-gold disabled:opacity-60"><Send size={16} /></button> : <button disabled={pending} title="Ẩn" onClick={() => run(hide)} className="grid size-9 place-items-center rounded-sm border border-gilded/50 text-stone-mist hover:border-antique-gold disabled:opacity-60"><EyeOff size={16} /></button>}
    <button disabled={pending} title="Xóa" onClick={() => window.confirm("Xóa nội dung này?") && run(remove)} className="grid size-9 place-items-center rounded-sm border border-wine/70 text-red-100 hover:bg-wine disabled:opacity-60"><Trash2 size={16} /></button>
    {!compact && item.status === "published" ? <Link href={`${publicRoot}/${item.slug}`} className="inline-flex min-h-9 items-center rounded-full border border-gilded/50 px-3 text-xs text-stone-mist hover:border-antique-gold">Trang công khai</Link> : null}
  </div>{message.message ? <p role="status" className={message.ok ? "text-antique-gold" : "text-red-200"}>{message.message}</p> : null}</div>;
}
