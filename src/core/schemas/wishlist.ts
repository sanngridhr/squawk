import z from "zod";

// Mirrors the live `wishes` table (snake_case). `id` is a large random
// bigint, so it is selected as `id::text`: as a JSON number it would lose
// precision above 2^53 and break `.eq("id", …)` filters.
export const wishSchema = z.object({
  id: z.string(),
  created_at: z.iso.datetime({ offset: true }),
  updated_at: z.iso.datetime({ offset: true }),
  user_id: z.uuidv4(),
  name: z.string(),
  gifted: z.boolean(),
  gifter: z.string().nullable(),
});
export type Wish = z.infer<typeof wishSchema>;

/** What the create-wish form submits. */
export const createWishSchema = z.object({
  name: z.string().trim().min(1, "Give your wish a name"),
});

/** What the per-row edit form submits; `gifted` comes from a checkbox. */
export const updateWishSchema = z.object({
  name: z.string().trim().min(1, "Name cannot be empty"),
  gifter: z.string().trim(),
  gifted: z.boolean(),
});
