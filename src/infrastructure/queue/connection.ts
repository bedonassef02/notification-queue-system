// src/infrastructure/queue/connection.ts
import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const REDIS_URL = process.env.UPSTASH_REDIS_URL || "redis://localhost:6379";

// Singleton connection optimized for serverless/managed environments
let redisConnection: IORedis | null = null;

export const getConnection = (): IORedis => {
  if (!redisConnection) {
    redisConnection = new IORedis(REDIS_URL, {
      maxRetriesPerRequest: null, // Critical requirement for BullMQ
      enableReadyCheck: false, // Optimizes connection speed in ephemeral serverless contexts
      tls: REDIS_URL.startsWith("rediss://") ? {} : undefined,
    });

    redisConnection.on("error", (err) => {
      console.error("Redis Connection Error:", err);
    });
  }
  return redisConnection;
};
