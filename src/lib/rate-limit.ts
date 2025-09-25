import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN 
  ? Redis.fromEnv() 
  : null;

export const submitRateLimit = redis ? new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
}) : null;

export const createProjectRateLimit = redis ? new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  analytics: true,
}) : null;

export const exportRateLimit = redis ? new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
}) : null;

export const uploadRateLimit = redis ? new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  analytics: true,
}) : null;

export async function checkRateLimit(
  identifier: string,
  rateLimiter: Ratelimit | null
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}> {
  if (!rateLimiter) {
    // If no rate limiter (e.g., Redis not configured), allow all requests
    return {
      success: true,
      limit: 1000,
      remaining: 999,
      reset: new Date(Date.now() + 60000), // 1 minute from now
    };
  }

  const { success, limit, remaining, reset } = await rateLimiter.limit(
    identifier
  );

  return {
    success,
    limit,
    remaining,
    reset: new Date(reset),
  };
}

