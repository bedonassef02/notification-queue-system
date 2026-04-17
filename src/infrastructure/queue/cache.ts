// src/infrastructure/queue/cache.ts
import { getRedis } from './connection'
import { logger } from '@/shared/utils/logger'

export interface CacheOptions {
  ttl?: number // Time to live in seconds
  compress?: boolean
}

export class RedisCache {
  private static DEFAULT_TTL = 300 // 5 minutes
  private static DEFAULT_COMPRESS = false

  static async get<T>(key: string): Promise<T | null> {
    try {
      const redis = getRedis()
      const data = await redis.get(key)

      if (!data) {
        return null
      }

      const parsed = JSON.parse(data) as T

      await logger.trackPerformance(
        `RedisCache.get(${key})`,
        async () => parsed
      )

      return parsed
    } catch (error) {
      logger.error(`Redis get error for key ${key}`, error)
      return null
    }
  }

  static async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
      const redis = getRedis()
      const ttl = options?.ttl || RedisCache.DEFAULT_TTL
      const serialized = JSON.stringify(value)

      await logger.trackPerformance(
        `RedisCache.set(${key})`,
        async () => {
          redis.setex(key, ttl, serialized)
        }
      )

      logger.debug(`Cache set for key ${key} with TTL ${ttl}s`)
    } catch (error) {
      logger.error(`Redis set error for key ${key}`, error)
      throw error
    }
  }

  static async delete(key: string): Promise<void> {
    try {
      const redis = getRedis()
      await redis.del(key)
      logger.debug(`Cache deleted for key ${key}`)
    } catch (error) {
      logger.error(`Redis delete error for key ${key}`, error)
      throw error
    }
  }

  static async deletePattern(pattern: string): Promise<void> {
    try {
      const redis = getRedis()
      const keys = await redis.keys(pattern)

      if (keys.length > 0) {
        await redis.del(...keys)
        logger.debug(`Deleted ${keys.length} cache entries matching pattern ${pattern}`)
      }
    } catch (error) {
      logger.error(`Redis delete pattern error for ${pattern}`, error)
      throw error
    }
  }

  static async exists(key: string): Promise<boolean> {
    try {
      const redis = getRedis()
      const exists = await redis.exists(key)
      return exists === 1
    } catch (error) {
      logger.error(`Redis exists check error for key ${key}`, error)
      return false
    }
  }

  static async clear(): Promise<void> {
    try {
      const redis = getRedis()
      await redis.flushdb()
      logger.info('Redis cache cleared')
    } catch (error) {
      logger.error('Redis cache clear error', error)
      throw error
    }
  }

  static async getStats(): Promise<{
    totalKeys: number
    usedMemory: string
    ttlStats: Array<{ key: string; ttl: number | null }>
  }> {
    try {
      const redis = getRedis()
      const info = await redis.info('stats')
      const usedMemory = (info.match(/used_memory_human:(.*)/) || [])[1]

      const keys = await redis.keys('*')
      const ttls = await Promise.all(
        keys.slice(0, 10).map(async key => ({
          key,
          ttl: await redis.ttl(key)
        }))
      )

      return {
        totalKeys: keys.length,
        usedMemory,
        ttlStats: ttls
      }
    } catch (error) {
      logger.error('Redis get stats error', error)
      throw error
    }
  }

  static generateKey(prefix: string, ...parts: string[]): string {
    return [prefix, ...parts].join(':')
  }
}

export const cache = new RedisCache()