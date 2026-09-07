"use client";

import { Bold, Heading2, Italic, LinkIcon, List, Quote } from "lucide-react";
import type { RefObject } from "react";

const tools = [
  ["Tiêu đề", Heading2, "## Tiêu đề\n"], ["In đậm", Bold, "**văn bản**"],
  ["In nghiêng", Italic, "*văn bản*"], ["Danh sách", List, "- Mục nội dung\n"],
  ["Trích dẫn", Quote, "> Trích dẫn\n"], ["Liên kết", LinkIcon, "[nhãn](https://example.com)"],
] as const;

export function MarkdownToolbar({ textareaRef }: { textareaRef: RefObject<HTMLTextAreaElement | null> }) {
  function insert(value: string) {
    const textarea = textareaRef.current; if (!textarea) return;
    const start = textarea.selectionStart, end = textarea.selectionEnd;
    textarea.setRangeText(value, start, end, "end");
    textarea.dispatchEvent(new Event("input", { bubbles: true })); textarea.focus();
  }
  return <div className="flex flex-wrap gap-2">{tools.map(([label, Icon, value]) => <button key={label} type="button" title={label} aria-label={label} onClick={() => insert(value)} className="grid size-10 place-items-center rounded-sm border border-gilded/50 text-stone-mist hover:border-antique-gold hover:text-antique-gold"><Icon size={16} aria-hidden="true" /></button>)}</div>;
}
