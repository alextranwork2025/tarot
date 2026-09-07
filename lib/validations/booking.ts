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
  readingFormat: z.enum(["online", "in_person"], { error: "Vui lòng chọn hình thức xem bài." }),
  topic: z.enum(["love", "career", "finance", "self_development", "family", "other"], { error: "Vui lòng chọn chủ đề muốn xem." }),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  consent: z.string().refine((value) => value === "on", "Bạn cần đồng ý cung cấp thông tin để đặt lịch."),
  submissionToken: z.string().uuid("Mã gửi yêu cầu không hợp lệ."),
  company: z.string().max(0, "Yêu cầu không hợp lệ.").optional().or(z.literal("")),
});

export const availabilityRequestSchema = z.object({
  serviceId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
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
  status: z.enum(["pending", "confirmed", "completed", "cancelled", "rejected", "no_show"]),
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
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  isActive: z.coerce.boolean(),
});

export const appointmentFormSchema = z.object({
  appointmentId: z.string().uuid().optional(),
  customerMode: z.enum(["existing", "quick"]),
  customerId: z.string().uuid().optional().or(z.literal("")),
  fullName: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  serviceId: z.string().uuid("Dịch vụ không hợp lệ."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày hẹn không hợp lệ."),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Giờ bắt đầu không hợp lệ."),
  durationMinutes: z.coerce.number().int().min(15).max(480),
  customerMessage: z.string().trim().max(2000).optional().or(z.literal("")),
  internalNote: z.string().trim().max(5000).optional().or(z.literal("")),
  status: z.enum(["pending", "confirmed"]),
  expectedUpdatedAt: z.string().optional().or(z.literal("")),
});

export type AppointmentFormInput = z.input<typeof appointmentFormSchema>;
export type AppointmentFormValues = z.output<typeof appointmentFormSchema>;

export type BookingRequestInput = z.input<typeof bookingRequestSchema>;
export type BookingRequest = z.output<typeof bookingRequestSchema>;
