import { createClient } from "@supabase/supabase-js";

// Service-role client: bypasses RLS and can manage auth users directly
// (auth.admin.*). Server-only -- never import from a Client Component, and
// never let this key reach the browser bundle.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
