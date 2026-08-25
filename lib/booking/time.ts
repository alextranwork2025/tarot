import { addMinutes, format, isBefore, parse, startOfDay } from "date-fns";

export const TIME_ZONE = "Asia/Ho_Chi_Minh";

export type TimeRange = {
  start: Date;
  end: Date;
};

export type WorkingHour = {
  weekday: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

export function combineDateAndTime(date: string, time: string) {
  return parse(`${date} ${time}`, "yyyy-MM-dd HH:mm", new Date());
}

export function calculateEndTime(start: Date, durationMinutes: number) {
  return addMinutes(start, durationMinutes);
}

export function isPastDate(date: string, now = new Date()) {
  return isBefore(startOfDay(parse(date, "yyyy-MM-dd", new Date())), startOfDay(now));
}

export function overlaps(a: TimeRange, b: TimeRange) {
  return a.start < b.end && b.start < a.end;
}

export function isInsideWorkingHours(range: TimeRange, hours: WorkingHour[]) {
  const weekday = range.start.getDay();
  return hours
    .filter((hour) => hour.is_active && hour.weekday === weekday)
    .some((hour) => {
      const date = format(range.start, "yyyy-MM-dd");
      const workStart = combineDateAndTime(date, hour.start_time.slice(0, 5));
      const workEnd = combineDateAndTime(date, hour.end_time.slice(0, 5));
      return range.start >= workStart && range.end <= workEnd;
    });
}

export function hasBlockedConflict(range: TimeRange, blockedTimes: TimeRange[]) {
  return blockedTimes.some((blocked) => overlaps(range, blocked));
}

export function hasAppointmentConflict(range: TimeRange, appointments: TimeRange[]) {
  return appointments.some((appointment) => overlaps(range, appointment));
}

export function generateBookingCode(date = new Date()) {
  const stamp = format(date, "yyMMdd");
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `HC${stamp}${random}`;
}
