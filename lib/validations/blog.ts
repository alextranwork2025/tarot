import { z } from "zod";

export const blogStatuses = ["draft", "published", "archived"] as const;

export const blogStatusLabels = {
  draft: "Bản nháp",
  published: "Đã xuất bản",
  archived: "Đã lưu trữ",
} as const satisfies Record<(typeof blogStatuses)[number], string>;

export const blogPostFormSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(3, "Vui lòng nhập tiêu đề.").max(160, "Tiêu đề tối đa 160 ký tự."),
  slug: z
    .string()
    .trim()
    .min(3, "Slug tối thiểu 3 ký tự.")
    .max(180, "Slug tối đa 180 ký tự.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ dùng chữ thường, số và dấu gạch ngang."),
  excerpt: z.string().trim().max(320, "Mô tả ngắn tối đa 320 ký tự.").optional().or(z.literal("")),
  content: z.string().trim().min(20, "Nội dung cần tối thiểu 20 ký tự.").max(60000, "Nội dung quá dài."),
  coverImageUrl: z.string().trim().url("URL ảnh không hợp lệ.").optional().or(z.literal("")),
  status: z.enum(blogStatuses),
  expectedUpdatedAt: z.string().optional().or(z.literal("")),
});

export const blogPostStatusSchema = z.object({
  id: z.string().uuid(),
  expectedUpdatedAt: z.string().optional().or(z.literal("")),
});

export const blogImageUploadSchema = z.object({
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  size: z.number().int().min(1).max(5 * 1024 * 1024),
});

export const blogPostListSchema = z.object({
  q: z.string().trim().max(120).optional(),
  status: z.enum(["all", ...blogStatuses]).optional(),
  sort: z.enum(["newest", "oldest", "published"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
});

export type BlogPostFormValues = z.output<typeof blogPostFormSchema>;
