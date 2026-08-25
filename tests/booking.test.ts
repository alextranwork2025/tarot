import { describe, expect, it } from "vitest";

import { canTransitionStatus } from "@/lib/booking/status";
import {
  calculateEndTime,
  combineDateAndTime,
  hasAppointmentConflict,
  hasBlockedConflict,
  isInsideWorkingHours,
  isPastDate,
} from "@/lib/booking/time";
import { lookupSchema } from "@/lib/validations/booking";
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
      isInsideWorkingHours(range, [{ weekday: 1, start_time: "09:00", end_time: "17:00", is_active: true }]),
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
  it("rejects wrong lookup code or phone values", () => {
    expect(lookupSchema.safeParse({ bookingCode: "", phone: "abc" }).success).toBe(false);
  });

  it("allows valid status transitions and rejects invalid ones", () => {
    expect(canTransitionStatus("pending", "confirmed")).toBe(true);
    expect(canTransitionStatus("completed", "pending")).toBe(false);
  });
});
