"use client";

import { Check, Copy, MessageCircleMore } from "lucide-react";
import { useMemo, useState } from "react";

type Props = {
  name: string;
  productCode: string;
  beadSizesMm: number[];
  zaloUrl: string | null;
  facebookUrl: string | null;
};

function buildMessage(name: string, productCode: string, beadSizesMm: number[]) {
  const beadText = beadSizesMm.length ? `, kích thước hạt ${beadSizesMm.map((size) => `${size} mm`).join(", ")}` : "";
  const url = typeof window === "undefined" ? "" : window.location.href;
  return `Chào Huyền Cảnh, tôi muốn được tư vấn vòng tay ${name}, mã ${productCode}${beadText}. Link sản phẩm: ${url}.`;
}

function withMessage(url: string, message: string) {
  if (url.includes("{message}")) return url.replace("{message}", encodeURIComponent(message));
  return url;
}

export function BraceletConsultation({ name, productCode, beadSizesMm, zaloUrl, facebookUrl }: Props) {
  const [copied, setCopied] = useState(false);
  const message = useMemo(() => buildMessage(name, productCode, beadSizesMm), [beadSizesMm, name, productCode]);
  const channels = [
    zaloUrl ? { label: "Nhắn Zalo để tư vấn", href: withMessage(zaloUrl, message) } : null,
    facebookUrl ? { label: "Nhắn Facebook để tư vấn", href: withMessage(facebookUrl, message) } : null,
  ].filter((item): item is { label: string; href: string } => Boolean(item));

  async function copyMessage() {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {channels.map((channel) => (
          <a key={channel.label} href={channel.href} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-antique-gold px-5 text-sm font-semibold text-obsidian hover:bg-ivory">
            <MessageCircleMore size={18} aria-hidden="true" />
            {channel.label}
          </a>
        ))}
        <button type="button" onClick={copyMessage} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-gilded/60 px-5 text-sm text-ivory hover:border-antique-gold hover:text-antique-gold sm:col-span-2">
          {copied ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
          {copied ? "Đã sao chép nội dung tư vấn" : "Sao chép nội dung tư vấn"}
        </button>
      </div>
      {channels.length ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gilded/35 bg-obsidian/95 p-3 backdrop-blur md:hidden">
          <div className="grid gap-2">
            {channels.map((channel) => (
              <a key={`mobile-${channel.label}`} href={channel.href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-antique-gold px-4 text-sm font-semibold text-obsidian">
                <MessageCircleMore size={17} aria-hidden="true" />
                {channel.label.replace(" để tư vấn", "")}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
