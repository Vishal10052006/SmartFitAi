import { createClient } from "@supabase/supabase-js";

let client = null;

export function getSupabaseBrowserClient() {
  if (!client) {
    client = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }
  return client;
}