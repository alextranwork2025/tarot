"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  createAppointmentAction,
  getAvailableBookingSlotsAction,
  type ActionState,
} from "@/lib/actions/booking";
import { BOOKING_SERVICE_SELECTED_EVENT } from "@/lib/booking/events";
import type { PublicService } from "@/lib/queries/services";

type BookingFields = {
  fullName: string;
  phone: string;
  email: string;
  serviceId: string;
  readingFormat: "online" | "in_person" | "";
  date: string;
  startTime: string;
  topic: "love" | "career" | "finance" | "self_development" | "family" | "other" | "";
  message: string;
  consent: boolean;
};

export type BookingCustomerPrefill = {
  fullName: string;
  phone: string;
  email: string;
};

const initialState: ActionState = { ok: false, message: "" };
const inputClass = "min-h-12 rounded-sm border border-gilded/50 bg-obsidian px-4 text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold disabled:cursor-not-allowed disabled:opacity-60";
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());

function FieldError({ message }: { message?: string }) {
  return message ? <span role="alert" className="text-xs text-red-200">{message}</span> : null;
}

export function BookingForm({
  services,
  initialServiceId,
  customer,
}: {
  services: PublicService[];
  initialServiceId?: string;
  customer?: BookingCustomerPrefill | null;
}) {
  const [state, setState] = useState<ActionState>(initialState);
  const [pending, startTransition] = useTransition();
  const [submissionToken] = useState(() => crypto.randomUUID());
  const [availability, setAvailability] = useState<{
    key: string;
    slots: string[];
    message: string;
  }>({ key: "", slots: [], message: "" });
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isValid },
  } = useForm<BookingFields>({
    mode: "onChange",
    defaultValues: {
      fullName: customer?.fullName ?? "",
      phone: customer?.phone ?? "",
      email: customer?.email ?? "",
      serviceId: initialServiceId ?? services[0]?.id ?? "",
      readingFormat: "",
      date: "",
      startTime: "",
      topic: "",
      message: "",
      consent: false,
    },
  });
  const selectedServiceId = useWatch({ control, name: "serviceId" });
  const selectedDate = useWatch({ control, name: "date" });
  const selectedService = useMemo(() => services.find((service) => service.id === selectedServiceId), [selectedServiceId, services]);
  const availabilityKey = selectedServiceId && selectedDate ? `${selectedServiceId}:${selectedDate}` : "";
  const slotsLoading = Boolean(availabilityKey) && availability.key !== availabilityKey;
  const slots = availability.key === availabilityKey ? availability.slots : [];
  const slotsMessage = !availabilityKey
    ? "Chọn dịch vụ và ngày để xem lịch trống."
    : slotsLoading ? "Đang tải lịch trống..." : availability.message;

  useEffect(() => {
    const selectService = (event: Event) => {
      const serviceId = (event as CustomEvent<string>).detail;
      if (services.some((service) => service.id === serviceId)) {
        setValue("serviceId", serviceId, { shouldDirty: true, shouldValidate: true });
        setValue("readingFormat", "", { shouldDirty: true, shouldValidate: true });
        setValue("startTime", "", { shouldDirty: true, shouldValidate: true });
      }
    };
    window.addEventListener(BOOKING_SERVICE_SELECTED_EVENT, selectService);
    return () => window.removeEventListener(BOOKING_SERVICE_SELECTED_EVENT, selectService);
  }, [services, setValue]);

  useEffect(() => {
    if (!selectedServiceId || !selectedDate) return;
    let cancelled = false;
    getAvailableBookingSlotsAction(selectedServiceId, selectedDate).then((result) => {
      if (cancelled) return;
      setAvailability({
        key: `${selectedServiceId}:${selectedDate}`,
        slots: result.slots,
        message: result.ok
          ? result.slots.length ? "Chỉ hiển thị những khung giờ còn khả dụng." : "Ngày này chưa còn khung giờ phù hợp."
          : result.message,
      });
    });
    return () => { cancelled = true; };
  }, [selectedDate, selectedServiceId, setValue]);

  function submit(values: BookingFields) {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key === "consent") formData.set(key, value ? "on" : "");
      else formData.set(key, String(value ?? ""));
    });
    formData.set("submissionToken", submissionToken);
    formData.set("company", "");
    startTransition(async () => setState(await createAppointmentAction(initialState, formData)));
  }

  if (!services.length) {
    return <div id="booking-form" className="scroll-mt-28 border-y border-gilded/30 py-10 text-center text-stone-mist">Chưa có dịch vụ khả dụng để đặt lịch.</div>;
  }

  return (
    <form id="booking-form" onSubmit={handleSubmit(submit)} className="scroll-mt-28 border-y border-gilded/35 py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="grid content-start gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-antique-gold">Thông tin của bạn</p>
            <h3 className="mt-2 font-serif text-3xl text-ivory">Bắt đầu yêu cầu đặt lịch</h3>
          </div>
          <label className="grid gap-2 text-sm text-stone-mist">Họ và tên
            <input {...register("fullName", { required: "Vui lòng nhập họ và tên.", minLength: { value: 2, message: "Họ tên cần ít nhất 2 ký tự." } })} autoComplete="name" className={inputClass} />
            <FieldError message={errors.fullName?.message} />
          </label>
          <label className="grid gap-2 text-sm text-stone-mist">Số điện thoại
            <input {...register("phone", { required: "Vui lòng nhập số điện thoại.", pattern: { value: /^(?:\+84|0)[0-9\s.-]{8,14}$/, message: "Số điện thoại chưa đúng định dạng Việt Nam." } })} inputMode="tel" autoComplete="tel" className={inputClass} />
            <FieldError message={errors.phone?.message} />
          </label>
          <label className="grid gap-2 text-sm text-stone-mist">Email <span className="sr-only">không bắt buộc</span>
            <input {...register("email", { pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email chưa đúng định dạng." } })} type="email" autoComplete="email" className={inputClass} />
            <FieldError message={errors.email?.message} />
          </label>
          <label className="grid gap-2 text-sm text-stone-mist">Câu hỏi hoặc điều muốn chia sẻ
            <textarea {...register("message", { maxLength: { value: 1000, message: "Nội dung không được vượt quá 1000 ký tự." } })} rows={5} className={`${inputClass} py-3`} />
            <FieldError message={errors.message?.message} />
          </label>
        </section>

        <section className="grid content-start gap-5 lg:border-l lg:border-gilded/30 lg:pl-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-antique-gold">Dịch vụ và thời gian</p>
            <h3 className="mt-2 font-serif text-3xl text-ivory">Chọn một khoảng phù hợp</h3>
          </div>
          <label className="grid gap-2 text-sm text-stone-mist">Dịch vụ muốn sử dụng
            <select {...register("serviceId", { required: "Vui lòng chọn dịch vụ.", onChange: () => {
              setValue("readingFormat", "", { shouldDirty: true, shouldValidate: true });
              setValue("startTime", "", { shouldDirty: true, shouldValidate: true });
            } })} className={inputClass}>
              {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
            </select>
            <FieldError message={errors.serviceId?.message} />
          </label>
          <label className="grid gap-2 text-sm text-stone-mist">Hình thức xem bài
            <select {...register("readingFormat", { required: "Vui lòng chọn hình thức xem bài." })} className={inputClass}>
              <option value="">Chọn hình thức</option>
              {selectedService?.delivery_modes.includes("online") ? <option value="online">Online</option> : null}
              {selectedService?.delivery_modes.includes("in_person") ? <option value="in_person">Trực tiếp</option> : null}
            </select>
            <FieldError message={errors.readingFormat?.message} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm text-stone-mist">Ngày mong muốn
              <input {...register("date", { required: "Vui lòng chọn ngày.", validate: (value) => value >= today() || "Không thể chọn ngày trong quá khứ.", onChange: () => setValue("startTime", "", { shouldDirty: true, shouldValidate: true }) })} type="date" min={today()} className={inputClass} />
              <FieldError message={errors.date?.message} />
            </label>
            <label className="grid gap-2 text-sm text-stone-mist">Khung giờ
              <select
                {...register("startTime", { required: "Vui lòng chọn khung giờ còn trống." })}
                disabled={slotsLoading || !slots.length}
                className={inputClass}
              >
                <option value="">{slotsLoading ? "Đang tải..." : "Chọn khung giờ"}</option>
                {slots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
              </select>
              <FieldError message={errors.startTime?.message} />
            </label>
          </div>
          <p role="status" className="text-xs leading-5 text-stone-mist">{slotsMessage}</p>
          <label className="grid gap-2 text-sm text-stone-mist">Chủ đề muốn xem
            <select {...register("topic", { required: "Vui lòng chọn chủ đề." })} className={inputClass}>
              <option value="">Chọn chủ đề</option>
              <option value="love">Tình cảm</option><option value="career">Công việc</option>
              <option value="finance">Tài chính</option><option value="self_development">Phát triển bản thân</option>
              <option value="family">Gia đình</option><option value="other">Chủ đề khác</option>
            </select>
            <FieldError message={errors.topic?.message} />
          </label>
          {selectedService ? <p className="text-sm text-antique-gold">Thời lượng dự kiến: {selectedService.duration_minutes} phút.</p> : null}
          <label className="flex items-start gap-3 text-sm leading-6 text-stone-mist">
            <input {...register("consent", { required: "Bạn cần đồng ý cung cấp thông tin để đặt lịch." })} type="checkbox" className="mt-1 size-4 accent-antique-gold" />
            <span>Tôi đồng ý cung cấp thông tin để Huyền Cảnh liên hệ và xử lý yêu cầu đặt lịch.</span>
          </label>
          <FieldError message={errors.consent?.message} />
          <button
            type="submit"
            disabled={!isValid || pending || slotsLoading || !slots.length}
            className="min-h-12 rounded-full bg-antique-gold px-6 text-sm font-semibold uppercase tracking-[0.12em] text-obsidian transition hover:bg-ivory focus:outline-none focus:ring-2 focus:ring-ivory disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Đang gửi yêu cầu..." : "Gửi yêu cầu đặt lịch"}
          </button>
          {state.message ? <p role="status" className={state.ok ? "text-sm leading-6 text-antique-gold" : "text-sm leading-6 text-red-200"}>{state.message}{state.ok && state.bookingCode ? ` Mã lịch: ${state.bookingCode}.` : ""}</p> : null}
        </section>
      </div>
    </form>
  );
}
