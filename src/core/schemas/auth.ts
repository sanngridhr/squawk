import { z } from "zod";

/** Sign-in: an existing account may predate today's password rules. */
export const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Password is required"),
});

/** Sign-up: default for all new accounts */
export const signUpSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
