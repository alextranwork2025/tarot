import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type CustomerAccess =
  | {
      ok: true;
      customer: {
        id: string;
        auth_user_id: string | null;
        full_name: string;
        phone: string;
        email: string | null;
        date_of_birth: string | null;
        must_change_password: boolean;
      };
    }
  | {
      ok: false;
      reason: "no-session" | "customer-not-found" | "query-error";
      detail?: string;
    };

async function getAuthenticatedUserId() {
  const supabase = await createClient();
  const claimsResult = await supabase.auth.getClaims();

  if (claimsResult.data?.claims.sub) {
    return claimsResult.data.claims.sub;
  }

  const userResult = await supabase.auth.getUser();
  return userResult.data.user?.id ?? null;
}

export async function getCustomerAccess(): Promise<CustomerAccess> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return { ok: false, reason: "no-session" };
  }

  const admin = createAdminClient();
  const { data: customer, error } = await admin
    .from("customers")
    .select("id,auth_user_id,full_name,phone,email,date_of_birth,must_change_password")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (error) {
    return { ok: false, reason: "query-error", detail: error.message };
  }

  if (!customer) {
    return { ok: false, reason: "customer-not-found", detail: userId };
  }

  return { ok: true, customer };
}

export async function requireCustomer() {
  const access = await getCustomerAccess();

  if (!access.ok) {
    const params = new URLSearchParams({ reason: access.reason });
    if (access.detail) {
      params.set("detail", access.detail);
    }
    redirect(`/khach-hang/login?${params.toString()}`);
  }

  if (access.customer.must_change_password) {
    redirect("/khach-hang/doi-mat-khau?required=1");
  }

  return access.customer;
}

export async function requireCustomerAllowPasswordChange() {
  const access = await getCustomerAccess();

  if (!access.ok) {
    redirect("/khach-hang/login");
  }

  return access.customer;
}
