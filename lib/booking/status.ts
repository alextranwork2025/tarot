import type { AppointmentStatus } from "@/types/database.types";

const terminalStatuses: AppointmentStatus[] = ["completed", "cancelled", "declined", "no_show"];

const allowedTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending: ["confirmed", "declined", "cancelled", "rescheduled"],
  confirmed: ["completed", "cancelled", "no_show", "rescheduled"],
  declined: [],
  rescheduled: ["confirmed", "cancelled"],
  completed: [],
  cancelled: [],
  no_show: [],
};

export function canTransitionStatus(from: AppointmentStatus, to: AppointmentStatus) {
  return allowedTransitions[from].includes(to);
}

export function isTerminalStatus(status: AppointmentStatus) {
  return terminalStatuses.includes(status);
}
