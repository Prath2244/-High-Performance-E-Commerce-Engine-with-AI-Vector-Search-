import { Request, Response, NextFunction } from 'express';
import { getRedisClient, isRedisHealthy } from '../config/redis';
import { getCacheTTL } from '../utils/cacheKeys';

export const cacheMiddleware = (keyPrefix: string, ttl?: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip if Redis is disabled or unhealthy
    const healthy = await isRedisHealthy();
    if (!healthy) {
      return next();
    }

    try {
      const client = await getRedisClient();
      if (!client) {
        return next();
      }

      const key = `${keyPrefix}:${req.originalUrl || req.url}`;
      const cachedData = await client.get(key);

      if (cachedData) {
        const data = JSON.parse(cachedData);
        res.locals.cacheHit = true;
        return res.status(200).json({
          success: true,
          fromCache: true,
          data,
          timestamp: new Date().toISOString()
        });
      }

      const originalJson = res.json.bind(res);
      res.json = function(body: any) {
        if (res.statusCode === 200 && body?.success !== false) {
          const ttlValue = ttl || getCacheTTL();
          const dataToCache = body?.data || body;
          client.setEx(key, ttlValue, JSON.stringify(dataToCache))
            .catch(() => {});
        }
        return originalJson(body);
      };
      next();
    } catch (error) {
      next();
    }
  };
};

// Single pattern invalidation
export const invalidateCache = async (pattern: string): Promise<void> => {
  try {
    const client = await getRedisClient();
    if (!client) return;
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (error) {
    // silently fail
  }
};

// Multiple pattern invalidation (used in productController)
export const invalidateMultipleCache = async (patterns: string[]): Promise<void> => {
  for (const pattern of patterns) {
    await invalidateCache(pattern);
  }
};