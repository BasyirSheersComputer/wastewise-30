import Redis from 'ioredis';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

class CacheService {
  constructor() {
    this.redis = null;
    this.isConnected = false;
    this.connectionRetries = 0;
    this.maxRetries = 3;
    
    this.initializeRedis();
  }

  initializeRedis() {
    try {
      const redisUrl = process.env.REDIS_URL;
      
      if (!redisUrl) {
        logger.warn('Redis URL not provided, caching will be disabled');
        return;
      }

      this.redis = new Redis(redisUrl, {
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        commandTimeout: 5000
      });

      this.redis.on('connect', () => {
        logger.info('Redis connected successfully');
        this.isConnected = true;
        this.connectionRetries = 0;
      });

      this.redis.on('error', (error) => {
        logger.error('Redis connection error:', error);
        this.isConnected = false;
        this.handleConnectionError();
      });

      this.redis.on('close', () => {
        logger.warn('Redis connection closed');
        this.isConnected = false;
      });

      this.redis.on('reconnecting', () => {
        logger.info('Redis reconnecting...');
      });

    } catch (error) {
      logger.error('Failed to initialize Redis:', error);
    }
  }

  handleConnectionError() {
    this.connectionRetries++;
    if (this.connectionRetries <= this.maxRetries) {
      logger.info(`Retrying Redis connection (${this.connectionRetries}/${this.maxRetries})...`);
      setTimeout(() => {
        if (this.redis && !this.isConnected) {
          this.redis.connect().catch(error => {
            logger.error('Redis reconnection failed:', error);
          });
        }
      }, 5000 * this.connectionRetries);
    } else {
      logger.error('Max Redis connection retries reached, caching disabled');
    }
  }

  async get(key) {
    if (!this.redis || !this.isConnected) {
      return null;
    }

    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 3600) {
    if (!this.redis || !this.isConnected) {
      return false;
    }

    try {
      const serializedValue = JSON.stringify(value);
      if (ttlSeconds > 0) {
        await this.redis.setex(key, ttlSeconds, serializedValue);
      } else {
        await this.redis.set(key, serializedValue);
      }
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  async del(key) {
    if (!this.redis || !this.isConnected) {
      return false;
    }

    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  async exists(key) {
    if (!this.redis || !this.isConnected) {
      return false;
    }

    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  async expire(key, ttlSeconds) {
    if (!this.redis || !this.isConnected) {
      return false;
    }

    try {
      await this.redis.expire(key, ttlSeconds);
      return true;
    } catch (error) {
      logger.error(`Cache expire error for key ${key}:`, error);
      return false;
    }
  }

  async keys(pattern) {
    if (!this.redis || !this.isConnected) {
      return [];
    }

    try {
      return await this.redis.keys(pattern);
    } catch (error) {
      logger.error(`Cache keys error for pattern ${pattern}:`, error);
      return [];
    }
  }

  async flush() {
    if (!this.redis || !this.isConnected) {
      return false;
    }

    try {
      await this.redis.flushdb();
      logger.info('Cache flushed successfully');
      return true;
    } catch (error) {
      logger.error('Cache flush error:', error);
      return false;
    }
  }

  async getStats() {
    if (!this.redis || !this.isConnected) {
      return {
        connected: false,
        memory: null,
        keys: 0,
        info: null
      };
    }

    try {
      const [info, keys] = await Promise.all([
        this.redis.info('memory'),
        this.redis.dbsize()
      ]);

      return {
        connected: true,
        memory: info,
        keys: keys,
        info: {
          uptime: await this.redis.info('server').then(data => {
            const match = data.match(/uptime_in_seconds:(\d+)/);
            return match ? parseInt(match[1]) : null;
          }),
          version: await this.redis.info('server').then(data => {
            const match = data.match(/redis_version:([^\s]+)/);
            return match ? match[1] : null;
          })
        }
      };
    } catch (error) {
      logger.error('Cache stats error:', error);
      return {
        connected: false,
        error: error.message
      };
    }
  }

  // Cache wrapper functions for common use cases

  async cacheUserData(userId, data, ttlSeconds = 1800) {
    const key = `user:${userId}`;
    return await this.set(key, data, ttlSeconds);
  }

  async getUserData(userId) {
    const key = `user:${userId}`;
    return await this.get(key);
  }

  async cacheAnalytics(userId, section, data, ttlSeconds = 3600) {
    const key = `analytics:${userId}:${section}`;
    return await this.set(key, data, ttlSeconds);
  }

  async getAnalytics(userId, section) {
    const key = `analytics:${userId}:${section}`;
    return await this.get(key);
  }

  async cacheAIRecommendations(userId, section, provider, data, ttlSeconds = 1800) {
    const key = `ai:${userId}:${section}:${provider}`;
    return await this.set(key, data, ttlSeconds);
  }

  async getAIRecommendations(userId, section, provider) {
    const key = `ai:${userId}:${section}:${provider}`;
    return await this.get(key);
  }

  async cacheInventoryData(userId, outletId, data, ttlSeconds = 900) {
    const key = `inventory:${userId}${outletId ? `:${outletId}` : ''}`;
    return await this.set(key, data, ttlSeconds);
  }

  async getInventoryData(userId, outletId) {
    const key = `inventory:${userId}${outletId ? `:${outletId}` : ''}`;
    return await this.get(key);
  }

  async cacheWasteData(userId, outletId, data, ttlSeconds = 900) {
    const key = `waste:${userId}${outletId ? `:${outletId}` : ''}`;
    return await this.set(key, data, ttlSeconds);
  }

  async getWasteData(userId, outletId) {
    const key = `waste:${userId}${outletId ? `:${outletId}` : ''}`;
    return await this.get(key);
  }

  async cacheSupplierData(userId, data, ttlSeconds = 1800) {
    const key = `suppliers:${userId}`;
    return await this.set(key, data, ttlSeconds);
  }

  async getSupplierData(userId) {
    const key = `suppliers:${userId}`;
    return await this.get(key);
  }

  async cacheOutletData(userId, data, ttlSeconds = 1800) {
    const key = `outlets:${userId}`;
    return await this.set(key, data, ttlSeconds);
  }

  async getOutletData(userId) {
    const key = `outlets:${userId}`;
    return await this.get(key);
  }

  // Session management
  async cacheSession(sessionId, data, ttlSeconds = 86400) {
    const key = `session:${sessionId}`;
    return await this.set(key, data, ttlSeconds);
  }

  async getSession(sessionId) {
    const key = `session:${sessionId}`;
    return await this.get(key);
  }

  async deleteSession(sessionId) {
    const key = `session:${sessionId}`;
    return await this.del(key);
  }

  // Rate limiting
  async incrementRateLimit(key, ttlSeconds = 3600) {
    if (!this.redis || !this.isConnected) {
      return 1;
    }

    try {
      const current = await this.redis.incr(key);
      if (current === 1) {
        await this.redis.expire(key, ttlSeconds);
      }
      return current;
    } catch (error) {
      logger.error(`Rate limit increment error for key ${key}:`, error);
      return 1;
    }
  }

  async getRateLimit(key) {
    if (!this.redis || !this.isConnected) {
      return 0;
    }

    try {
      const current = await this.redis.get(key);
      return current ? parseInt(current) : 0;
    } catch (error) {
      logger.error(`Rate limit get error for key ${key}:`, error);
      return 0;
    }
  }

  // Cache invalidation patterns
  async invalidateUserCache(userId) {
    if (!this.redis || !this.isConnected) {
      return false;
    }

    try {
      const keys = await this.keys(`*:${userId}:*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return true;
    } catch (error) {
      logger.error(`Cache invalidation error for user ${userId}:`, error);
      return false;
    }
  }

  async invalidateAnalyticsCache(userId) {
    const patterns = [
      `analytics:${userId}:*`,
      `ai:${userId}:*`,
      `inventory:${userId}*`,
      `waste:${userId}*`,
      `suppliers:${userId}`,
      `outlets:${userId}`
    ];

    for (const pattern of patterns) {
      const keys = await this.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    }
  }

  // Health check
  async healthCheck() {
    if (!this.redis) {
      return {
        status: 'disabled',
        message: 'Redis not configured'
      };
    }

    if (!this.isConnected) {
      return {
        status: 'disconnected',
        message: 'Redis connection lost'
      };
    }

    try {
      await this.redis.ping();
      return {
        status: 'healthy',
        message: 'Redis connection healthy'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Redis health check failed: ${error.message}`
      };
    }
  }

  // Graceful shutdown
  async shutdown() {
    if (this.redis) {
      try {
        await this.redis.quit();
        logger.info('Redis connection closed gracefully');
      } catch (error) {
        logger.error('Error closing Redis connection:', error);
      }
    }
  }
}

// Create singleton instance
const cacheService = new CacheService();

// Graceful shutdown handling
process.on('SIGINT', async () => {
  await cacheService.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await cacheService.shutdown();
  process.exit(0);
});

export default cacheService;
