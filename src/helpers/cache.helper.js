const redisService = require('../services/cache/redis.service');
const RedisKeys = require('../constants/redisKey.constant');
const RedisTTL = require('../constants/redisTTL.constant');

class CacheHelper {
  // Generic cache-aside pattern
  async getOrSet(key, fetchFunction, ttl = RedisTTL.ONE_HOUR) {
    try {
      // Try to get from cache first
      let data = await redisService.get(key);

      if (data !== null) {
        return data;
      }

      // If not in cache, fetch from source
      data = await fetchFunction();

      if (data !== null && data !== undefined) {
        // Store in cache for next time
        await redisService.set(key, data, ttl);
      }

      return data;
    } catch (error) {
      console.error(`Cache helper error for key ${key}:`, error);
      // Fallback to direct fetch
      return await fetchFunction();
    }
  }

  async invalidateCache(pattern) {
    return redisService.delByPattern(pattern);
  }

  // User-specific cache operations
  async getUserProfile(userId, fetchFunction) {
    const key = RedisKeys.getUserProfileKey(userId);
    return this.getOrSet(key, fetchFunction, RedisTTL.USER_PROFILE);
  }

  async setUserProfile(userId, userData) {
    const key = RedisKeys.getUserProfileKey(userId);
    return redisService.set(key, userData, RedisTTL.USER_PROFILE);
  }

  async invalidateUserProfile(userId) {
    const key = RedisKeys.getUserProfileKey(userId);
    return redisService.del(key);
  }

  // Image-specific cache operations
  async getImageMetadata(imageId, fetchFunction) {
    const key = RedisKeys.getImageMetadataKey(imageId);
    return this.getOrSet(key, fetchFunction, RedisTTL.IMAGE_METADATA);
  }

  async setImageMetadata(imageId, metadata) {
    const key = RedisKeys.getImageMetadataKey(imageId);
    return redisService.set(key, metadata, RedisTTL.IMAGE_METADATA);
  }

  // Rate limiting
  async checkRateLimit(
    userId,
    endpoint,
    limit = 100,
    window = RedisTTL.ONE_HOUR
  ) {
    const key = RedisKeys.getRateLimitKey(userId, endpoint);
    const current = await redisService.incr(key, window);

    return {
      allowed: current <= limit,
      current,
      limit,
      resetTime: window,
    };
  }

  // Cache statistics
  async getCacheStats() {
    if (!redisService.isEnabled()) {
      return { enabled: false };
    }

    try {
      const ping = await redisService.ping();

      return {
        enabled: true,
        connected: ping,
      };
    } catch (error) {
      return {
        enabled: true,
        connected: false,
        error: error.message,
      };
    }
  }
}

module.exports = new CacheHelper();
