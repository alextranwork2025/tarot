"use client";

import { Save } from "lucide-react";
import { useState, useTransition } from "react";

import { updateContactSettings, type BraceletActionState } from "@/lib/actions/bracelets";
import type { SiteContactSettings } from "@/types/bracelets";

const empty: BraceletActionState = { ok: false, message: "" };
const input = "min-h-11 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold";

export function ContactSettingsForm({ settings }: { settings: SiteContactSettings }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<BraceletActionState>(empty);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    start(async () => setMessage(await updateContactSettings(empty, data)));
  }

  return (
    <form onSubmit={submit} className="grid gap-5 rounded-lg border border-gilded/40 bg-card-deep/80 p-5">
      <label className="grid gap-2 text-sm text-stone-mist">Link Zalo<input name="zaloUrl" defaultValue={settings.zalo_url ?? ""} className={input} placeholder="https://zalo.me/..." /></label>
      <label className="grid gap-2 text-sm text-stone-mist">Link Facebook Messenger<input name="facebookUrl" defaultValue={settings.facebook_url ?? ""} className={input} placeholder="https://m.me/..." /></label>
      <p className="text-sm leading-7 text-stone-mist">Có thể dùng chuỗi <span className="text-antique-gold">{"{message}"}</span> trong URL nếu nền tảng hỗ trợ tự điền nội dung. Nếu không, khách sẽ dùng nút sao chép nội dung tư vấn.</p>
      <button disabled={pending} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-antique-gold px-5 text-sm font-semibold text-obsidian disabled:opacity-60"><Save size={16} />{pending ? "Đang lưu..." : "Lưu cấu hình"}</button>
      {message.message ? <p role="status" className={message.ok ? "text-antique-gold" : "text-red-200"}>{message.message}</p> : null}
    </form>
  );
}
