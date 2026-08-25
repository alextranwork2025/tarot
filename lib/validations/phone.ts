import { z } from "zod";

export function normalizeVietnamPhone(input: string) {
  const compact = input.trim().replace(/[\s().-]/g, "");

  if (/^\+84\d{9}$/.test(compact)) {
    return compact;
  }

  if (/^84\d{9}$/.test(compact)) {
    return `+${compact}`;
  }

  if (/^0\d{9}$/.test(compact)) {
    return `+84${compact.slice(1)}`;
  }

  throw new Error("Số điện thoại chưa đúng định dạng Việt Nam.");
}

export const vietnamPhoneSchema = z
  .string()
  .min(9, "Vui lòng nhập số điện thoại.")
  .transform((value, context) => {
    try {
      return normalizeVietnamPhone(value);
    } catch (error) {
      context.addIssue({
        code: "custom",
        message: error instanceof Error ? error.message : "Số điện thoại không hợp lệ.",
      });
      return z.NEVER;
    }
  });
