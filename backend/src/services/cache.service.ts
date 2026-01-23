import Redis from 'ioredis';
import { Service } from 'typedi';
import { config } from '@/config';
import logger from './logger.service';

@Service()
export default class CacheService {
  private client?: Redis;
  private enabled: boolean;

  constructor() {
    const redisUrl = config.redis.url;

    if (!redisUrl) {
      this.enabled = false;
      return;
    }

    this.enabled = true;
    this.client = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: null,
    });

    this.client.on('error', (error: unknown) => {
      logger.error('Redis error', { error });
    });

    this.client.on('connect', () => {
      logger.info('Redis connected');
    });
  }

  isEnabled() {
    return this.enabled;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.enabled || !this.client) return null;
    const value = await this.client.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    if (!this.enabled || !this.client) return;
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async del(...keys: string[]): Promise<void> {
    if (!this.enabled || !this.client) return;
    await this.client.del(...keys);
  }

  async delByPrefix(prefix: string): Promise<void> {
    if (!this.enabled || !this.client) return;
    const keys = await this.client.keys(`${prefix}*`);
    if (keys.length === 0) return;
    await this.client.del(...keys);
  }
}
