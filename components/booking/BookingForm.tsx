"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { createAppointmentAction, type ActionState } from "@/lib/actions/booking";
import type { PublicService } from "@/lib/queries/services";

const initialState: ActionState = { ok: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-12 rounded-full bg-antique-gold px-6 text-sm font-semibold uppercase tracking-[0.15em] text-obsidian transition hover:bg-ivory focus:outline-none focus:ring-2 focus:ring-ivory disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Đang gửi..." : "Gửi yêu cầu"}
    </button>
  );
}

export function BookingForm({ services, initialServiceId }: { services: PublicService[]; initialServiceId?: string }) {
  const [state, formAction] = useActionState(createAppointmentAction, initialState);
  const [selectedService, setSelectedService] = useState(initialServiceId ?? services[0]?.id ?? "");
  const selected = useMemo(
    () => services.find((service) => service.id === selectedService),
    [selectedService, services],
  );

  return (
    <form action={formAction} className="grid gap-8">
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <section className="rounded-lg border border-gilded/40 bg-card-deep/80 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-antique-gold">Bước 1</p>
        <h2 className="mt-2 font-serif text-3xl text-ivory">Chọn dịch vụ</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {services.map((service) => (
            <label key={service.id} className="cursor-pointer rounded-lg border border-gilded/40 p-4 transition has-[:checked]:border-antique-gold has-[:checked]:bg-antique-gold/10">
              <input
                type="radio"
                name="serviceId"
                value={service.id}
                checked={selectedService === service.id}
                onChange={() => setSelectedService(service.id)}
                className="sr-only"
              />
              <span className="block font-serif text-2xl text-ivory">{service.name}</span>
              <span className="mt-2 block text-sm leading-6 text-stone-mist">{service.short_description ?? service.description}</span>
              <span className="mt-4 block text-sm text-antique-gold">
                {service.duration_minutes} phút · {service.price === 0 ? "Giá đang cập nhật" : `${service.price.toLocaleString("vi-VN")}đ`}
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-gilded/40 bg-card-deep/80 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-antique-gold">Bước 2</p>
        <h2 className="mt-2 font-serif text-3xl text-ivory">Chọn ngày và giờ</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-stone-mist">
            Ngày hẹn
            <input name="date" type="date" required className="min-h-12 rounded-sm border border-gilded/50 bg-obsidian px-4 text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold" />
          </label>
          <label className="grid gap-2 text-sm text-stone-mist">
            Khung giờ
            <select name="startTime" required className="min-h-12 rounded-sm border border-gilded/50 bg-obsidian px-4 text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold">
              {["09:00", "10:30", "13:30", "15:00", "19:00"].map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </label>
        </div>
        {selected ? (
          <p className="mt-4 text-sm text-stone-mist">Thời lượng dự kiến: {selected.duration_minutes} phút.</p>
        ) : null}
      </section>

      <section className="rounded-lg border border-gilded/40 bg-card-deep/80 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-antique-gold">Bước 3</p>
        <h2 className="mt-2 font-serif text-3xl text-ivory">Thông tin liên hệ</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-stone-mist">Họ tên
            <input name="fullName" required className="min-h-12 rounded-sm border border-gilded/50 bg-obsidian px-4 text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold" />
          </label>
          <label className="grid gap-2 text-sm text-stone-mist">Số điện thoại
            <input name="phone" required inputMode="tel" className="min-h-12 rounded-sm border border-gilded/50 bg-obsidian px-4 text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold" />
          </label>
          <label className="grid gap-2 text-sm text-stone-mist">Email tùy chọn
            <input name="email" type="email" className="min-h-12 rounded-sm border border-gilded/50 bg-obsidian px-4 text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold" />
          </label>
          <label className="grid gap-2 text-sm text-stone-mist">Ngày sinh tùy chọn
            <input name="birthDate" type="date" className="min-h-12 rounded-sm border border-gilded/50 bg-obsidian px-4 text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold" />
          </label>
        </div>
        <label className="mt-4 grid gap-2 text-sm text-stone-mist">Lời nhắn
          <textarea name="message" rows={4} className="rounded-sm border border-gilded/50 bg-obsidian px-4 py-3 text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold" />
        </label>
      </section>

      <section className="rounded-lg border border-gilded/40 bg-card-deep/80 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-antique-gold">Bước 4</p>
        <h2 className="mt-2 font-serif text-3xl text-ivory">Xác nhận</h2>
        <p className="mt-3 text-sm leading-7 text-stone-mist">
          Sau khi gửi, lịch hẹn sẽ ở trạng thái chờ xác nhận. Mã đặt lịch sẽ hiện trên màn hình và không chứa ID nội bộ.
        </p>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <SubmitButton />
          {state.message ? (
            <p role="status" className={state.ok ? "text-antique-gold" : "text-red-200"}>
              {state.message} {state.ok && state.bookingCode ? `Mã của bạn: ${state.bookingCode}` : ""}
            </p>
          ) : null}
        </div>
      </section>
    </form>
  );
}
