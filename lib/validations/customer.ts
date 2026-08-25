import { z } from "zod";

import { vietnamPhoneSchema } from "@/lib/validations/phone";

export const DEFAULT_CUSTOMER_PASSWORD = "12345678";

export const adminCreateCustomerSchema = z.object({
  fullName: z.string().trim().min(2, "Vui lòng nhập tên khách hàng.").max(120),
  phone: vietnamPhoneSchema,
});

export const customerLoginSchema = z.object({
  phone: vietnamPhoneSchema,
  password: z.string().min(1, "Vui lòng nhập mật khẩu."),
});

export const customerProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Vui lòng nhập họ tên.").max(120),
  email: z.string().trim().email("Email không hợp lệ.").optional().or(z.literal("")),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8, "Mật khẩu mới cần ít nhất 8 ký tự."),
    confirmPassword: z.string().min(8, "Vui lòng nhập lại mật khẩu mới."),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Mật khẩu nhập lại chưa khớp.",
    path: ["confirmPassword"],
  })
  .refine((value) => value.newPassword !== DEFAULT_CUSTOMER_PASSWORD, {
    message: "Không được tiếp tục dùng mật khẩu mặc định.",
    path: ["newPassword"],
  });
