const Redis = require('ioredis');
const redisConfig = require('../../config/redis/index');
const RedisTTL = require('../../constants/redisTTL.constant');

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxRetries = redisConfig.REDIS_RETRY_ATTEMPTS;

    if (redisConfig.REDIS_ENABLED) {
      this.connect();
    }
  }

  async connect() {
    try {
      const options = {
        host: redisConfig.REDIS_HOST,
        port: redisConfig.REDIS_PORT,
        db: redisConfig.REDIS_DB,
        connectTimeout: redisConfig.REDIS_CONNECTION_TIMEOUT,
        commandTimeout: redisConfig.REDIS_COMMAND_TIMEOUT,
        retryDelayOnFailover: redisConfig.REDIS_RETRY_DELAY,
        maxRetriesPerRequest: this.maxRetries,
        lazyConnect: true,
      };

      if (redisConfig.REDIS_PASSWORD) {
        options.password = redisConfig.REDIS_PASSWORD;
      }

      this.client = new Redis(options);
      this.setupEventHandlers();
      await this.client.connect();
    } catch (error) {
      console.error('Redis connection failed:', error);
      this.handleConnectionError(error);
    }
  }

  setupEventHandlers() {
    this.client.on('connect', () => {
      console.log('✅ Redis connected successfully');
      this.isConnected = true;
      this.connectionAttempts = 0;
    });

    this.client.on('error', error => {
      console.error('⚠️ Redis error:', error);
      this.isConnected = false;
      this.handleConnectionError(error);
    });

    this.client.on('close', () => {
      console.warn('🪓 Redis connection closed');
      this.isConnected = false;
    });

    this.client.on('reconnecting', delay => {
      console.log(`Redis reconnecting in ${delay}ms`);
    });
  }

  handleConnectionError(error) {
    this.connectionAttempts++;

    if (this.connectionAttempts >= this.maxRetries) {
      console.error('Max Redis connection attempts reached. Disabling Redis.');
      this.isConnected = false;
      return;
    }

    setTimeout(() => {
      console.log(
        `Retrying Redis connection (attempt ${this.connectionAttempts}/${this.maxRetries})`
      );
      this.connect();
    }, redisConfig.REDIS_RETRY_DELAY * this.connectionAttempts);
  }

  // Basic Redis operations with error handling
  async get(key) {
    if (!this.isEnabled()) return null;

    try {
      const result = await this.client.get(key);
      if (result) {
        return JSON.parse(result);
      }
      return null;
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  async set(key, value, ttl = RedisTTL.ONE_HOUR) {
    if (!this.isEnabled()) return false;

    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
      return true;
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  }

  async del(key) {
    if (!this.isEnabled()) return false;

    try {
      console.log(`Deleting key: ${key}`);
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error(`Redis DEL error for key ${key}:`, error);
      return false;
    }
  }
  
  async delByPattern(pattern) {
    if (!this.isEnabled()) return false;

    try {
      console.log(`Finding keys matching pattern: ${pattern}`);
      
      let cursor = '0';
      let deletedCount = 0;
      
      do {
        // Scan for keys matching the pattern
        const result = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = result[0];
        const keys = result[1];
        
        if (keys.length > 0) {
          const deleted = await this.client.del(...keys);
          deletedCount += deleted;
          console.log(`Deleted ${deleted} keys in this batch`);
        }
      } while (cursor !== '0');
      
      console.log(`Total deleted: ${deletedCount} keys`);
      return true;
    } catch (error) {
      console.error(`Redis DEL by pattern error for ${pattern}:`, error);
      return false;
    }
  }

  async exists(key) {
    if (!this.isEnabled()) return false;

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  async incr(key, ttl = null) {
    if (!this.isEnabled()) return 0;

    try {
      const result = await this.client.incr(key);

      if (ttl && result === 1) {
        await this.client.expire(key, ttl);
      }

      return result;
    } catch (error) {
      console.error(`Redis INCR error for key ${key}:`, error);
      return 0;
    }
  }

  // Utility methods
  isEnabled() {
    return redisConfig.REDIS_ENABLED && this.isConnected && this.client;
  }

  async ping() {
    if (!this.isEnabled()) return false;

    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis PING error:', error);
      return false;
    }
  }

  async flushdb() {
    if (!this.isEnabled()) return false;

    try {
      await this.client.flushdb();
      return true;
    } catch (error) {
      console.error('Redis FLUSHDB error:', error);
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      try {
        await this.client.disconnect();
        this.isConnected = false;
        console.log('Redis disconnected successfully');
      } catch (error) {
        console.error('Redis disconnect error:', error);
      }
    }
  }
}

// Export singleton instance
module.exports = new RedisService();
