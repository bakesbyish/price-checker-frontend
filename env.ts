import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    REDIS_SYSTEM_URL: z.string().url(),
    REDIS_SYSTEM_TOKEN: z.string().min(1),
    ALGOLIA_INDEX_NAME: z.string().min(1),
    ALGOLIA_WRITE_KEY: z.string().min(1),
    ALGOLIA_ID: z.string().min(1),
    DOMAIN: z.string().min(1),
    POS_API_KEY_1: z.string().min(1),
    POS_API_KEY_2: z.string().min(1),
    POS_API_KEY_3: z.string().min(1),
    POS_API_KEY_4: z.string().min(1),
    POS_API_KEY_5: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_ALGOLIA_SEARCH_KEY: z.string().min(1),
    NEXT_PUBLIC_ALGOLIA_ID: z.string().min(1),
    NEXT_PUBLIC_ALGOLIA_INDEX_NAME: z.string().min(1),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_ALGOLIA_SEARCH_KEY: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY,
    NEXT_PUBLIC_ALGOLIA_ID: process.env.NEXT_PUBLIC_ALGOLIA_ID,
    NEXT_PUBLIC_ALGOLIA_INDEX_NAME: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME
  }
});
