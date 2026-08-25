"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  updateAppointmentStatusAction,
  updateInternalNoteAction,
  updateServiceAction,
  updateWorkingHourAction,
  type AdminActionState,
} from "@/lib/actions/admin";
import type { AppointmentStatus } from "@/types/database.types";

const initialState: AdminActionState = { ok: false, message: "" };

function AdminSubmit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="min-h-10 rounded-full border border-antique-gold px-4 text-sm text-antique-gold transition hover:bg-antique-gold hover:text-obsidian focus:outline-none focus:ring-2 focus:ring-antique-gold disabled:opacity-60">
      {pending ? "Đang lưu..." : label}
    </button>
  );
}

export function StatusForm({ appointmentId, currentStatus }: { appointmentId: string; currentStatus: AppointmentStatus }) {
  const [state, action] = useActionState(updateAppointmentStatusAction, initialState);
  return (
    <form action={action} className="grid gap-3 rounded-lg border border-gilded/40 p-4">
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <label className="grid gap-2 text-sm text-stone-mist">Trạng thái
        <select name="status" defaultValue={currentStatus} className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory">
          {["pending", "confirmed", "declined", "rescheduled", "completed", "cancelled", "no_show"].map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </label>
      <textarea name="note" placeholder="Ghi chú nội bộ" className="rounded-sm border border-gilded/50 bg-obsidian px-3 py-2 text-ivory" />
      <AdminSubmit label="Cập nhật trạng thái" />
      {state.message ? <p className={state.ok ? "text-antique-gold" : "text-red-200"}>{state.message}</p> : null}
    </form>
  );
}

export function InternalNoteForm({ appointmentId, defaultValue }: { appointmentId: string; defaultValue: string }) {
  const [state, action] = useActionState(updateInternalNoteAction, initialState);
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <textarea name="internalNote" defaultValue={defaultValue} rows={5} className="rounded-sm border border-gilded/50 bg-obsidian px-3 py-2 text-ivory" />
      <AdminSubmit label="Lưu ghi chú" />
      {state.message ? <p className={state.ok ? "text-antique-gold" : "text-red-200"}>{state.message}</p> : null}
    </form>
  );
}

export function ServiceEditForm({
  service,
}: {
  service: { id: string; name: string; description: string | null; duration_minutes: number; price: number; is_active: boolean };
}) {
  const [state, action] = useActionState(updateServiceAction, initialState);
  return (
    <form action={action} className="grid gap-3 rounded-lg border border-gilded/40 bg-card-deep/75 p-4">
      <input type="hidden" name="serviceId" value={service.id} />
      <input name="name" defaultValue={service.name} className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory" />
      <textarea name="description" defaultValue={service.description ?? ""} className="rounded-sm border border-gilded/50 bg-obsidian px-3 py-2 text-ivory" />
      <input name="durationMinutes" type="number" defaultValue={service.duration_minutes} className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory" />
      <input name="price" type="number" defaultValue={service.price} className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory" />
      <label className="flex items-center gap-2 text-sm text-stone-mist"><input name="isActive" type="checkbox" defaultChecked={service.is_active} /> Đang hoạt động</label>
      <AdminSubmit label="Lưu dịch vụ" />
      {state.message ? <p className={state.ok ? "text-antique-gold" : "text-red-200"}>{state.message}</p> : null}
    </form>
  );
}

export function WorkingHourForm({ hour }: { hour?: { id: string; weekday: number; start_time: string; end_time: string; is_active: boolean } }) {
  const [state, action] = useActionState(updateWorkingHourAction, initialState);
  return (
    <form action={action} className="grid gap-3 rounded-lg border border-gilded/40 bg-card-deep/75 p-4 md:grid-cols-5">
      <input type="hidden" name="id" value={hour?.id ?? ""} />
      <input name="weekday" type="number" min="0" max="6" defaultValue={hour?.weekday ?? 1} className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory" />
      <input name="startTime" defaultValue={hour?.start_time?.slice(0, 5) ?? "09:00"} className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory" />
      <input name="endTime" defaultValue={hour?.end_time?.slice(0, 5) ?? "17:00"} className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory" />
      <label className="flex items-center gap-2 text-sm text-stone-mist"><input name="isActive" type="checkbox" defaultChecked={hour?.is_active ?? true} /> Mở</label>
      <div>
        <AdminSubmit label="Lưu" />
        {state.message ? <p className={state.ok ? "text-antique-gold" : "text-red-200"}>{state.message}</p> : null}
      </div>
    </form>
  );
}
