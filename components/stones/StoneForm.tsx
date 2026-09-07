"use client";

import { Plus, Trash2 } from "lucide-react";
import { useRef, useState, useTransition } from "react";

import { MarkdownToolbar } from "@/components/stones/MarkdownToolbar";
import { StoneImage } from "@/components/stones/StoneImage";
import { createStone, updateStone, type StoneActionState } from "@/lib/actions/stones";
import { slugifyVietnamese } from "@/lib/blog/slug";
import { stoneStatusLabels } from "@/lib/validations/stones";
import type { Stone } from "@/types/stones";

const empty: StoneActionState = { ok: false, message: "" };
const input = "min-h-11 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold";
const area = `${input} py-2`;

export function StoneForm({ stone }: { stone?: Stone }) {
  const [pending, start] = useTransition(); const [message, setMessage] = useState<StoneActionState>(empty);
  const [name, setName] = useState(stone?.name ?? ""); const [slug, setSlug] = useState(stone?.slug ?? ""); const [slugTouched, setSlugTouched] = useState(Boolean(stone));
  const [gallery, setGallery] = useState(stone?.gallery ?? []); const contentRef = useRef<HTMLTextAreaElement>(null);
  function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); data.set("gallery", JSON.stringify(gallery)); if (stone) { data.set("id", stone.id); data.set("expectedUpdatedAt", stone.updated_at); }
    start(async () => setMessage(await (stone ? updateStone : createStone)(empty, data))); }
  return <form onSubmit={submit} className="grid gap-6 rounded-lg border border-gilded/40 bg-card-deep/80 p-5" encType="multipart/form-data"><fieldset disabled={pending} className="grid gap-6 disabled:opacity-70">
    <div className="grid gap-4 md:grid-cols-2"><label className="grid gap-2 text-sm text-stone-mist">Tên loại đá<input name="name" value={name} onChange={(e) => { setName(e.target.value); if (!slugTouched) setSlug(slugifyVietnamese(e.target.value)); }} className={input} required /></label><label className="grid gap-2 text-sm text-stone-mist">Slug<input name="slug" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} className={input} required /></label></div>
    <label className="grid gap-2 text-sm text-stone-mist">Mô tả ngắn<textarea name="shortDescription" defaultValue={stone?.short_description ?? ""} rows={3} className={area} /></label>
    <div className="grid gap-4 md:grid-cols-2"><label className="grid gap-2 text-sm text-stone-mist">URL ảnh đại diện<input name="featuredImage" defaultValue={stone?.featured_image ?? ""} className={input} /></label><label className="grid gap-2 text-sm text-stone-mist">Tải ảnh đại diện<input name="featuredImageFile" type="file" accept="image/jpeg,image/png,image/webp" className={`${input} py-2`} /></label></div>
    <section className="grid gap-4 rounded-lg border border-gilded/30 p-4"><div className="flex items-center justify-between"><h2 className="font-serif text-2xl text-ivory">Thư viện ảnh</h2><span className="text-xs text-stone-mist">Tối đa 20 ảnh, mỗi ảnh 5 MB</span></div><input name="galleryFiles" type="file" multiple accept="image/jpeg,image/png,image/webp" className={`${input} py-2`} />{gallery.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{gallery.map((url) => <div key={url} className="grid gap-2"><StoneImage src={url} alt="Ảnh thư viện đá" square /><button type="button" onClick={() => setGallery((items) => items.filter((item) => item !== url))} className="inline-flex min-h-9 items-center justify-center gap-2 rounded-sm border border-wine/70 text-xs text-red-100"><Trash2 size={14} />Gỡ ảnh</button></div>)}</div> : null}</section>
    <div className="grid gap-3"><MarkdownToolbar textareaRef={contentRef} /><label className="grid gap-2 text-sm text-stone-mist">Nội dung chi tiết<textarea ref={contentRef} name="content" defaultValue={stone?.content ?? ""} rows={16} className={`${area} font-mono text-sm`} /></label></div>
    <div className="grid gap-4 md:grid-cols-2"><label className="grid gap-2 text-sm text-stone-mist">Công dụng và ý nghĩa<textarea name="benefits" defaultValue={stone?.benefits ?? ""} rows={6} className={area} /></label><label className="grid gap-2 text-sm text-stone-mist">Đối tượng phù hợp<textarea name="suitableFor" defaultValue={stone?.suitable_for ?? ""} rows={6} className={area} /></label></div>
    <div className="grid gap-4 md:grid-cols-3"><label className="grid gap-2 text-sm text-stone-mist">Mệnh phù hợp<input name="elements" defaultValue={stone?.elements.join(", ") ?? ""} placeholder="Kim, Mộc, Thủy..." className={input} /></label><label className="grid gap-2 text-sm text-stone-mist">Cung hoàng đạo<input name="zodiacSigns" defaultValue={stone?.zodiac_signs.join(", ") ?? ""} placeholder="Bạch Dương, Kim Ngưu..." className={input} /></label><label className="grid gap-2 text-sm text-stone-mist">Màu sắc<input name="colors" defaultValue={stone?.colors.join(", ") ?? ""} placeholder="Đỏ, hồng, tím..." className={input} /></label></div>
    <label className="grid gap-2 text-sm text-stone-mist">Nguồn gốc, xuất xứ<textarea name="origin" defaultValue={stone?.origin ?? ""} rows={4} className={area} /></label>
    <div className="grid gap-4 md:grid-cols-2"><label className="grid gap-2 text-sm text-stone-mist">SEO title<input name="seoTitle" defaultValue={stone?.seo_title ?? ""} className={input} /></label><label className="grid gap-2 text-sm text-stone-mist">SEO description<input name="seoDescription" defaultValue={stone?.seo_description ?? ""} className={input} /></label></div>
    <div className="grid gap-4 md:grid-cols-2"><label className="grid gap-2 text-sm text-stone-mist">Trạng thái<select name="status" defaultValue={stone?.status ?? "draft"} className={input}>{Object.entries(stoneStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="flex items-center gap-3 self-end pb-3 text-sm text-stone-mist"><input name="isFeatured" type="checkbox" defaultChecked={stone?.is_featured ?? false} />Nội dung nổi bật</label></div>
  </fieldset><button disabled={pending} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-antique-gold px-5 text-sm font-semibold text-obsidian disabled:opacity-60"><Plus size={16} />{pending ? "Đang lưu..." : stone ? "Lưu loại đá" : "Tạo loại đá"}</button>{message.message ? <div role="status" className={message.ok ? "text-antique-gold" : "text-red-200"}><p>{message.message}</p>{!message.ok && message.fieldErrors ? <ul className="mt-2 list-disc pl-5 text-sm">{Object.entries(message.fieldErrors).flatMap(([field, errors]) => errors.map((error) => <li key={`${field}-${error}`}>{error}</li>))}</ul> : null}</div> : null}</form>;
}
