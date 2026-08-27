import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("client bundle boundaries", () => {
  it("does not expose the Supabase secret key in browser client code", () => {
    const clientSource = readFileSync(join(process.cwd(), "lib/supabase/client.ts"), "utf8");
    expect(clientSource).not.toContain("SUPABASE_SECRET_KEY");
  });

  it("keeps admin client server-only", () => {
    const adminSource = readFileSync(join(process.cwd(), "lib/supabase/admin.ts"), "utf8");
    expect(adminSource).toContain('import "server-only"');
  });

  it("keeps appointment status RPC restricted to service role", () => {
    const migration = readFileSync(
      join(process.cwd(), "supabase/migrations/20260827000000_add_admin_appointment_status_rpc.sql"),
      "utf8",
    );

    expect(migration).toContain("security definer");
    expect(migration).toContain("for update");
    expect(migration).toContain("revoke all on function public.admin_change_appointment_status");
    expect(migration).toContain("from public, anon, authenticated");
    expect(migration).toContain("grant execute on function public.admin_change_appointment_status");
    expect(migration).toContain("to service_role");
    expect(migration).toContain("insert into public.appointment_status_history");
  });

  it("does not send inactive or wrong-role admin users back through login", () => {
    const guardSource = readFileSync(join(process.cwd(), "lib/auth/admin.ts"), "utf8");
    expect(guardSource).toContain('if (access.reason !== "no-session")');
    expect(guardSource).toContain("Bạn không có quyền truy cập khu vực quản trị.");
    expect(guardSource).toContain("redirect(`/admin/login?");
  });
});
