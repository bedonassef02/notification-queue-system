// src/infrastructure/queue/connection.ts
import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const REDIS_URL = process.env.UPSTASH_REDIS_URL || "redis://localhost:6379";

let redisConnection: IORedis | null = null;

export const getConnection = (): IORedis => {
  if (!redisConnection) {
    redisConnection = new IORedis(REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      tls: REDIS_URL.startsWith("rediss://") ? {} : undefined,
    });

    redisConnection.on("error", (err) => {
      console.error("Redis Connection Error:", err);
    });

    redisConnection.on("connect", () => {
      console.log("Redis Connected successfully");
    });

    redisConnection.on("disconnect", () => {
      console.log("Redis Disconnected");
    });
  }
  return redisConnection;
};

export const getRedis = (): IORedis => {
  return getConnection()
}

export const closeConnection = async (): Promise<void> => {
  if (redisConnection) {
    await redisConnection.quit()
    redisConnection = null
  }
}
