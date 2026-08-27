import type { AppointmentStatus } from "@/types/database.types";

export const appointmentStatuses = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "rejected",
  "no_show",
] as const satisfies readonly AppointmentStatus[];

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  completed: "Đã hoàn thành",
  cancelled: "Đã hủy",
  rejected: "Đã từ chối",
  no_show: "Không đến",
};

export const appointmentStatusTone: Record<AppointmentStatus, string> = {
  pending: "border-antique-gold/50 bg-antique-gold/10 text-antique-gold",
  confirmed: "border-dark-jade/60 bg-dark-jade/20 text-emerald-100",
  completed: "border-ivory/40 bg-ivory/10 text-ivory",
  cancelled: "border-stone-mist/40 bg-stone-mist/10 text-stone-mist",
  rejected: "border-wine/60 bg-wine/25 text-red-100",
  no_show: "border-red-300/50 bg-red-950/30 text-red-100",
};

const terminalStatuses: AppointmentStatus[] = ["completed", "cancelled", "rejected", "no_show"];

const allowedTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending: ["confirmed", "rejected", "cancelled"],
  confirmed: ["completed", "cancelled", "no_show"],
  completed: [],
  cancelled: [],
  rejected: [],
  no_show: [],
};

export function canTransitionAppointmentStatus(from: AppointmentStatus, to: AppointmentStatus) {
  return allowedTransitions[from].includes(to);
}

export const canTransitionStatus = canTransitionAppointmentStatus;

export function getAllowedAppointmentStatusTransitions(from: AppointmentStatus) {
  return allowedTransitions[from];
}

export function isTerminalStatus(status: AppointmentStatus) {
  return terminalStatuses.includes(status);
}
