import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/core/env";

export const supabase: SupabaseClient = createClient(env.VITE_SB_URL, env.VITE_SB_PUB_KEY);
