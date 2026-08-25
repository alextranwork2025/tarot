"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { adminLoginAction } from "@/lib/actions/login";

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <button disabled={pending} className="min-h-12 rounded-full bg-antique-gold px-6 text-sm font-semibold uppercase tracking-[0.15em] text-obsidian transition hover:bg-ivory focus:outline-none focus:ring-2 focus:ring-ivory disabled:opacity-60">
      {pending ? "Đang đăng nhập..." : "Đăng nhập"}
    </button>
  );
}

export function AdminLoginForm({ notice, detail }: { notice?: string; detail?: string }) {
  const [state, formAction] = useActionState(adminLoginAction, { message: "" });

  return (
    <form
      className="mx-auto max-w-md rounded-lg border border-gilded/40 bg-card-deep/85 p-6"
      action={formAction}
    >
      <h1 className="font-serif text-4xl text-ivory">Đăng nhập quản trị</h1>
      <p className="mt-3 text-sm leading-6 text-stone-mist">Không có đăng ký công khai. Tài khoản quản trị cần được tạo trong Supabase.</p>
      {notice ? (
        <div className="mt-5 rounded-sm border border-red-200/40 bg-red-950/30 p-3 text-sm leading-6 text-red-100">
          <p>{notice}</p>
          {detail ? <p className="mt-2 break-all text-red-100/80">Chi tiết: {detail}</p> : null}
        </div>
      ) : null}
      <div className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm text-stone-mist">Email
          <input name="email" type="email" required className="min-h-12 rounded-sm border border-gilded/50 bg-obsidian px-4 text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold" />
        </label>
        <label className="grid gap-2 text-sm text-stone-mist">Mật khẩu
          <input name="password" type="password" required className="min-h-12 rounded-sm border border-gilded/50 bg-obsidian px-4 text-ivory focus:outline-none focus:ring-2 focus:ring-antique-gold" />
        </label>
        <LoginButton />
        {state.message ? <p role="alert" className="text-sm text-red-200">{state.message}</p> : null}
      </div>
    </form>
  );
}
