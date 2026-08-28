import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { HeaderViewer } from "@/types/header";

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

export async function getHeaderViewer(): Promise<HeaderViewer> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return { kind: "guest" };
  }

  try {
    const admin = createAdminClient();
    const [profileResult, customerResult] = await Promise.all([
      admin
        .from("profiles")
        .select("full_name,role,is_active")
        .eq("id", userId)
        .maybeSingle(),
      admin
        .from("customers")
        .select("full_name,is_active")
        .eq("auth_user_id", userId)
        .maybeSingle(),
    ]);

    const profile = profileResult.data;
    if (
      profile?.is_active &&
      (profile.role === "admin" || profile.role === "staff")
    ) {
      return {
        kind: "staff",
        name: profile.full_name ?? "Quản trị",
        role: profile.role,
      };
    }

    const customer = customerResult.data;
    if (customer?.is_active) {
      return { kind: "customer", name: customer.full_name };
    }
  } catch {
    return { kind: "guest" };
  }

  return { kind: "guest" };
}
