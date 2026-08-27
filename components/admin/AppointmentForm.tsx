"use client";

import { addMinutes, format, parse } from "date-fns";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { createAppointment, updateAppointment, type AdminActionState } from "@/lib/actions/admin";
import type { AdminCustomerOption } from "@/lib/queries/admin";
import type { PublicService } from "@/lib/queries/services";

type AppointmentFormValues = {
  customerMode: "existing" | "quick";
  customerId: string;
  fullName: string;
  phone: string;
  serviceId: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  customerMessage: string;
  internalNote: string;
  status: "pending" | "confirmed";
};

type AppointmentInitial = {
  id: string;
  customer_id: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  customer_message: string | null;
  internal_note: string | null;
  updated_at: string | null;
};

type Props = {
  mode: "create" | "edit";
  services: PublicService[];
  customers: AdminCustomerOption[];
  initial?: AppointmentInitial;
  locked?: boolean;
};

const emptyState: AdminActionState = { ok: false, message: "" };

function calculateEndTime(date: string, startTime: string, durationMinutes: number) {
  if (!date || !startTime || !durationMinutes) {
    return "";
  }

  const start = parse(`${date} ${startTime}`, "yyyy-MM-dd HH:mm", new Date());
  return format(addMinutes(start, durationMinutes), "HH:mm");
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs text-red-200">{message}</p> : null;
}

export function AppointmentForm({ mode, services, customers, initial, locked = false }: Props) {
  const initialService = services.find((service) => service.id === initial?.service_id) ?? services[0];
  const { register, handleSubmit, setValue } = useForm<AppointmentFormValues>({
    defaultValues: {
      customerMode: "existing",
      customerId: initial?.customer_id ?? customers[0]?.id ?? "",
      fullName: "",
      phone: "",
      serviceId: initial?.service_id ?? initialService?.id ?? "",
      date: initial?.appointment_date ?? format(new Date(), "yyyy-MM-dd"),
      startTime: initial?.start_time.slice(0, 5) ?? "09:00",
      durationMinutes: initialService?.duration_minutes ?? 60,
      customerMessage: initial?.customer_message ?? "",
      internalNote: initial?.internal_note ?? "",
      status: "pending",
    },
  });
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<AdminActionState>(emptyState);
  const [customerMode, setCustomerMode] = useState<AppointmentFormValues["customerMode"]>("existing");
  const [date, setDate] = useState(initial?.appointment_date ?? format(new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState(initial?.start_time.slice(0, 5) ?? "09:00");
  const [durationMinutes, setDurationMinutes] = useState(initialService?.duration_minutes ?? 60);
  const endTime = useMemo(() => calculateEndTime(date, startTime, durationMinutes), [date, startTime, durationMinutes]);

  function onSubmit(values: AppointmentFormValues) {
    const formData = new FormData();
    if (initial) {
      formData.set("appointmentId", initial.id);
      formData.set("expectedUpdatedAt", initial.updated_at ?? "");
    }
    formData.set("customerMode", values.customerMode);
    formData.set("customerId", values.customerId ?? "");
    formData.set("fullName", values.fullName ?? "");
    formData.set("phone", values.phone ?? "");
    formData.set("serviceId", values.serviceId);
    formData.set("date", values.date);
    formData.set("startTime", values.startTime);
    formData.set("durationMinutes", String(values.durationMinutes));
    formData.set("customerMessage", values.customerMessage ?? "");
    formData.set("internalNote", values.internalNote ?? "");
    formData.set("status", values.status);

    startTransition(async () => {
      const action = mode === "create" ? createAppointment : updateAppointment;
      const result = await action(emptyState, formData);
      setMessage(result);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 rounded-lg border border-gilded/40 bg-card-deep/80 p-5">
      <fieldset disabled={pending || locked} className="grid gap-5 disabled:opacity-70">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-stone-mist">
            Khách hàng
            <select
              {...register("customerMode")}
              onChange={(event) => {
                const modeValue = event.target.value === "quick" ? "quick" : "existing";
                setCustomerMode(modeValue);
                setValue("customerMode", modeValue);
              }}
              className="min-h-11 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory"
            >
              <option value="existing">Chọn khách hàng có sẵn</option>
              <option value="quick">Tạo nhanh khách hàng</option>
            </select>
          </label>
          {customerMode === "existing" ? (
            <label className="grid gap-2 text-sm text-stone-mist">
              Hồ sơ khách hàng
              <select {...register("customerId")} className="min-h-11 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory">
                <option value="">Chọn khách hàng</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.full_name} - {customer.phone}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-stone-mist">
                Họ tên
                <input {...register("fullName")} className="min-h-11 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory" />
                <FieldError message={message.ok ? undefined : message.fieldErrors?.fullName?.[0]} />
              </label>
              <label className="grid gap-2 text-sm text-stone-mist">
                Số điện thoại
                <input {...register("phone")} inputMode="tel" className="min-h-11 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory" />
                <FieldError message={message.ok ? undefined : message.fieldErrors?.phone?.[0]} />
              </label>
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <label className="grid gap-2 text-sm text-stone-mist md:col-span-2">
            Dịch vụ
            <select
              {...register("serviceId")}
              onChange={(event) => {
                const service = services.find((item) => item.id === event.target.value);
                setValue("serviceId", event.target.value);
                if (service) {
                  setValue("durationMinutes", service.duration_minutes);
                  setDurationMinutes(service.duration_minutes);
                }
              }}
              className="min-h-11 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory"
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-stone-mist">
            Ngày hẹn
            <input
              {...register("date")}
              onChange={(event) => {
                setValue("date", event.target.value);
                setDate(event.target.value);
              }}
              type="date"
              className="min-h-11 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory"
            />
          </label>
          <label className="grid gap-2 text-sm text-stone-mist">
            Giờ bắt đầu
            <input
              {...register("startTime")}
              onChange={(event) => {
                setValue("startTime", event.target.value);
                setStartTime(event.target.value);
              }}
              type="time"
              className="min-h-11 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2 text-sm text-stone-mist">
            Thời lượng
            <input
              {...register("durationMinutes", { valueAsNumber: true })}
              onChange={(event) => {
                const value = Number(event.target.value);
                setValue("durationMinutes", value);
                setDurationMinutes(value);
              }}
              min={15}
              max={480}
              step={15}
              type="number"
              className="min-h-11 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory"
            />
          </label>
          <label className="grid gap-2 text-sm text-stone-mist">
            Giờ kết thúc
            <input value={endTime} readOnly className="min-h-11 rounded-sm border border-gilded/30 bg-obsidian/70 px-3 text-stone-mist" />
          </label>
          {mode === "create" ? (
            <label className="grid gap-2 text-sm text-stone-mist">
              Trạng thái ban đầu
              <select {...register("status")} className="min-h-11 rounded-sm border border-gilded/50 bg-obsidian px-3 text-ivory">
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
              </select>
            </label>
          ) : null}
        </div>

        <label className="grid gap-2 text-sm text-stone-mist">
          Lời nhắn khách hàng
          <textarea {...register("customerMessage")} rows={4} className="rounded-sm border border-gilded/50 bg-obsidian px-3 py-2 text-ivory" />
        </label>
        <label className="grid gap-2 text-sm text-stone-mist">
          Ghi chú nội bộ
          <textarea {...register("internalNote")} rows={5} className="rounded-sm border border-gilded/50 bg-obsidian px-3 py-2 text-ivory" />
        </label>
      </fieldset>

      <button
        type="submit"
        disabled={pending || locked}
        className="min-h-11 rounded-full bg-antique-gold px-5 text-sm font-semibold text-obsidian transition hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Đang lưu..." : mode === "create" ? "Tạo lịch hẹn" : "Lưu thay đổi"}
      </button>
      {locked ? <p className="text-sm text-antique-gold">Lịch hẹn đã ở trạng thái kết thúc nên không thể chỉnh sửa.</p> : null}
      {message.message ? <p role="status" className={message.ok ? "text-antique-gold" : "text-red-200"}>{message.message}</p> : null}
    </form>
  );
}
