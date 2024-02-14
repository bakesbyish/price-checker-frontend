import { z } from "zod";

export const ZodLocation = z.object({
  quantity: z.number().or(z.string()),
})

export type Location = z.infer<typeof ZodLocation>

export const ZodItem = z.object({
  item_id: z.number(),
  product_id: z.string().nullish().nullable(),
  name: z.string(),
  description: z.string(),
  cost_price: z.string(),
  unit_price: z.string(),
  locations: z.object({
    "1": ZodLocation
  }),
  unit_variations: z.array(z.unknown())
})

export type Item = z.infer<typeof ZodItem>;
