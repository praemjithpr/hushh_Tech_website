import { createClient } from "@supabase/supabase-js";

const env = typeof import.meta !== "undefined" ? import.meta.env : {};
const supabaseUrl = env?.VITE_SUPABASE_URL?.trim?.() || "";
const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY?.trim?.() || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "[Config] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Set them in .env.local or your deployment environment."
  );
}

const config = {
  SUPABASE_URL: supabaseUrl,
  SUPABASE_ANON_KEY: supabaseAnonKey,
  guestModeAccessToken: env?.VITE_GUEST_MODE_ACCESS_TOKEN || "",
  redirect_url:
    env?.VITE_SUPABASE_REDIRECT_URL ||
    (typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "https://www.hushhtech.com/auth/callback"),
};

function createSupabaseClient() {
  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
    return undefined;
  }

  const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
  return supabase;
}

config.supabaseClient = createSupabaseClient();

export default config;
