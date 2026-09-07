import { z } from "zod";

export const serviceStatuses = ["draft", "published", "archived"] as const;
export type ServiceStatusValue = (typeof serviceStatuses)[number];

export const serviceStatusLabels: Record<ServiceStatusValue, string> = {
  draft: "Bản nháp",
  published: "Đã xuất bản",
  archived: "Lưu trữ",
};

const slugSchema = z
  .string()
  .trim()
  .min(1, "Vui lòng nhập slug.")
  .max(180)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ dùng chữ thường, số và dấu gạch ngang.");

const optionalUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    if (!value) {
      return true;
    }
    if (value.startsWith("/")) {
      return true;
    }
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }, "URL ảnh không hợp lệ.")
  .optional()
  .or(z.literal(""));

export const serviceFaqItemSchema = z.object({
  question: z.string().trim().min(1).max(200),
  answer: z.string().trim().min(1).max(1000),
});

export const serviceTestimonialSchema = z.object({
  customer_name: z.string().trim().min(1).max(120),
  content: z.string().trim().min(1).max(1000),
  rating: z.coerce.number().int().min(1).max(5),
});

function parseJsonArray(value: unknown) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string" || value.trim() === "") {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return value;
  }
}

export const serviceFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Vui lòng nhập tên dịch vụ.").max(120),
  slug: slugSchema,
  description: z.string().trim().max(500).optional().or(z.literal("")),
  shortDescription: z.string().trim().max(320).optional().or(z.literal("")),
  content: z.string().trim().max(60000).optional().or(z.literal("")),
  coverImageUrl: optionalUrlSchema,
  suitableFor: z.string().trim().max(4000).optional().or(z.literal("")),
  benefits: z.string().trim().max(4000).optional().or(z.literal("")),
  process: z.string().trim().max(4000).optional().or(z.literal("")),
  preparationNotes: z.string().trim().max(4000).optional().or(z.literal("")),
  faq: z.preprocess(parseJsonArray, z.array(serviceFaqItemSchema).max(20)),
  testimonials: z.preprocess(parseJsonArray, z.array(serviceTestimonialSchema).max(20)),
  seoTitle: z.string().trim().max(160).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(320).optional().or(z.literal("")),
  status: z.enum(serviceStatuses),
  displayOrder: z.coerce.number().int().min(0).max(10000),
  durationMinutes: z.coerce.number().int().min(15).max(480),
  price: z.coerce.number().int().min(0),
  isActive: z.coerce.boolean(),
  expectedUpdatedAt: z.string().optional().or(z.literal("")),
});

export const serviceStatusUpdateSchema = z.object({
  id: z.string().uuid(),
  expectedUpdatedAt: z.string().optional().or(z.literal("")),
});

export type ServiceFormInput = z.input<typeof serviceFormSchema>;
export type ServiceFormValues = z.output<typeof serviceFormSchema>;
