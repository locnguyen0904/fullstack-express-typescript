import Redis from 'ioredis';
import { Service } from 'typedi';
import { config } from '@/config';
import logger from './logger.service';

@Service()
export default class RedisService {
  private client: Redis | null = null;

  get instance(): Redis | null {
    return this.client;
  }

  get isConnected(): boolean {
    return this.client?.status === 'ready';
  }

  async connect(): Promise<void> {
    if (!config.redis.url) {
      logger.warn('Redis URL not configured, skipping connection');
      return;
    }

    if (this.client) return;

    try {
      this.client = new Redis(config.redis.url, {
        maxRetriesPerRequest: 3,
        connectTimeout: 5000,
        retryStrategy: (times) =>
          times > 3 ? null : Math.min(times * 200, 2000),
        lazyConnect: true,
      });

      this.client.on('error', (err) =>
        logger.error('Redis error', { error: err.message })
      );
      this.client.on('close', () => logger.warn('Redis connection closed'));

      await this.client.connect();
      logger.info('Redis connected');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Redis connection failed', { error: message });
      this.client = null;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.client) return;

    try {
      await this.client.quit();
    } catch {
      this.client.disconnect();
    } finally {
      this.client = null;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;

    try {
      const value = await this.client!.get(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch (error) {
      logger.error('Redis get failed', { key, error });
      return null;
    }
  }

  async set(key: string, value: unknown, ttl = 300): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      await this.client!.set(key, JSON.stringify(value), 'EX', ttl);
      return true;
    } catch (error) {
      logger.error('Redis set failed', { key, error });
      return false;
    }
  }

  async del(...keys: string[]): Promise<boolean> {
    if (!this.isConnected || keys.length === 0) return false;

    try {
      await this.client!.del(...keys);
      return true;
    } catch (error) {
      logger.error('Redis del failed', { keys, error });
      return false;
    }
  }

  async delByPrefix(prefix: string): Promise<void> {
    if (!this.isConnected) return;

    try {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.client!.scan(
          cursor,
          'MATCH',
          `${prefix}*`,
          'COUNT',
          100
        );
        cursor = nextCursor;
        if (keys.length > 0) await this.client!.del(...keys);
      } while (cursor !== '0');
    } catch (error) {
      logger.error('Redis delByPrefix failed', { prefix, error });
    }
  }

  async incr(key: string): Promise<number> {
    if (!this.isConnected) return 0;

    try {
      return await this.client!.incr(key);
    } catch (error) {
      logger.error('Redis incr failed', { key, error });
      return 0;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    if (!this.isConnected) return false;

    try {
      await this.client!.expire(key, seconds);
      return true;
    } catch (error) {
      logger.error('Redis expire failed', { key, error });
      return false;
    }
  }
}
