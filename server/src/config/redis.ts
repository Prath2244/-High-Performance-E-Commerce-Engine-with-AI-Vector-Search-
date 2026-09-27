import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;
let isRedisEnabled = process.env.ENABLE_REDIS !== 'false';

export const getRedisClient = async () => {
  if (!isRedisEnabled) {
    return null;
  }
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });
    redisClient.on('error', (err) => {
      console.warn('⚠️ Redis error (caching disabled):', err.message);
      isRedisEnabled = false;
    });
    redisClient.on('connect', () => {
      console.log('✅ Redis connected');
    });
    await redisClient.connect().catch(() => {
      isRedisEnabled = false;
      redisClient = null;
    });
  }
  return redisClient;
};

export const closeRedisConnection = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};

export const isRedisHealthy = async (): Promise<boolean> => {
  if (!isRedisEnabled) return false;
  try {
    const client = await getRedisClient();
    if (!client) return false;
    await client.ping();
    return true;
  } catch {
    return false;
  }
};