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
});
