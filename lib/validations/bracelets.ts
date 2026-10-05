import { z } from "zod";

import { stoneStatuses } from "@/lib/validations/stones";

export const braceletAvailabilityValues = ["available", "made_to_order", "out_of_stock"] as const;
export const braceletAvailabilityLabels = {
  available: "Có sẵn",
  made_to_order: "Làm theo yêu cầu",
  out_of_stock: "Tạm hết",
} as const satisfies Record<(typeof braceletAvailabilityValues)[number], string>;

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));
const slugSchema = z.string().trim().min(2, "Vui lòng nhập slug.").max(180)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang.");
const urlValueSchema = z.string().trim().max(2048).refine((value) => {
  if (!value || value.startsWith("/")) return true;
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
}, "URL ảnh không hợp lệ.");

function stringList(value: unknown) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== "string") return [];
  return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
}

function numberList(value: unknown) {
  return stringList(value).map((item) => Number(item.replace(",", "."))).filter((item) => Number.isFinite(item));
}

function jsonArray(value: unknown) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return [];
  try { return JSON.parse(value); } catch { return value; }
}

export const braceletFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Vui lòng nhập tên vòng tay.").max(160),
  slug: slugSchema,
  featuredImage: urlValueSchema.min(1, "Vui lòng tải hoặc chọn ảnh đại diện."),
  shortDescription: z.string().trim().min(10, "Vui lòng nhập mô tả ngắn.").max(420),
  content: z.string().trim().min(10, "Vui lòng nhập mô tả chi tiết.").max(60000),
  beadSizesMm: z.preprocess(numberList, z.array(z.number().positive().max(99)).min(1, "Vui lòng nhập kích thước hạt.").max(20)),
  wristSizesCm: z.preprocess(stringList, z.array(z.string().trim().min(1).max(60)).min(1, "Vui lòng nhập kích cỡ vòng hoặc chu vi cổ tay.").max(20)),
  gallery: z.preprocess(jsonArray, z.array(urlValueSchema).max(20)),
  colors: z.preprocess(stringList, z.array(z.string().trim().min(1).max(60)).max(20)),
  style: optionalText(120),
  beadCount: optionalText(80),
  cordMaterial: optionalText(160),
  accessoryMaterial: optionalText(160),
  price: z.preprocess((value) => value === "" || value == null ? null : value, z.coerce.number().int().min(0).nullable()),
  availability: z.enum(braceletAvailabilityValues),
  meaning: optionalText(12000),
  suitableElements: z.preprocess(stringList, z.array(z.string().trim().min(1).max(60)).max(10)),
  wristMeasurementGuide: optionalText(10000),
  careGuide: optionalText(10000),
  policy: optionalText(10000),
  origin: optionalText(2000),
  treatment: optionalText(2000),
  certification: optionalText(2000),
  isFeatured: z.coerce.boolean(),
  displayOrder: z.coerce.number().int().min(0).default(0),
  status: z.enum(stoneStatuses),
  seoTitle: optionalText(160),
  seoDescription: optionalText(320),
  stoneIds: z.preprocess(jsonArray, z.array(z.string().uuid()).min(1, "Vui lòng chọn ít nhất một loại đá.").max(20)).superRefine((items, context) => {
    const seen = new Set<string>();
    items.forEach((item, index) => {
      if (seen.has(item)) context.addIssue({ code: "custom", message: "Không thể chọn trùng loại đá.", path: [index] });
      seen.add(item);
    });
  }),
  expectedUpdatedAt: z.string().optional().or(z.literal("")),
});

export const braceletStatusUpdateSchema = z.object({
  id: z.string().uuid(),
  expectedUpdatedAt: z.string().optional().or(z.literal("")),
});

export const contactSettingsSchema = z.object({
  zaloUrl: optionalText(2048).refine((value) => !value || value.startsWith("http://") || value.startsWith("https://"), "Link Zalo phải là URL http/https."),
  facebookUrl: optionalText(2048).refine((value) => !value || value.startsWith("http://") || value.startsWith("https://"), "Link Facebook phải là URL http/https."),
});

export type BraceletFormValues = z.output<typeof braceletFormSchema>;
