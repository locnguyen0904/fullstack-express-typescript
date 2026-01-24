import 'reflect-metadata';
import { Service } from 'typedi';
import Example, { IExample } from './example.model';
import { Service as ServiceCore } from '@/core';
import CacheService from '@/services/cache.service';

@Service()
class ExampleService extends ServiceCore<IExample> {
  constructor(private cacheService: CacheService) {
    super(Example);
  }

  private async invalidateListCache() {
    await this.cacheService.delByPrefix('examples:list:');
  }

  async create(data: Partial<IExample>): Promise<IExample> {
    const created = await super.create(data);
    await this.invalidateListCache();
    return created;
  }

  async update(id: string, data: Partial<IExample>): Promise<IExample | null> {
    const updated = await super.update(id, data);
    await this.invalidateListCache();
    return updated;
  }

  async findAll(query: Record<string, unknown> = {}) {
    if (!this.cacheService.isEnabled()) {
      return super.findAll(query);
    }

    const cacheKey = `examples:list:${JSON.stringify(query)}`;
    const cached =
      await this.cacheService.get<
        Awaited<ReturnType<ServiceCore<IExample>['findAll']>>
      >(cacheKey);

    if (cached) {
      return cached;
    }

    const result = await super.findAll(query);
    await this.cacheService.set(cacheKey, result, 300);
    return result;
  }

  async remove(id: string): Promise<IExample | null> {
    const deleted = await super.remove(id);
    await this.invalidateListCache();
    return deleted;
  }

  async softDelete(id: string): Promise<IExample | null> {
    const deleted = await super.softDelete(id);
    await this.invalidateListCache();
    return deleted;
  }

  async restore(id: string): Promise<IExample | null> {
    const restored = await super.restore(id);
    await this.invalidateListCache();
    return restored;
  }
}

export default ExampleService;
