"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";

import {
  appointmentStatusLabels,
  appointmentStatuses,
  appointmentStatusTone,
  canTransitionAppointmentStatus,
  getAllowedAppointmentStatusTransitions,
  isTerminalStatus,
} from "@/lib/booking/status";
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

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span className={`inline-flex min-h-7 items-center rounded-full border px-3 text-xs ${appointmentStatusTone[status]}`}>
      {appointmentStatusLabels[status]}
    </span>
  );
}

export function StatusQuickActions({ appointmentId, currentStatus }: { appointmentId: string; currentStatus: AppointmentStatus }) {
  const allowed = appointmentStatuses.filter((status) => canTransitionAppointmentStatus(currentStatus, status));
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<AdminActionState>(initialState);

  if (allowed.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {allowed.map((status) => (
        <button
          key={status}
          disabled={pending}
          onClick={() => {
            const formData = new FormData();
            formData.set("appointmentId", appointmentId);
            formData.set("status", status);
            formData.set("note", "");
            startTransition(async () => {
              const result = await updateAppointmentStatusAction(initialState, formData);
              setMessage(result);
            });
          }}
          className="min-h-9 rounded-full border border-gilded/50 px-3 text-xs text-stone-mist hover:border-antique-gold hover:text-antique-gold disabled:opacity-60"
        >
          {appointmentStatusLabels[status]}
        </button>
      ))}
      {message.message ? (
        <p role="status" className={`fixed bottom-5 right-5 z-50 max-w-sm rounded-lg border bg-card-deep px-4 py-3 text-sm shadow-xl ${message.ok ? "border-antique-gold text-antique-gold" : "border-red-300 text-red-100"}`}>
          {message.message}
        </p>
      ) : null}
    </div>
  );
}

export function StatusForm({ appointmentId, currentStatus }: { appointmentId: string; currentStatus: AppointmentStatus }) {
  const [state, action] = useActionState(updateAppointmentStatusAction, initialState);
  const nextStatuses = getAllowedAppointmentStatusTransitions(currentStatus);

  if (isTerminalStatus(currentStatus)) {
    return (
      <aside className="grid gap-3 rounded-lg border border-gilded/40 bg-card-deep/75 p-4">
        <StatusBadge status={currentStatus} />
        <p className="text-sm text-stone-mist">Lịch hẹn đã kết thúc.</p>
      </aside>
    );
  }

  return (
    <form action={action} className="grid gap-3 rounded-lg border border-gilded/40 bg-card-deep/75 p-4">
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <StatusBadge status={currentStatus} />
      <label className="grid gap-2 text-sm text-stone-mist">
        Chuyển trạng thái
        <select name="status" className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory">
          {nextStatuses.map((status) => (
            <option key={status} value={status}>{appointmentStatusLabels[status]}</option>
          ))}
        </select>
      </label>
      <textarea name="note" placeholder="Lý do hoặc ghi chú" className="rounded-sm border border-gilded/50 bg-obsidian px-3 py-2 text-ivory" />
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

export function WorkingHourForm({ hour }: { hour?: { id: string; day_of_week: number; start_time: string; end_time: string; is_active: boolean } }) {
  const [state, action] = useActionState(updateWorkingHourAction, initialState);
  return (
    <form action={action} className="grid gap-3 rounded-lg border border-gilded/40 bg-card-deep/75 p-4 md:grid-cols-5">
      <input type="hidden" name="id" value={hour?.id ?? ""} />
      <input name="dayOfWeek" type="number" min="0" max="6" defaultValue={hour?.day_of_week ?? 1} className="min-h-10 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory" />
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
