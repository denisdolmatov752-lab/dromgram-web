const { createClient } = require('redis');
const logger = require('./logger');

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        logger.error('Redis: too many reconnect attempts');
        return new Error('Too many reconnect attempts');
      }
      return Math.min(retries * 100, 3000);
    }
  }
});

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.error('Redis error:', err));
redis.on('reconnecting', () => logger.warn('Redis reconnecting...'));

module.exports = { redis };
