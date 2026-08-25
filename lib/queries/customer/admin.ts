import { createAdminClient } from "@/lib/supabase/admin";
import { maskPhone } from "@/lib/format/privacy";

export async function getAdminCustomers() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("customers")
    .select("id,full_name,phone,auth_user_id,must_change_password,created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Không thể tải khách hàng: ${error.message}`);
  }

  return data.map((customer) => ({
    ...customer,
    masked_phone: maskPhone(customer.phone),
    has_account: Boolean(customer.auth_user_id),
  }));
}
