import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const migrationPath = path.resolve(
  process.cwd(),
  "supabase/migrations/20260409183000_secure_public_investor_profile_rpc.sql"
);
const migrationSql = readFileSync(migrationPath, "utf8");

describe("public investor profile SQL contract", () => {
  it("adds a secure projection RPC and removes anon raw-table reads", () => {
    expect(migrationSql).toContain(
      "CREATE OR REPLACE FUNCTION public.get_public_investor_profile"
    );
    expect(migrationSql).toContain(
      "REVOKE SELECT ON public.investor_profiles FROM anon;"
    );
    expect(migrationSql).toContain(
      "REVOKE SELECT ON public.onboarding_data FROM anon;"
    );
    expect(migrationSql).toContain(
      "GRANT EXECUTE ON FUNCTION public.get_public_investor_profile(text) TO anon;"
    );
  });

  it("keeps sensitive onboarding fields out of the public payload projection", () => {
    expect(migrationSql).not.toContain("ssn_encrypted");
    expect(migrationSql).not.toContain("bank_account_number_encrypted");
    expect(migrationSql).not.toContain("gps_latitude");
    expect(migrationSql).not.toContain("nda_pdf_url");
    expect(migrationSql).not.toContain("'date_of_birth'");
  });
});
