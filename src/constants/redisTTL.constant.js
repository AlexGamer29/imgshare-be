class RedisTTL {
  // Time constants in seconds
  static ONE_MINUTE = 60;
  static FIVE_MINUTES = 300;
  static TEN_MINUTES = 600;
  static THIRTY_MINUTES = 1800;
  static ONE_HOUR = 3600;
  static SIX_HOURS = 21600;
  static TWELVE_HOURS = 43200;
  static ONE_DAY = 86400;
  static ONE_WEEK = 604800;
  static ONE_MONTH = 2592000;

  // User related TTLs
  static USER_PROFILE = this.ONE_HOUR * 2; // 2 hours
  static USER_SESSION = this.ONE_DAY * 7; // 7 days
  static USER_SETTINGS = this.ONE_DAY; // 1 day
  static USER_FRIENDS = this.ONE_HOUR * 6; // 6 hours
  static USER_FEED = this.TEN_MINUTES; // 10 minutes

  // Image related TTLs
  static IMAGE_LIST_BY_OWNER_ID = this.FIVE_MINUTES; // 1 hour
  static IMAGE_COUNT_BY_OWNER_ID = this.FIVE_MINUTES; // 1 hour
  static IMAGE_METADATA = this.ONE_DAY; // 1 day
  static IMAGE_THUMBNAIL = this.ONE_WEEK; // 1 week
  static IMAGE_UPLOAD_STATUS = this.THIRTY_MINUTES; // 30 minutes
  static IMAGE_VIEWS = this.ONE_HOUR; // 1 hour

  // Feed related TTLs
  static FEED_GLOBAL = this.FIVE_MINUTES; // 5 minutes
  static FEED_USER_TIMELINE = this.TEN_MINUTES; // 10 minutes
  static FEED_TRENDING = this.THIRTY_MINUTES; // 30 minutes

  // System related TTLs
  static SYSTEM_CONFIG = this.ONE_DAY; // 1 day
  static API_RATE_LIMIT = this.ONE_HOUR; // 1 hour

  // Authentication related TTLs
  static AUTH_LOGIN_ATTEMPTS = this.THIRTY_MINUTES; // 30 minutes
  static AUTH_BLOCKED_IPS = this.ONE_HOUR; // 1 hour
  static AUTH_RESET_TOKENS = this.TEN_MINUTES; // 10 minutes

  // Helper methods
  static getCustomTTL(minutes) {
    return minutes * 60;
  }

  static getHoursTTL(hours) {
    return hours * this.ONE_HOUR;
  }

  static getDaysTTL(days) {
    return days * this.ONE_DAY;
  }
}

module.exports = RedisTTL;
