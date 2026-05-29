import { Redis } from "@upstash/redis";

let client: Redis | null | undefined;

function redisUrl(): string | undefined {
  return (
    process.env.KV_REST_API_URL?.trim() ||
    process.env.UPSTASH_REDIS_REST_URL?.trim()
  );
}

function redisToken(): string | undefined {
  return (
    process.env.KV_REST_API_TOKEN?.trim() ||
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  );
}

export function hasRedisStore(): boolean {
  return !!(redisUrl() && redisToken());
}

export function getRedis(): Redis | null {
  if (client !== undefined) return client;
  const url = redisUrl();
  const token = redisToken();
  if (!url || !token) {
    client = null;
    return null;
  }
  client = new Redis({ url, token });
  return client;
}
