import Redis from 'ioredis';
import { config } from './config';
import { logger } from './logger';

export const redis = new Redis(config.redisUrl, {
  lazyConnect: true,
  enableReadyCheck: false,
  maxRetriesPerRequest: 1,
  connectTimeout: 3000,
  retryStrategy(times) {
    if (times > 3) {
      logger.warn('Redis unavailable — caching disabled');
      return null; // stop retrying
    }
    const delay = Math.min(times * 200, 2000);
    logger.warn({ times, delay }, 'Redis connection retry');
    return delay;
  },
  reconnectOnError(err) {
    const targetErrors = ['READONLY', 'ECONNRESET'];
    if (targetErrors.some((e) => err.message.includes(e))) {
      return true;
    }
    return false;
  },
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('error', (err: Error) => {
  logger.error({ err }, 'Redis error');
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

/**
 * Get a cached value by key. Returns null if not found.
 */
export async function cacheGet(key: string): Promise<string | null> {
  try {
    return await redis.get(key);
  } catch (err) {
    logger.error({ err, key }, 'cacheGet error');
    return null;
  }
}

/**
 * Set a cached value with an optional TTL in seconds.
 */
export async function cacheSet(
  key: string,
  value: string,
  ttlSeconds?: number
): Promise<void> {
  try {
    if (ttlSeconds !== undefined) {
      await redis.set(key, value, 'EX', ttlSeconds);
    } else {
      await redis.set(key, value);
    }
  } catch (err) {
    logger.error({ err, key }, 'cacheSet error');
  }
}

/**
 * Delete a cached value by key.
 */
export async function cacheDelete(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (err) {
    logger.error({ err, key }, 'cacheDelete error');
  }
}
