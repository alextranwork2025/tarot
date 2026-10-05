"use client";

import { Eye, EyeOff, FilePenLine, Send, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import { deleteBracelet, hideBracelet, publishBracelet, type BraceletActionState } from "@/lib/actions/bracelets";
import type { BraceletStatus } from "@/types/bracelets";

const empty: BraceletActionState = { ok: false, message: "" };

export function AdminBraceletActions({ item, compact = false }: { item: { id: string; slug: string; status: BraceletStatus; updated_at: string }; compact?: boolean }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<BraceletActionState>(empty);
  function run(action: (previous: BraceletActionState, data: FormData) => Promise<BraceletActionState>) {
    const data = new FormData();
    data.set("id", item.id);
    data.set("expectedUpdatedAt", item.updated_at);
    start(async () => setMessage(await action(empty, data)));
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        <Link title="Xem" href={`/admin/vong-tay/${item.id}`} className="grid size-9 place-items-center rounded-sm border border-gilded/50 text-stone-mist hover:border-antique-gold"><Eye size={16} /></Link>
        <Link title="Chỉnh sửa" href={`/admin/vong-tay/${item.id}/chinh-sua`} className="grid size-9 place-items-center rounded-sm border border-gilded/50 text-stone-mist hover:border-antique-gold"><FilePenLine size={16} /></Link>
        {item.status !== "published" ? (
          <button disabled={pending} title="Công khai" onClick={() => run(publishBracelet)} className="grid size-9 place-items-center rounded-sm border border-gilded/50 text-stone-mist hover:border-antique-gold disabled:opacity-60"><Send size={16} /></button>
        ) : (
          <button disabled={pending} title="Ẩn" onClick={() => run(hideBracelet)} className="grid size-9 place-items-center rounded-sm border border-gilded/50 text-stone-mist hover:border-antique-gold disabled:opacity-60"><EyeOff size={16} /></button>
        )}
        <button disabled={pending} title="Xóa" onClick={() => window.confirm("Xóa vòng tay này?") && run(deleteBracelet)} className="grid size-9 place-items-center rounded-sm border border-wine/70 text-red-100 hover:bg-wine disabled:opacity-60"><Trash2 size={16} /></button>
        {!compact && item.status === "published" ? <Link href={`/vong-tay-phong-thuy/${item.slug}`} className="inline-flex min-h-9 items-center rounded-full border border-gilded/50 px-3 text-xs text-stone-mist hover:border-antique-gold">Trang công khai</Link> : null}
      </div>
      {message.message ? <p role="status" className={message.ok ? "text-antique-gold" : "text-red-200"}>{message.message}</p> : null}
    </div>
  );
}
