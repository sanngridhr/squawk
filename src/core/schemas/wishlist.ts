import z from "zod";

export const wishSchema = z.object({
  id: z.int64(),
  createdAt: z.iso.datetime(),
  name: z.string(),
  gifted: z.boolean(),
  gifter: z.string().nullable(),
});
export type Wish = z.infer<typeof wishSchema>;
