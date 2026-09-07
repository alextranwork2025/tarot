import { z } from "zod";

export const stoneStatuses = ["draft", "published", "hidden"] as const;
export const stoneStatusLabels = {
  draft: "Bản nháp",
  published: "Đã xuất bản",
  hidden: "Đã ẩn",
} as const satisfies Record<(typeof stoneStatuses)[number], string>;

const slugSchema = z.string().trim().min(2, "Vui lòng nhập slug.").max(180)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang.");
const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));
const urlValueSchema = z.string().trim().max(2048).refine((value) => {
  if (!value || value.startsWith("/")) return true;
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
}, "URL ảnh không hợp lệ.");
const optionalUrl = urlValueSchema.optional().or(z.literal(""));

function stringList(value: unknown) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== "string") return [];
  return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
}

function jsonArray(value: unknown) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return [];
  try { return JSON.parse(value); } catch { return value; }
}

const commonFields = {
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Vui lòng nhập tên.").max(120),
  slug: slugSchema,
  shortDescription: optionalText(320),
  content: optionalText(60000),
  featuredImage: optionalUrl,
  gallery: z.preprocess(jsonArray, z.array(urlValueSchema).max(20)),
  status: z.enum(stoneStatuses),
  isFeatured: z.coerce.boolean(),
  seoTitle: optionalText(160),
  seoDescription: optionalText(320),
  expectedUpdatedAt: z.string().optional().or(z.literal("")),
};

export const stoneFormSchema = z.object({
  ...commonFields,
  benefits: optionalText(10000),
  suitableFor: optionalText(10000),
  elements: z.preprocess(stringList, z.array(z.string().trim().min(1).max(60)).max(20)),
  zodiacSigns: z.preprocess(stringList, z.array(z.string().trim().min(1).max(60)).max(20)),
  colors: z.preprocess(stringList, z.array(z.string().trim().min(1).max(60)).max(20)),
  origin: optionalText(2000),
});

export const stoneJarItemSchema = z.object({
  stoneId: z.string().uuid(),
  description: optionalText(2000),
  quantity: optionalText(120),
  displayOrder: z.coerce.number().int().min(0),
});

export const stoneJarFormSchema = z.object({
  ...commonFields,
  meaning: optionalText(10000),
  usage: optionalText(10000),
  price: z.preprocess((value) => value === "" || value == null ? null : value, z.coerce.number().int().min(0).nullable()),
  priceLabel: z.string().trim().min(1).max(120).default("Liên hệ"),
  contactMessage: optionalText(1000),
  items: z.preprocess(jsonArray, z.array(stoneJarItemSchema).max(100)).superRefine((items, context) => {
    const seen = new Set<string>();
    items.forEach((item, index) => {
      if (seen.has(item.stoneId)) context.addIssue({ code: "custom", message: "Không thể chọn trùng loại đá.", path: [index, "stoneId"] });
      seen.add(item.stoneId);
    });
  }),
});

export const stoneStatusUpdateSchema = z.object({
  id: z.string().uuid(),
  expectedUpdatedAt: z.string().optional().or(z.literal("")),
});

export const stoneImageUploadSchema = z.object({
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  size: z.number().int().min(1).max(5 * 1024 * 1024),
});

export type StoneFormValues = z.output<typeof stoneFormSchema>;
export type StoneJarFormValues = z.output<typeof stoneJarFormSchema>;
