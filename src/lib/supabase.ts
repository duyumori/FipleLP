import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;
let loading: Promise<SupabaseClient> | null = null;

/**
 * Created on first use so a missing env var only breaks the waitlist form,
 * not the whole page (createClient throws on an empty URL at import time).
 * The SDK is imported lazily too — it is only needed when the email is submitted,
 * so it stays out of the initial bundle.
 */
export async function getSupabase(): Promise<SupabaseClient> {
  if (client) return client;
  if (loading) return loading;
  loading = (async () => {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    if (!url || !key) {
      loading = null;
      throw new Error("Supabase is not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
    }
    const { createClient } = await import("@supabase/supabase-js");
    client = createClient(url, key);
    return client;
  })();
  return loading;
}
