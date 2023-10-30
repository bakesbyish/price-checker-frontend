import { Redis } from "@upstash/redis";

export const system = new Redis({
  url: process.env.REDIS_SYSTEM_URL,
  token: process.env.REDIS_SYSTEM_TOKEN,
});
