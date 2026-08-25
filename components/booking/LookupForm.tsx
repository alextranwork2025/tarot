"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  lookupAppointmentAction,
  requestCancelAppointmentAction,
  type ActionState,
} from "@/lib/actions/booking";

const initialState: ActionState = { ok: false, message: "" };

function LookupButton({ children }: { children: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-12 rounded-full bg-antique-gold px-6 text-sm font-semibold uppercase tracking-[0.15em] text-obsidian transition hover:bg-ivory focus:outline-none focus:ring-2 focus:ring-ivory disabled:opacity-60"
    >
      {pending ? "Đang xử lý..." : children}
    </button>
  );
}

export function LookupForm() {
  const [lookupState, lookupAction] = useActionState(lookupAppointmentAction, initialState);
  const [cancelState, cancelAction] = useActionState(requestCancelAppointmentAction, initialState);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form action={lookupAction} className="rounded-lg border border-gilded/40 bg-card-deep/80 p-6">
        <h2 className="font-serif text-3xl text-ivory">Tra cứu lịch hẹn</h2>
        <div className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm text-stone-mist">Mã đặt lịch
            <input name="bookingCode" required className="min-h-12 rounded-sm border border-gilded/50 bg-obsidian px-4 text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold" />
          </label>
          <label className="grid gap-2 text-sm text-stone-mist">Số điện thoại
            <input name="phone" required inputMode="tel" className="min-h-12 rounded-sm border border-gilded/50 bg-obsidian px-4 text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold" />
          </label>
          <LookupButton>Tra cứu</LookupButton>
          {lookupState.message ? <p role="status" className={lookupState.ok ? "text-antique-gold" : "text-red-200"}>{lookupState.message}</p> : null}
        </div>
      </form>

      <form action={cancelAction} className="rounded-lg border border-gilded/40 bg-card-deep/80 p-6">
        <h2 className="font-serif text-3xl text-ivory">Gửi yêu cầu hủy</h2>
        <div className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm text-stone-mist">Mã đặt lịch
            <input name="bookingCode" required className="min-h-12 rounded-sm border border-gilded/50 bg-obsidian px-4 text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold" />
          </label>
          <label className="grid gap-2 text-sm text-stone-mist">Số điện thoại
            <input name="phone" required inputMode="tel" className="min-h-12 rounded-sm border border-gilded/50 bg-obsidian px-4 text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold" />
          </label>
          <label className="grid gap-2 text-sm text-stone-mist">Lý do tùy chọn
            <textarea name="reason" rows={3} className="rounded-sm border border-gilded/50 bg-obsidian px-4 py-3 text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold" />
          </label>
          <LookupButton>Gửi yêu cầu hủy</LookupButton>
          {cancelState.message ? <p role="status" className={cancelState.ok ? "text-antique-gold" : "text-red-200"}>{cancelState.message}</p> : null}
        </div>
      </form>
    </div>
  );
}
