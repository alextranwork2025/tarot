"use server";

import { redirect } from "next/navigation";

import { requireAdminProfile } from "@/lib/auth/admin";
import {
  requireCustomer,
  requireCustomerAllowPasswordChange,
} from "@/lib/auth/customer";
import { maskPhone } from "@/lib/format/privacy";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  adminCreateCustomerSchema,
  changePasswordSchema,
  customerLoginSchema,
  customerProfileSchema,
  DEFAULT_CUSTOMER_PASSWORD,
} from "@/lib/validations/customer";

export type CustomerActionState = {
  ok: boolean;
  message: string;
};

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function adminCreateCustomerAccountAction(
  _previous: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  await requireAdminProfile();

  const parsed = adminCreateCustomerSchema.safeParse({
    fullName: readString(formData, "fullName"),
    phone: readString(formData, "phone"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Dữ liệu khách hàng chưa hợp lệ." };
  }

  const admin = createAdminClient();
  const { data: existingByPhone, error: findError } = await admin
    .from("customers")
    .select("id,auth_user_id")
    .eq("phone", parsed.data.phone)
    .maybeSingle();

  if (findError) {
    return { ok: false, message: `Không thể kiểm tra khách hàng: ${findError.message}` };
  }

  if (existingByPhone?.auth_user_id) {
    return {
      ok: false,
      message: `Khách hàng ${maskPhone(parsed.data.phone)} đã được liên kết tài khoản đăng nhập.`,
    };
  }

  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    phone: parsed.data.phone,
    password: DEFAULT_CUSTOMER_PASSWORD,
    phone_confirm: true,
    user_metadata: {
      full_name: parsed.data.fullName,
      account_type: "customer",
      must_change_password: true,
    },
  });

  if (authError || !authUser.user) {
    return { ok: false, message: `Không thể tạo Auth user: ${authError?.message ?? "Không rõ lỗi"}` };
  }

  const customerPayload = {
    full_name: parsed.data.fullName,
    phone: parsed.data.phone,
    auth_user_id: authUser.user.id,
    must_change_password: true,
  };

  const request = existingByPhone
    ? admin.from("customers").update(customerPayload).eq("id", existingByPhone.id)
    : admin.from("customers").insert(customerPayload);
  const { error: customerError } = await request;

  if (customerError) {
    await admin.auth.admin.deleteUser(authUser.user.id);
    return { ok: false, message: `Không thể liên kết customer: ${customerError.message}` };
  }

  return {
    ok: true,
    message: `Đã tạo tài khoản cho ${maskPhone(parsed.data.phone)}. Mật khẩu mặc định là 12345678 và khách phải đổi khi đăng nhập lần đầu.`,
  };
}

export async function customerLoginAction(
  _previous: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const parsed = customerLoginSchema.safeParse({
    phone: readString(formData, "phone"),
    password: readString(formData, "password"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Thông tin đăng nhập chưa hợp lệ." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    phone: parsed.data.phone,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return { ok: false, message: "Đăng nhập không thành công. Vui lòng kiểm tra số điện thoại và mật khẩu." };
  }

  const admin = createAdminClient();
  const { data: customer } = await admin
    .from("customers")
    .select("id,must_change_password")
    .eq("auth_user_id", data.user.id)
    .maybeSingle();

  if (!customer) {
    await supabase.auth.signOut();
    return { ok: false, message: "Tài khoản chưa được liên kết với hồ sơ khách hàng." };
  }

  redirect(customer.must_change_password ? "/khach-hang/doi-mat-khau?required=1" : "/khach-hang");
}

export async function customerChangePasswordAction(
  _previous: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const customer = await requireCustomerAllowPasswordChange();
  const parsed = changePasswordSchema.safeParse({
    currentPassword: readString(formData, "currentPassword"),
    newPassword: readString(formData, "newPassword"),
    confirmPassword: readString(formData, "confirmPassword"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Mật khẩu chưa hợp lệ." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.newPassword });

  if (error) {
    return { ok: false, message: "Chưa thể đổi mật khẩu. Vui lòng đăng nhập lại rồi thử tiếp." };
  }

  const admin = createAdminClient();
  await admin
    .from("customers")
    .update({ must_change_password: false })
    .eq("id", customer.id);

  redirect("/khach-hang");
}

export async function updateCustomerProfileAction(
  _previous: CustomerActionState,
  formData: FormData,
): Promise<CustomerActionState> {
  const customer = await requireCustomer();
  const parsed = customerProfileSchema.safeParse({
    fullName: readString(formData, "fullName"),
    email: readString(formData, "email"),
    birthDate: readString(formData, "birthDate"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Thông tin cá nhân chưa hợp lệ." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("customers")
    .update({
      full_name: parsed.data.fullName,
      email: parsed.data.email || null,
      birth_date: parsed.data.birthDate || null,
    })
    .eq("id", customer.id);

  if (error) {
    return { ok: false, message: "Chưa thể cập nhật thông tin cá nhân." };
  }

  return { ok: true, message: "Đã cập nhật thông tin cá nhân." };
}

export async function customerSignOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/khach-hang/login");
}
