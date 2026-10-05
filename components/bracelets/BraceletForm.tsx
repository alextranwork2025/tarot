"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useRef, useState, useTransition } from "react";

import { MarkdownToolbar } from "@/components/stones/MarkdownToolbar";
import { StoneImage } from "@/components/stones/StoneImage";
import { createBracelet, updateBracelet, type BraceletActionState } from "@/lib/actions/bracelets";
import { slugifyVietnamese } from "@/lib/blog/slug";
import { braceletAvailabilityLabels } from "@/lib/validations/bracelets";
import { stoneStatusLabels } from "@/lib/validations/stones";
import type { BraceletDetail } from "@/types/bracelets";
import type { StoneSummary } from "@/types/stones";

const empty: BraceletActionState = { ok: false, message: "" };
const input = "min-h-11 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold";
const area = `${input} py-2`;

function csv(values?: (string | number)[]) {
  return values?.join(", ") ?? "";
}

export function BraceletForm({ bracelet, stones }: { bracelet?: BraceletDetail; stones: StoneSummary[] }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<BraceletActionState>(empty);
  const [name, setName] = useState(bracelet?.name ?? "");
  const [slug, setSlug] = useState(bracelet?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(bracelet));
  const [featuredImage, setFeaturedImage] = useState(bracelet?.featured_image ?? "");
  const [gallery, setGallery] = useState(bracelet?.gallery ?? []);
  const [stoneIds, setStoneIds] = useState(bracelet?.stones.map((stone) => stone.id) ?? []);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  function toggleStone(id: string) {
    setStoneIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function reorderGallery(index: number, direction: -1 | 1) {
    setGallery((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    data.set("featuredImage", featuredImage);
    data.set("gallery", JSON.stringify(gallery));
    data.set("stoneIds", JSON.stringify(stoneIds));
    if (bracelet) {
      data.set("id", bracelet.id);
      data.set("expectedUpdatedAt", bracelet.updated_at);
    }
    start(async () => setMessage(await (bracelet ? updateBracelet : createBracelet)(empty, data)));
  }

  return (
    <form onSubmit={submit} encType="multipart/form-data" className="grid gap-6 rounded-lg border border-gilded/40 bg-card-deep/80 p-5">
      <fieldset disabled={pending} className="grid gap-6 disabled:opacity-70">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-stone-mist">Tên vòng tay<input name="name" value={name} onChange={(event) => { setName(event.target.value); if (!slugTouched) setSlug(slugifyVietnamese(event.target.value)); }} required className={input} /></label>
          <label className="grid gap-2 text-sm text-stone-mist">Slug<input name="slug" value={slug} onChange={(event) => { setSlug(event.target.value); setSlugTouched(true); }} required className={input} /></label>
        </div>

        {bracelet ? <p className="rounded-sm border border-gilded/30 px-3 py-2 text-sm text-stone-mist">Mã sản phẩm: <span className="text-antique-gold">{bracelet.product_code}</span></p> : null}

        <section className="grid gap-4 rounded-lg border border-gilded/30 p-4">
          <h2 className="font-serif text-2xl text-ivory">Ảnh sản phẩm</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-stone-mist">Tải ảnh đại diện<input name="featuredImageFile" type="file" accept="image/jpeg,image/png,image/webp" className={`${input} py-2`} /></label>
            <label className="grid gap-2 text-sm text-stone-mist">Ảnh đại diện hiện tại<input value={featuredImage} onChange={(event) => setFeaturedImage(event.target.value)} className={input} placeholder="Sẽ tự điền sau khi tải ảnh" /></label>
          </div>
          {featuredImage ? <StoneImage src={featuredImage} alt="Ảnh đại diện vòng tay" /> : null}
          <label className="grid gap-2 text-sm text-stone-mist">Tải bộ ảnh sản phẩm<input name="galleryFiles" type="file" multiple accept="image/jpeg,image/png,image/webp" className={`${input} py-2`} /></label>
          {gallery.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {gallery.map((url, index) => (
                <div key={url} className="grid gap-2">
                  <StoneImage src={url} alt={`Ảnh vòng tay ${index + 1}`} square />
                  <div className="flex gap-2">
                    <button type="button" title="Đưa lên" disabled={index === 0} onClick={() => reorderGallery(index, -1)} className="grid size-9 place-items-center rounded-sm border border-gilded/50 disabled:opacity-40"><ArrowUp size={15} /></button>
                    <button type="button" title="Đưa xuống" disabled={index === gallery.length - 1} onClick={() => reorderGallery(index, 1)} className="grid size-9 place-items-center rounded-sm border border-gilded/50 disabled:opacity-40"><ArrowDown size={15} /></button>
                    <button type="button" title="Gỡ ảnh" onClick={() => setGallery((items) => items.filter((item) => item !== url))} className="grid size-9 place-items-center rounded-sm border border-wine/70 text-red-100"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <label className="grid gap-2 text-sm text-stone-mist">Mô tả ngắn<textarea name="shortDescription" defaultValue={bracelet?.short_description ?? ""} rows={3} required className={area} /></label>
        <div className="grid gap-3"><MarkdownToolbar textareaRef={contentRef} /><label className="grid gap-2 text-sm text-stone-mist">Mô tả chi tiết<textarea ref={contentRef} name="content" defaultValue={bracelet?.content ?? ""} rows={14} required className={`${area} font-mono text-sm`} /></label></div>

        <section className="grid gap-4 rounded-lg border border-gilded/30 p-4">
          <h2 className="font-serif text-2xl text-ivory">Loại đá</h2>
          <div className="grid gap-2 md:grid-cols-2">
            {stones.map((stone) => (
              <label key={stone.id} className="flex items-center gap-3 rounded-sm border border-gilded/25 p-3 text-sm text-stone-mist">
                <input type="checkbox" checked={stoneIds.includes(stone.id)} onChange={() => toggleStone(stone.id)} />
                <span>{stone.name}</span>
              </label>
            ))}
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-stone-mist">Kích thước hạt (mm, phân tách bằng dấu phẩy)<input name="beadSizesMm" defaultValue={csv(bracelet?.bead_sizes_mm)} required className={input} placeholder="8, 10, 12" /></label>
          <label className="grid gap-2 text-sm text-stone-mist">Kích cỡ vòng hoặc chu vi cổ tay phù hợp (cm)<input name="wristSizesCm" defaultValue={csv(bracelet?.wrist_sizes_cm)} required className={input} placeholder="15-16 cm, 16-17 cm" /></label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2 text-sm text-stone-mist">Giá tham khảo<input name="price" type="number" min="0" step="1000" defaultValue={bracelet?.price ?? ""} className={input} /></label>
          <label className="grid gap-2 text-sm text-stone-mist">Tình trạng<select name="availability" defaultValue={bracelet?.availability ?? "available"} className={input}>{Object.entries(braceletAvailabilityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="grid gap-2 text-sm text-stone-mist">Thứ tự hiển thị<input name="displayOrder" type="number" min="0" defaultValue={bracelet?.display_order ?? 0} className={input} /></label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-stone-mist">Màu sắc<input name="colors" defaultValue={csv(bracelet?.colors)} className={input} /></label>
          <label className="grid gap-2 text-sm text-stone-mist">Kiểu dáng<input name="style" defaultValue={bracelet?.style ?? ""} className={input} placeholder="Vòng hạt tròn, vòng phối charm..." /></label>
          <label className="grid gap-2 text-sm text-stone-mist">Số lượng hạt<input name="beadCount" defaultValue={bracelet?.bead_count ?? ""} className={input} /></label>
          <label className="grid gap-2 text-sm text-stone-mist">Chất liệu dây<input name="cordMaterial" defaultValue={bracelet?.cord_material ?? ""} className={input} /></label>
          <label className="grid gap-2 text-sm text-stone-mist">Charm/phụ kiện<input name="accessoryMaterial" defaultValue={bracelet?.accessory_material ?? ""} className={input} /></label>
          <label className="grid gap-2 text-sm text-stone-mist">Mệnh phù hợp<input name="suitableElements" defaultValue={csv(bracelet?.suitable_elements)} className={input} placeholder="Kim, Mộc, Thủy..." /></label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-stone-mist">Ý nghĩa phong thủy<textarea name="meaning" defaultValue={bracelet?.meaning ?? ""} rows={6} className={area} /></label>
          <label className="grid gap-2 text-sm text-stone-mist">Hướng dẫn đo cổ tay<textarea name="wristMeasurementGuide" defaultValue={bracelet?.wrist_measurement_guide ?? ""} rows={6} className={area} /></label>
          <label className="grid gap-2 text-sm text-stone-mist">Hướng dẫn sử dụng và bảo quản<textarea name="careGuide" defaultValue={bracelet?.care_guide ?? ""} rows={6} className={area} /></label>
          <label className="grid gap-2 text-sm text-stone-mist">Chính sách điều chỉnh/bảo hành/đổi trả<textarea name="policy" defaultValue={bracelet?.policy ?? ""} rows={6} className={area} /></label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2 text-sm text-stone-mist">Nguồn gốc đá<input name="origin" defaultValue={bracelet?.origin ?? ""} className={input} /></label>
          <label className="grid gap-2 text-sm text-stone-mist">Xử lý đá<input name="treatment" defaultValue={bracelet?.treatment ?? ""} className={input} /></label>
          <label className="grid gap-2 text-sm text-stone-mist">Chứng nhận kiểm định<input name="certification" defaultValue={bracelet?.certification ?? ""} className={input} /></label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-stone-mist">SEO title<input name="seoTitle" defaultValue={bracelet?.seo_title ?? ""} className={input} /></label>
          <label className="grid gap-2 text-sm text-stone-mist">SEO description<input name="seoDescription" defaultValue={bracelet?.seo_description ?? ""} className={input} /></label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-stone-mist">Trạng thái hiển thị<select name="status" defaultValue={bracelet?.status ?? "draft"} className={input}>{Object.entries(stoneStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="flex items-center gap-3 self-end pb-3 text-sm text-stone-mist"><input name="isFeatured" type="checkbox" defaultChecked={bracelet?.is_featured ?? false} />Sản phẩm nổi bật</label>
        </div>
      </fieldset>
      <button disabled={pending} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-antique-gold px-5 text-sm font-semibold text-obsidian disabled:opacity-60"><Plus size={16} />{pending ? "Đang lưu..." : bracelet ? "Lưu vòng tay" : "Tạo vòng tay"}</button>
      {message.message ? <div role="status" className={message.ok ? "text-antique-gold" : "text-red-200"}><p>{message.message}</p>{!message.ok && message.fieldErrors ? <ul className="mt-2 list-disc pl-5 text-sm">{Object.entries(message.fieldErrors).flatMap(([field, errors]) => errors.map((error) => <li key={`${field}-${error}`}>{error}</li>))}</ul> : null}</div> : null}
    </form>
  );
}
