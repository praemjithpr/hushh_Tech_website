import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getOAuthRedirectUrl } from "../../utils/platform";

interface Config {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  redirect_url: string;
  supabaseClient?: SupabaseClient;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "[Config] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Set them in .env.local or your deployment environment."
  );
}

const config: Config = {
  SUPABASE_URL: supabaseUrl,
  SUPABASE_ANON_KEY: supabaseAnonKey,
  // Use platform-aware redirect URL for iOS Universal Links support
  redirect_url:
    import.meta.env.VITE_SUPABASE_REDIRECT_URL || getOAuthRedirectUrl(),
};

function createSupabaseClient() {
  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
    return undefined;
  }

  const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
  return supabase;
}

config.supabaseClient = createSupabaseClient();

export default config;
