import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/core/env";

export const supabase: SupabaseClient = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_PUB_KEY
);
