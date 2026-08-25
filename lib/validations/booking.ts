import { z } from "zod";

import { vietnamPhoneSchema } from "@/lib/validations/phone";

export const bookingRequestSchema = z.object({
  serviceId: z.string().uuid("Dịch vụ không hợp lệ."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày không hợp lệ."),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Khung giờ không hợp lệ."),
  fullName: z.string().trim().min(2, "Vui lòng nhập họ tên.").max(120),
  phone: vietnamPhoneSchema,
  email: z.string().trim().email("Email không hợp lệ.").optional().or(z.literal("")),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  company: z.string().max(0, "Yêu cầu không hợp lệ.").optional().or(z.literal("")),
});

export const lookupSchema = z.object({
  bookingCode: z.string().trim().min(4).max(24).toUpperCase(),
  phone: vietnamPhoneSchema,
});

export const cancelLookupSchema = lookupSchema.extend({
  reason: z.string().trim().max(500).optional(),
});

export const adminStatusSchema = z.object({
  appointmentId: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "declined", "rescheduled", "completed", "cancelled", "no_show"]),
  note: z.string().trim().max(1000).optional(),
});

export const adminNoteSchema = z.object({
  appointmentId: z.string().uuid(),
  internalNote: z.string().trim().max(2000),
});

export const serviceUpdateSchema = z.object({
  serviceId: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  durationMinutes: z.coerce.number().int().min(15).max(480),
  price: z.coerce.number().int().min(0),
  isActive: z.coerce.boolean(),
});

export const workingHourUpdateSchema = z.object({
  id: z.string().uuid().optional(),
  weekday: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  isActive: z.coerce.boolean(),
});

export type BookingRequestInput = z.input<typeof bookingRequestSchema>;
export type BookingRequest = z.output<typeof bookingRequestSchema>;
