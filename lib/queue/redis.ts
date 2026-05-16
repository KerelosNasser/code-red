import Redis from "ioredis";

// Use a singleton for Redis connection
const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis = globalForRedis.redis ?? new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
