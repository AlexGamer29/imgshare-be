require('dotenv').config();

module.exports = {
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: process.env.REDIS_PORT || 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || null,
  REDIS_DB: process.env.REDIS_DB || 0,
  REDIS_TTL_DEFAULT: process.env.REDIS_TTL_DEFAULT || 3600,
  REDIS_ENABLED: process.env.REDIS_ENABLED === 'true',
  REDIS_CLUSTER_NODES: process.env.REDIS_CLUSTER_NODES
    ? process.env.REDIS_CLUSTER_NODES.split(',')
    : [],
  REDIS_RETRY_ATTEMPTS: 3,
  REDIS_RETRY_DELAY: 1000,
  REDIS_CONNECTION_TIMEOUT: 5000,
  REDIS_COMMAND_TIMEOUT: 3000,
};
