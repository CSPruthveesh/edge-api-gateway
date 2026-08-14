import { Redis, RedisOptions } from 'ioredis';
import envConfig from './env.config.js';
import logger from '../utils/logger.js';

const redisOptions: RedisOptions = {
  enableOfflineQueue: false, // Fail fast if Redis is down to prevent queuing latency spikes
  maxRetriesPerRequest: 3,
  retryStrategy(times: number) {
    const delay = Math.min(times * 100, 3000);
    logger.warn({ times, delayMs: delay }, 'Redis client attempting reconnection...');
    return delay;
  },
  reconnectOnError(err) {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  }
};

let redisClient: Redis;

try {
  redisClient = new Redis(envConfig.REDIS_URL, redisOptions);

  redisClient.on('connect', () => {
    logger.info({ redisUrl: envConfig.REDIS_URL }, 'Redis client connected successfully');
  });

  redisClient.on('ready', () => {
    logger.info('Redis client ready to receive commands');
  });

  redisClient.on('error', (err) => {
    logger.error({ err: err.message }, 'Redis client encountered connection error');
  });

  redisClient.on('end', () => {
    logger.warn('Redis client connection ended');
  });
} catch (error) {
  logger.error({ error }, 'Failed to initialize Redis client');
  redisClient = new Redis(envConfig.REDIS_URL, redisOptions);
}

export { redisClient };
export default redisClient;
