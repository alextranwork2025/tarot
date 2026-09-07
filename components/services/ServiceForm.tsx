"use client";

import { Bold, Heading2, Italic, LinkIcon, List, Plus, Quote, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { createService, updateService, type ServiceActionState } from "@/lib/actions/services";
import { slugifyVietnamese } from "@/lib/blog/slug";
import type { AdminService, ServiceFaqItem, ServiceTestimonial } from "@/lib/queries/services";
import { serviceStatusLabels, type ServiceStatusValue } from "@/lib/validations/services";

type ServiceEditorValues = {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  content: string;
  coverImageUrl: string;
  suitableFor: string;
  benefits: string;
  process: string;
  preparationNotes: string;
  seoTitle: string;
  seoDescription: string;
  status: ServiceStatusValue;
  displayOrder: number;
  durationMinutes: number;
  price: number;
  isActive: boolean;
};

const emptyState: ServiceActionState = { ok: false, message: "" };

const editorTools = [
  { label: "Tiêu đề", icon: <Heading2 size={16} />, insert: "## Tiêu đề\n" },
  { label: "In đậm", icon: <Bold size={16} />, insert: "**văn bản**" },
  { label: "In nghiêng", icon: <Italic size={16} />, insert: "*văn bản*" },
  { label: "Danh sách", icon: <List size={16} />, insert: "- Mục nội dung\n" },
  { label: "Trích dẫn", icon: <Quote size={16} />, insert: "> Trích dẫn\n" },
  { label: "Liên kết", icon: <LinkIcon size={16} />, insert: "[nhãn](https://example.com)" },
];

function emptyFaq(): ServiceFaqItem {
  return { question: "", answer: "" };
}

function emptyTestimonial(): ServiceTestimonial {
  return { customer_name: "", content: "", rating: 5 };
}

export function ServiceForm({ service }: { service?: AdminService }) {
  const { register, handleSubmit, setValue, getValues } = useForm<ServiceEditorValues>({
    defaultValues: {
      name: service?.name ?? "",
      slug: service?.slug ?? "",
      description: service?.description ?? "",
      shortDescription: service?.short_description ?? "",
      content: service?.content ?? "",
      coverImageUrl: service?.cover_image_url ?? "",
      suitableFor: service?.suitable_for ?? "",
      benefits: service?.benefits ?? "",
      process: service?.process ?? "",
      preparationNotes: service?.preparation_notes ?? "",
      seoTitle: service?.seo_title ?? "",
      seoDescription: service?.seo_description ?? "",
      status: service?.status ?? "draft",
      displayOrder: service?.display_order ?? 0,
      durationMinutes: service?.duration_minutes ?? 60,
      price: service?.price ?? 0,
      isActive: service?.is_active ?? true,
    },
  });
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<ServiceActionState>(emptyState);
  const [slugTouched, setSlugTouched] = useState(Boolean(service?.slug));
  const [faq, setFaq] = useState<ServiceFaqItem[]>(service?.faq.length ? service.faq : []);
  const [testimonials, setTestimonials] = useState<ServiceTestimonial[]>(service?.testimonials.length ? service.testimonials : []);

  function insertMarkdown(markdown: string) {
    const current = getValues("content");
    setValue("content", `${current}${current.endsWith("\n") || !current ? "" : "\n"}${markdown}`);
  }

  function onSubmit(values: ServiceEditorValues) {
    const formData = new FormData();
    if (service) {
      formData.set("id", service.id);
      formData.set("expectedUpdatedAt", service.updated_at ?? "");
    }
    Object.entries(values).forEach(([key, value]) => {
      if (key === "isActive") {
        if (value) formData.set("isActive", "on");
      } else {
        formData.set(key, String(value ?? ""));
      }
    });
    formData.set("faq", JSON.stringify(faq.filter((item) => item.question.trim() && item.answer.trim())));
    formData.set(
      "testimonials",
      JSON.stringify(testimonials.filter((item) => item.customer_name.trim() && item.content.trim())),
    );

    startTransition(async () => {
      const action = service ? updateService : createService;
      setMessage(await action(emptyState, formData));
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 rounded-lg border border-gilded/40 bg-card-deep/80 p-5">
      <fieldset disabled={pending} className="grid gap-5 disabled:opacity-70">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-stone-mist">
            Tên dịch vụ
            <input
              {...register("name", {
                onChange: (event) => {
                  if (!slugTouched) setValue("slug", slugifyVietnamese(String(event.target.value)));
                },
              })}
              className="min-h-11 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory"
            />
          </label>
          <label className="grid gap-2 text-sm text-stone-mist">
            Slug
            <input
              {...register("slug", { onChange: () => setSlugTouched(true) })}
              className="min-h-11 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory"
            />
          </label>
        </div>

        <label className="grid gap-2 text-sm text-stone-mist">
          Mô tả ngắn
          <textarea {...register("shortDescription")} rows={3} className="rounded-sm border border-gilded/50 bg-obsidian px-3 py-2 text-ivory" />
        </label>
        <label className="grid gap-2 text-sm text-stone-mist">
          Mô tả dùng trong booking
          <textarea {...register("description")} rows={3} className="rounded-sm border border-gilded/50 bg-obsidian px-3 py-2 text-ivory" />
        </label>
        <label className="grid gap-2 text-sm text-stone-mist">
          URL ảnh đại diện
          <input {...register("coverImageUrl")} className="min-h-11 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory" />
        </label>

        <div className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            {editorTools.map((item) => (
              <button key={item.label} type="button" title={item.label} onClick={() => insertMarkdown(item.insert)} className="grid size-10 place-items-center rounded-sm border border-gilded/50 text-stone-mist hover:border-antique-gold hover:text-antique-gold">
                {item.icon}
              </button>
            ))}
          </div>
          <label className="grid gap-2 text-sm text-stone-mist">
            Nội dung chi tiết
            <textarea {...register("content")} rows={14} className="rounded-sm border border-gilded/50 bg-obsidian px-3 py-2 font-mono text-sm text-ivory" />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-stone-mist">
            Đối tượng phù hợp
            <textarea {...register("suitableFor")} rows={5} className="rounded-sm border border-gilded/50 bg-obsidian px-3 py-2 text-ivory" />
          </label>
          <label className="grid gap-2 text-sm text-stone-mist">
            Lợi ích
            <textarea {...register("benefits")} rows={5} className="rounded-sm border border-gilded/50 bg-obsidian px-3 py-2 text-ivory" />
          </label>
          <label className="grid gap-2 text-sm text-stone-mist">
            Quy trình
            <textarea {...register("process")} rows={5} className="rounded-sm border border-gilded/50 bg-obsidian px-3 py-2 text-ivory" />
          </label>
          <label className="grid gap-2 text-sm text-stone-mist">
            Lưu ý chuẩn bị
            <textarea {...register("preparationNotes")} rows={5} className="rounded-sm border border-gilded/50 bg-obsidian px-3 py-2 text-ivory" />
          </label>
        </div>

        <section className="grid gap-3 rounded-lg border border-gilded/30 p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-2xl text-ivory">FAQ</h2>
            <button type="button" onClick={() => setFaq((items) => [...items, emptyFaq()])} className="grid size-9 place-items-center rounded-sm border border-gilded/50 text-antique-gold">
              <Plus size={16} />
            </button>
          </div>
          {faq.map((item, index) => (
            <div key={index} className="grid gap-3 rounded-sm border border-gilded/25 p-3">
              <input value={item.question} onChange={(event) => setFaq((items) => items.map((faqItem, itemIndex) => itemIndex === index ? { ...faqItem, question: event.target.value } : faqItem))} placeholder="Câu hỏi" className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory" />
              <textarea value={item.answer} onChange={(event) => setFaq((items) => items.map((faqItem, itemIndex) => itemIndex === index ? { ...faqItem, answer: event.target.value } : faqItem))} placeholder="Câu trả lời" rows={3} className="rounded-sm border border-gilded/50 bg-obsidian px-3 py-2 text-ivory" />
              <button type="button" onClick={() => setFaq((items) => items.filter((_, itemIndex) => itemIndex !== index))} className="inline-flex min-h-9 items-center gap-2 justify-self-start rounded-full border border-wine/70 px-3 text-xs text-red-100">
                <Trash2 size={14} /> Xóa
              </button>
            </div>
          ))}
        </section>

        <section className="grid gap-3 rounded-lg border border-gilded/30 p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-2xl text-ivory">Đánh giá khách hàng</h2>
            <button type="button" onClick={() => setTestimonials((items) => [...items, emptyTestimonial()])} className="grid size-9 place-items-center rounded-sm border border-gilded/50 text-antique-gold">
              <Plus size={16} />
            </button>
          </div>
          {testimonials.map((item, index) => (
            <div key={index} className="grid gap-3 rounded-sm border border-gilded/25 p-3 md:grid-cols-[1fr_120px_auto]">
              <input value={item.customer_name} onChange={(event) => setTestimonials((items) => items.map((testimonial, itemIndex) => itemIndex === index ? { ...testimonial, customer_name: event.target.value } : testimonial))} placeholder="Tên hoặc tên viết tắt" className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory" />
              <input value={item.rating} onChange={(event) => setTestimonials((items) => items.map((testimonial, itemIndex) => itemIndex === index ? { ...testimonial, rating: Number(event.target.value) } : testimonial))} type="number" min={1} max={5} className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory" />
              <button type="button" onClick={() => setTestimonials((items) => items.filter((_, itemIndex) => itemIndex !== index))} className="grid size-10 place-items-center rounded-sm border border-wine/70 text-red-100">
                <Trash2 size={15} />
              </button>
              <textarea value={item.content} onChange={(event) => setTestimonials((items) => items.map((testimonial, itemIndex) => itemIndex === index ? { ...testimonial, content: event.target.value } : testimonial))} placeholder="Nội dung đánh giá" rows={3} className="rounded-sm border border-gilded/50 bg-obsidian px-3 py-2 text-ivory md:col-span-3" />
            </div>
          ))}
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-stone-mist">
            SEO title
            <input {...register("seoTitle")} className="min-h-11 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory" />
          </label>
          <label className="grid gap-2 text-sm text-stone-mist">
            SEO description
            <input {...register("seoDescription")} className="min-h-11 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory" />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <label className="grid gap-2 text-sm text-stone-mist md:col-span-2">
            Trạng thái
            <select {...register("status")} className="min-h-11 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory">
              {Object.entries(serviceStatusLabels).map(([status, label]) => (
                <option key={status} value={status}>{label}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-stone-mist">
            Thứ tự
            <input {...register("displayOrder", { valueAsNumber: true })} type="number" min={0} className="min-h-11 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory" />
          </label>
          <label className="grid gap-2 text-sm text-stone-mist">
            Thời lượng
            <input {...register("durationMinutes", { valueAsNumber: true })} type="number" min={15} max={480} step={15} className="min-h-11 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory" />
          </label>
          <label className="grid gap-2 text-sm text-stone-mist">
            Giá
            <input {...register("price", { valueAsNumber: true })} type="number" min={0} className="min-h-11 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory" />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-stone-mist">
          <input {...register("isActive")} type="checkbox" />
          Bật dịch vụ
        </label>
      </fieldset>

      <button disabled={pending} className="min-h-11 rounded-full bg-antique-gold px-5 text-sm font-semibold text-obsidian hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? "Đang lưu..." : service ? "Lưu dịch vụ" : "Tạo dịch vụ"}
      </button>
      {message.message ? <p role="status" className={message.ok ? "text-antique-gold" : "text-red-200"}>{message.message}</p> : null}
    </form>
  );
}
