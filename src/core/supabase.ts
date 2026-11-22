import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/core/env";
import { auth0Client } from "./auth0";

export const supabase: SupabaseClient = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_PUB_KEY,
  {
    accessToken: async () => (await auth0Client.getTokenSilently() ?? null)
  }
);
