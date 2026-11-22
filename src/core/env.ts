import { z } from "zod";

const envSchema = z.object({
  VITE_AUTH0_DOMAIN: z.string().regex(z.regexes.domain),
  VITE_AUTH0_CLIENT_ID: z.string().length(32),
  VITE_SUPABASE_URL: z.httpUrl().endsWith(".supabase.co"),
  VITE_SUPABASE_PUB_KEY: z.string().length(46).startsWith("sb_publishable_"),
});

export type Env = z.infer<typeof envSchema>;
export const env: Env = envSchema.parse(import.meta.env);
