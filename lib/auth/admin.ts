import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
type Profile = {
  id: string;
  full_name: string | null;
  role: "admin" | "staff" | "customer";
  is_active: boolean;
};

type AdminAccess =
  | { ok: true; profile: Profile }
  | {
      ok: false;
      reason:
        | "no-session"
        | "profile-query-error"
        | "profile-not-found"
        | "profile-inactive"
        | "profile-role";
      detail?: string;
    };

async function getAuthenticatedUserId() {
  const supabase = await createClient();
  const claimsResult = await supabase.auth.getClaims();

  if (claimsResult.data?.claims.sub) {
    return claimsResult.data.claims.sub;
  }

  const userResult = await supabase.auth.getUser();

  if (userResult.error || !userResult.data.user) {
    return null;
  }

  return userResult.data.user.id;
}

export async function getAdminProfile() {
  const access = await getAdminAccess();
  return access.ok ? access.profile : null;
}

export async function getAdminAccess(): Promise<AdminAccess> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return { ok: false, reason: "no-session" };
  }

  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from("profiles")
    .select("id,full_name,role,is_active")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return { ok: false, reason: "profile-query-error", detail: error.message };
  }

  if (!profile) {
    return { ok: false, reason: "profile-not-found", detail: userId };
  }

  if (!profile.is_active) {
    return { ok: false, reason: "profile-inactive" };
  }

  if (profile.role !== "admin" && profile.role !== "staff") {
    return { ok: false, reason: "profile-role", detail: profile.role };
  }

  return { ok: true, profile };
}

export async function requireAdminProfile() {
  const access = await getAdminAccess();

  if (!access.ok) {
    if (access.reason !== "no-session") {
      throw new Error("Bạn không có quyền truy cập khu vực quản trị.");
    }

    const params = new URLSearchParams({ reason: access.reason });
    if (access.detail) {
      params.set("detail", access.detail);
    }
    redirect(`/admin/login?${params.toString()}`);
  }

  return access.profile;
}

export async function requireOwnerAdmin() {
  const profile = await requireAdminProfile();

  if (profile.role !== "admin") {
    throw new Error("Chỉ quản trị viên mới được thực hiện thao tác này.");
  }

  return profile;
}
