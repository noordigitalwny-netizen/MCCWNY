import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseJSClient } from "@supabase/supabase-js";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  // Fallback instance if environment variables are not yet configured by user
  return createSupabaseJSClient(supabaseUrl, supabaseAnonKey);
}
