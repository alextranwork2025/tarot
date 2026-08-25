"use server";

import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type LoginActionState = {
  message: string;
};

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function adminLoginAction(
  _previous: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const email = readString(formData, "email").trim();
  const password = readString(formData, "password");

  if (!email || !password) {
    return { message: "Vui lòng nhập email và mật khẩu." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { message: "Đăng nhập không thành công. Vui lòng kiểm tra email và mật khẩu." };
  }

  const admin = createAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id,role,is_active")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    await supabase.auth.signOut();
    return {
      message: `Không thể đọc bảng profiles: ${profileError.message}`,
    };
  }

  if (!profile) {
    await supabase.auth.signOut();
    return {
      message:
        `Đăng nhập Auth thành công nhưng chưa có profile trùng Auth user id ${data.user.id}. Hãy tạo profiles.id đúng bằng id này.`,
    };
  }

  if (!profile.is_active) {
    await supabase.auth.signOut();
    return {
      message: "Profile của tài khoản này đang bị tắt. Hãy đặt is_active = true.",
    };
  }

  if (profile.role !== "admin" && profile.role !== "staff") {
    await supabase.auth.signOut();
    return {
      message: `Profile có role "${profile.role}", cần role admin hoặc staff.`,
    };
  }

  redirect("/admin");
}
