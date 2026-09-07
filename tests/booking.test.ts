import { describe, expect, it } from "vitest";

import { appointmentStatusLabels, canTransitionAppointmentStatus, canTransitionStatus, isTerminalStatus } from "@/lib/booking/status";
import {
  calculateEndTime,
  combineDateAndTime,
  hasAppointmentConflict,
  hasBlockedConflict,
  isInsideWorkingHours,
  isPastDate,
} from "@/lib/booking/time";
import { bookingRequestSchema, lookupSchema } from "@/lib/validations/booking";
import { normalizeVietnamPhone } from "@/lib/validations/phone";

describe("phone validation", () => {
  it("normalizes Vietnamese phone numbers to E.164", () => {
    expect(normalizeVietnamPhone("0912 345 678")).toBe("+84912345678");
    expect(normalizeVietnamPhone("84912345678")).toBe("+84912345678");
    expect(normalizeVietnamPhone("+84912345678")).toBe("+84912345678");
  });

  it("rejects invalid phone numbers", () => {
    expect(() => normalizeVietnamPhone("12345")).toThrow("Số điện thoại");
  });
});

describe("booking time calculations", () => {
  it("calculates end time from service duration", () => {
    const start = combineDateAndTime("2026-09-10", "09:00");
    expect(calculateEndTime(start, 75).toISOString()).toBe(new Date("2026-09-10T10:15:00").toISOString());
  });

  it("detects dates in the past", () => {
    expect(isPastDate("2026-08-24", new Date("2026-08-25T10:00:00"))).toBe(true);
    expect(isPastDate("2026-08-25", new Date("2026-08-25T10:00:00"))).toBe(false);
  });

  it("rejects slots outside working hours", () => {
    const range = {
      start: combineDateAndTime("2026-09-07", "08:30"),
      end: combineDateAndTime("2026-09-07", "09:30"),
    };
    expect(
      isInsideWorkingHours(range, [{ day_of_week: 1, start_time: "09:00", end_time: "17:00", is_active: true }]),
    ).toBe(false);
  });

  it("detects blocked slots", () => {
    const range = {
      start: combineDateAndTime("2026-09-07", "10:00"),
      end: combineDateAndTime("2026-09-07", "11:00"),
    };
    expect(hasBlockedConflict(range, [{ start: combineDateAndTime("2026-09-07", "10:30"), end: combineDateAndTime("2026-09-07", "11:30") }])).toBe(true);
  });

  it("detects appointment overlap and race-condition conflicts", () => {
    const requested = {
      start: combineDateAndTime("2026-09-07", "10:00"),
      end: combineDateAndTime("2026-09-07", "11:00"),
    };
    const concurrent = {
      start: combineDateAndTime("2026-09-07", "10:00"),
      end: combineDateAndTime("2026-09-07", "11:00"),
    };
    expect(hasAppointmentConflict(requested, [concurrent])).toBe(true);
  });
});

describe("lookup and status rules", () => {
  it("validates the public booking fields and consent", () => {
    const validRequest = {
      serviceId: "2c43f4c9-bb60-41a5-bc70-32f865390dda",
      date: "2026-09-10",
      startTime: "09:00",
      fullName: "Nguyễn An",
      phone: "0912345678",
      email: "an@example.com",
      readingFormat: "online",
      topic: "career",
      message: "Tôi muốn làm rõ định hướng công việc.",
      consent: "on",
      submissionToken: "194e3a66-b6b6-4ac9-9f48-2eb291748e26",
      company: "",
    };
    expect(bookingRequestSchema.safeParse(validRequest).success).toBe(true);
    expect(bookingRequestSchema.safeParse({ ...validRequest, consent: "" }).success).toBe(false);
  });

  it("rejects wrong lookup code or phone values", () => {
    expect(lookupSchema.safeParse({ bookingCode: "", phone: "abc" }).success).toBe(false);
  });

  it("allows valid status transitions and rejects invalid ones", () => {
    expect(canTransitionStatus("pending", "confirmed")).toBe(true);
    expect(canTransitionAppointmentStatus("pending", "rejected")).toBe(true);
    expect(canTransitionAppointmentStatus("confirmed", "no_show")).toBe(true);
    expect(canTransitionAppointmentStatus("pending", "completed")).toBe(false);
    expect(canTransitionAppointmentStatus("cancelled", "confirmed")).toBe(false);
    expect(canTransitionStatus("completed", "pending")).toBe(false);
  });

  it("labels every live appointment status in Vietnamese", () => {
    expect(appointmentStatusLabels.rejected).toBe("Đã từ chối");
    expect(appointmentStatusLabels.no_show).toBe("Không đến");
  });

  it("treats completed, cancelled, rejected, and no-show as terminal states", () => {
    expect(isTerminalStatus("completed")).toBe(true);
    expect(isTerminalStatus("cancelled")).toBe(true);
    expect(isTerminalStatus("rejected")).toBe(true);
    expect(isTerminalStatus("no_show")).toBe(true);
    expect(isTerminalStatus("confirmed")).toBe(false);
  });
});
