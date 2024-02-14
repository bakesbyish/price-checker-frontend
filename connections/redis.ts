import { Redis } from "@upstash/redis";
import { env } from "~/env";

export const system = new Redis({
  url: env.REDIS_SYSTEM_URL,
  token: env.REDIS_SYSTEM_TOKEN,
});
