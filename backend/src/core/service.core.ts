import 'reflect-metadata';
import {
  FilterQuery,
  Model,
  PaginateModel,
  UpdateQuery,
  QueryOptions,
} from 'mongoose';

class Service<T> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    const created = await this.model.create(data);
    return created.toObject() as T;
  }

  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    const updated = await this.model
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    return updated ? (updated.toObject() as T) : null;
  }

  async remove(id: string): Promise<T | null> {
    const deleted = await this.model.findByIdAndDelete(id).exec();
    return deleted ? (deleted.toObject() as T) : null;
  }

  async findOne(
    filter: FilterQuery<T>,
    options: QueryOptions = {}
  ): Promise<T | null> {
    const result = await this.model.findOne(filter, null, options).exec();
    return result ? (result.toObject() as T) : null;
  }

  async findById(id: string, options: QueryOptions = {}): Promise<T | null> {
    const result = await this.model.findById(id, null, options).exec();
    return result ? (result.toObject() as T) : null;
  }

  async findAll(query: Record<string, unknown> = {}) {
    const { page = 1, limit = 25, sort = '-createdAt', ...filter } = query;
    const paginateModel = this.model as unknown as PaginateModel<T>;
    return await paginateModel.paginate(filter as FilterQuery<T>, {
      page: Number(page),
      limit: Number(limit),
      sort: sort as string,
    });
  }
}

export default Service;
