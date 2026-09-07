"use client";

import { CalendarDays } from "lucide-react";

import { BOOKING_SERVICE_SELECTED_EVENT } from "@/lib/booking/events";

export function ServiceSelectButton({ serviceId }: { serviceId: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new CustomEvent(BOOKING_SERVICE_SELECTED_EVENT, { detail: serviceId }));
        document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-antique-gold px-4 text-sm font-semibold text-obsidian transition hover:bg-ivory focus:outline-none focus:ring-2 focus:ring-ivory"
    >
      <CalendarDays size={16} aria-hidden="true" />
      Chọn dịch vụ
    </button>
  );
}
