"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import {
  adminCreateCustomerAccountAction,
  customerChangePasswordAction,
  customerLoginAction,
  updateCustomerProfileAction,
  type CustomerActionState,
} from "@/lib/actions/customer/account";

type Message = CustomerActionState | null;

function ResultMessage({ message }: { message: Message }) {
  if (!message?.message) {
    return null;
  }

  return (
    <p role="status" className={message.ok ? "text-antique-gold" : "text-red-200"}>
      {message.message}
    </p>
  );
}

function SubmitButton({ pending, label, pendingLabel }: { pending: boolean; label: string; pendingLabel: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-12 rounded-full bg-antique-gold px-6 text-sm font-semibold uppercase tracking-[0.15em] text-obsidian transition hover:bg-ivory focus:outline-none focus:ring-2 focus:ring-ivory disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

export function AdminCreateCustomerForm() {
  const { register, handleSubmit, reset } = useForm<{ fullName: string; phone: string }>();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<Message>(null);

  return (
    <form
      className="grid gap-4 rounded-lg border border-gilded/40 bg-card-deep/80 p-5"
      onSubmit={handleSubmit((values) => {
        const formData = new FormData();
        formData.set("fullName", values.fullName);
        formData.set("phone", values.phone);
        startTransition(async () => {
          const result = await adminCreateCustomerAccountAction({ ok: false, message: "" }, formData);
          setMessage(result);
          if (result.ok) reset();
        });
      })}
    >
      <h2 className="font-serif text-3xl text-ivory">Tạo tài khoản khách hàng</h2>
      <p className="text-sm leading-6 text-stone-mist">
        Tài khoản sẽ được tạo trong Supabase Auth bằng số điện thoại, tự xác nhận số điện thoại và buộc đổi mật khẩu lần đầu.
      </p>
      <label className="grid gap-2 text-sm text-stone-mist">
        Tên khách hàng
        <input {...register("fullName", { required: true })} className="min-h-12 rounded-sm border border-gilded/50 bg-obsidian px-4 text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold" />
      </label>
      <label className="grid gap-2 text-sm text-stone-mist">
        Số điện thoại
        <input {...register("phone", { required: true })} inputMode="tel" className="min-h-12 rounded-sm border border-gilded/50 bg-obsidian px-4 text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold" />
      </label>
      <SubmitButton pending={pending} label="Tạo tài khoản" pendingLabel="Đang tạo..." />
      <ResultMessage message={message} />
    </form>
  );
}

export function CustomerLoginForm({ notice }: { notice?: string }) {
  const { register, handleSubmit } = useForm<{ phone: string; password: string }>();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<Message>(notice ? { ok: false, message: notice } : null);

  return (
    <form
      className="mx-auto max-w-md rounded-lg border border-gilded/40 bg-card-deep/85 p-6"
      onSubmit={handleSubmit((values) => {
        const formData = new FormData();
        formData.set("phone", values.phone);
        formData.set("password", values.password);
        startTransition(async () => {
          const result = await customerLoginAction({ ok: false, message: "" }, formData);
          setMessage(result);
        });
      })}
    >
      <h1 className="font-serif text-4xl text-ivory">Đăng nhập khách hàng</h1>
      <p className="mt-3 text-sm leading-6 text-stone-mist">Dùng số điện thoại đã được quản trị viên tạo tài khoản.</p>
      <div className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm text-stone-mist">
          Số điện thoại
          <input {...register("phone", { required: true })} inputMode="tel" className="min-h-12 rounded-sm border border-gilded/50 bg-obsidian px-4 text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold" />
        </label>
        <label className="grid gap-2 text-sm text-stone-mist">
          Mật khẩu
          <input {...register("password", { required: true })} type="password" className="min-h-12 rounded-sm border border-gilded/50 bg-obsidian px-4 text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold" />
        </label>
        <SubmitButton pending={pending} label="Đăng nhập" pendingLabel="Đang đăng nhập..." />
        <ResultMessage message={message} />
      </div>
    </form>
  );
}

export function CustomerChangePasswordForm({ required }: { required: boolean }) {
  const { register, handleSubmit } = useForm<{
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<Message>(null);

  return (
    <form
      className="mx-auto max-w-md rounded-lg border border-gilded/40 bg-card-deep/85 p-6"
      onSubmit={handleSubmit((values) => {
        const formData = new FormData();
        formData.set("currentPassword", values.currentPassword ?? "");
        formData.set("newPassword", values.newPassword);
        formData.set("confirmPassword", values.confirmPassword);
        startTransition(async () => {
          const result = await customerChangePasswordAction({ ok: false, message: "" }, formData);
          setMessage(result);
        });
      })}
    >
      <h1 className="font-serif text-4xl text-ivory">Đổi mật khẩu</h1>
      {required ? (
        <p className="mt-3 text-sm leading-6 text-antique-gold">Bạn cần đổi mật khẩu mặc định trước khi dùng tài khoản.</p>
      ) : null}
      <div className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm text-stone-mist">
          Mật khẩu hiện tại
          <input {...register("currentPassword")} type="password" className="min-h-12 rounded-sm border border-gilded/50 bg-obsidian px-4 text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold" />
        </label>
        <label className="grid gap-2 text-sm text-stone-mist">
          Mật khẩu mới
          <input {...register("newPassword", { required: true, minLength: 8 })} type="password" className="min-h-12 rounded-sm border border-gilded/50 bg-obsidian px-4 text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold" />
        </label>
        <label className="grid gap-2 text-sm text-stone-mist">
          Nhập lại mật khẩu mới
          <input {...register("confirmPassword", { required: true, minLength: 8 })} type="password" className="min-h-12 rounded-sm border border-gilded/50 bg-obsidian px-4 text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold" />
        </label>
        <SubmitButton pending={pending} label="Lưu mật khẩu" pendingLabel="Đang lưu..." />
        <ResultMessage message={message} />
      </div>
    </form>
  );
}

export function CustomerProfileForm({
  customer,
}: {
  customer: { full_name: string; email: string | null; birth_date: string | null };
}) {
  const { register, handleSubmit } = useForm<{ fullName: string; email: string; birthDate: string }>({
    defaultValues: {
      fullName: customer.full_name,
      email: customer.email ?? "",
      birthDate: customer.birth_date ?? "",
    },
  });
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<Message>(null);

  return (
    <form
      className="grid gap-4 rounded-lg border border-gilded/40 bg-card-deep/80 p-5"
      onSubmit={handleSubmit((values) => {
        const formData = new FormData();
        formData.set("fullName", values.fullName);
        formData.set("email", values.email);
        formData.set("birthDate", values.birthDate);
        startTransition(async () => {
          const result = await updateCustomerProfileAction({ ok: false, message: "" }, formData);
          setMessage(result);
        });
      })}
    >
      <h2 className="font-serif text-3xl text-ivory">Thông tin cá nhân</h2>
      <label className="grid gap-2 text-sm text-stone-mist">
        Họ tên
        <input {...register("fullName", { required: true })} className="min-h-12 rounded-sm border border-gilded/50 bg-obsidian px-4 text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold" />
      </label>
      <label className="grid gap-2 text-sm text-stone-mist">
        Email tùy chọn
        <input {...register("email")} type="email" className="min-h-12 rounded-sm border border-gilded/50 bg-obsidian px-4 text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold" />
      </label>
      <label className="grid gap-2 text-sm text-stone-mist">
        Ngày sinh tùy chọn
        <input {...register("birthDate")} type="date" className="min-h-12 rounded-sm border border-gilded/50 bg-obsidian px-4 text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold" />
      </label>
      <SubmitButton pending={pending} label="Lưu thông tin" pendingLabel="Đang lưu..." />
      <ResultMessage message={message} />
    </form>
  );
}
