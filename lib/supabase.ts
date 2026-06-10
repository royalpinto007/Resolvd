import { createClient } from "@supabase/supabase-js";

// Server-only admin client. Resolvd owns the rv_* tables in the shared project.
export function db() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL / SERVICE_ROLE_KEY");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function checkInboundToken(token: string | null): boolean {
  const expected = process.env.RESOLVD_INBOUND_TOKEN;
  return !!expected && token === expected;
}
