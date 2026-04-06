/**
 * supabaseClient.ts
 * ─────────────────────────────────────────────────────────────────────
 * Lazy Supabase client for the Resort Dashboard.
 *
 * createClient() is NEVER called at module-evaluation time.
 * It is only instantiated on the first call to getSupabase(), which
 * only happens inside async functions (useEffect / server actions).
 * This prevents SSR prerender crashes when .env.local is absent.
 *
 * Usage (via db.ts helpers — preferred):
 *   import { fetchMenuItems } from "@/lib/db";
 *
 * Direct usage:
 *   import { getSupabase, isSupabaseConfigured } from "@/lib/supabaseClient";
 *   if (isSupabaseConfigured) {
 *     const { data } = await getSupabase()!.from("rooms").select("*");
 *   }
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Read at module load (safe — no network call, just process.env access).
const _url = process.env.NEXT_PUBLIC_SUPABASE_URL     ?? "";
const _key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * True when both required env vars are present and the URL looks valid.
 * All db.ts helpers check this before attempting any query.
 */
export const isSupabaseConfigured: boolean =
  _url.startsWith("http") && _key.length > 0;

// ── Lazy singleton ────────────────────────────────────────────────────
let _client: SupabaseClient | null = null;

/**
 * Returns the shared Supabase SupabaseClient, or null when not configured.
 * First call creates the instance; subsequent calls return the cached one.
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (_client) return _client;

  try {
    _client = createClient(_url, _key, {
      auth: {
        // The dashboard manages its own AuthContext — disable Supabase's
        // built-in session handling to avoid localStorage conflicts.
        persistSession:   false,
        autoRefreshToken: false,
      },
    });
  } catch (err) {
    console.warn("[supabase] createClient failed:", err);
    return null;
  }

  return _client;
}
