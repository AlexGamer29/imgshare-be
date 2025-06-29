class RedisKeys {
  // User related keys
  static USER_PROFILE = 'user:profile';
  static USER_SESSION = 'user:session';
  static USER_TOKENS = 'user:tokens';
  static USER_SETTINGS = 'user:settings';
  static USER_FRIENDS = 'user:friends';
  static USER_FEED = 'user:feed';
  
  // Image related keys
  static IMAGE_LIST_BY_OWNER_ID = 'image:%s:%s:%s:list_owner';
  static IMAGE_COUNT_BY_OWNER_ID = 'image:%s:count';
  static IMAGE_METADATA = 'image:metadata';
  static IMAGE_THUMBNAIL = 'image:thumbnail';
  static IMAGE_UPLOAD_STATUS = 'image:upload:status';
  static IMAGE_VIEWS = 'image:views';
  static IMAGE_LIKES = 'image:likes';
  
  // Feed related keys
  static FEED_GLOBAL = 'feed:global';
  static FEED_USER_TIMELINE = 'feed:user:timeline';
  static FEED_TRENDING = 'feed:trending';
  
  // System related keys
  static SYSTEM_CONFIG = 'system:config';
  static SYSTEM_MAINTENANCE = 'system:maintenance';
  static API_RATE_LIMIT = 'api:rate:limit';
  
  // Authentication related keys
  static AUTH_LOGIN_ATTEMPTS = 'auth:login:attempts';
  static AUTH_BLOCKED_IPS = 'auth:blocked:ips';
  static AUTH_RESET_TOKENS = 'auth:reset:tokens';
  
  // Static helper methods for building composite keys
  static buildKey(prefix, ...parts) {
    let i = 0;
    return prefix.replace(/%s/g, () => {
      const val = parts[i++];
      return val !== null && val !== undefined ? val : '';
    });
  }

  static getImagesByOwnerIdKey(ownerId, start, limit) {
    return this.buildKey(this.IMAGE_LIST_BY_OWNER_ID, ownerId, start, limit);
  }

  static getCountImagesByOwnerIdKey(ownerId) {
    return this.buildKey(this.IMAGE_COUNT_BY_OWNER_ID, ownerId);
  }

  static getUserProfileKey(email) {
    return this.buildKey(this.USER_PROFILE, email);
  }
  
  static getUserSessionKey(userId, sessionId) {
    return this.buildKey(this.USER_SESSION, userId, sessionId);
  }
  
  static getImageMetadataKey(imageId) {
    return this.buildKey(this.IMAGE_METADATA, imageId);
  }
  
  static getUserFeedKey(userId, page = 1) {
    return this.buildKey(this.USER_FEED, userId, 'page', page);
  }
  
  static getImageThumbnailKey(imageId, size = 'medium') {
    return this.buildKey(this.IMAGE_THUMBNAIL, imageId, size);
  }
  
  static getRateLimitKey(userId, endpoint) {
    return this.buildKey(this.API_RATE_LIMIT, userId, endpoint);
  }
}

module.exports = RedisKeys;