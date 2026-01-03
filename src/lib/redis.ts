import { createClient, type RedisClientType } from 'redis';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

let redisClient: RedisClientType | null = null;
let redisConnecting: Promise<RedisClientType | null> | null = null;

export async function getRedisClient(): Promise<RedisClientType | null> {
  if (!env.REDIS_URL) {
    return null;
  }

  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  if (!redisConnecting) {
    const client = createClient({ url: env.REDIS_URL });
    client.on('error', (error) => {
      logger.error('Redis client error', error);
    });

    redisConnecting = client
      .connect()
      .then(() => {
        redisClient = client;
        return client;
      })
      .catch((error) => {
        logger.error('Redis connection failed', error);
        redisClient = null;
        return null;
      });
  }

  return redisConnecting;
}
