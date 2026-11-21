import { z } from "zod";

const envSchema = z.object({
  VITE_SB_URL: z.url(),
  VITE_SB_PUB_KEY: z.string().length(47).startsWith("sb_publishable_"),
});

export type Env = z.infer<typeof envSchema>;
export const env: Env = envSchema.parse(import.meta.env);
