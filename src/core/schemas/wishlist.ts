import z from "zod";

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

export const createWishSchema = z.object({
  name: z.string().trim().min(1, "Give your wish a name."),
});

const updateWishBaseFields = {
  name: z.string().trim().min(1, "Name cannot be empty."),
}

const updateWishGiftedSchema = z.object({
  ...updateWishBaseFields,
  gifted: z.literal(true),
  gifter: z.string().nullable()
})

const updateWishUngiftedSchema = z.object({
  ...updateWishBaseFields,
  gifted: z.literal(false),
  gifter: z.null("Ungifted wishes cannot have gifters.")
})

export const updateWishSchema = z.discriminatedUnion("gifted", [
  updateWishGiftedSchema, updateWishUngiftedSchema
])