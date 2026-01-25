import 'reflect-metadata';
import {
  FilterQuery,
  Model,
  UpdateQuery,
  QueryOptions,
  Document,
  ToObjectOptions,
  PaginateModelWithDeleted,
  SoftDeleteModel,
} from 'mongoose';

import { NotFoundError } from '@/core/response-error.core';

class Service<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  private toObject(doc: T | null, options?: ToObjectOptions): T | null {
    if (!doc) return null;
    const docWithToObject = doc as unknown as {
      toObject?: (options?: ToObjectOptions) => T;
    };
    return docWithToObject.toObject?.(options) ?? doc;
  }

  private isSoftDeleteModel(): this is this & {
    model: SoftDeleteModel<T>;
  } {
    return (
      'delete' in this.model &&
      typeof (this.model as SoftDeleteModel<T>).delete === 'function'
    );
  }

  private isPaginateModel(): this is this & {
    model: PaginateModelWithDeleted<T>;
  } {
    return (
      'paginate' in this.model &&
      typeof (this.model as PaginateModelWithDeleted<T>).paginate === 'function'
    );
  }

  async create(data: Partial<T>): Promise<T> {
    const created = await this.model.create(data);
    return this.toObject(created) as T;
  }

  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    const updated = await this.model
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    return this.toObject(updated);
  }

  async remove(id: string): Promise<T | null> {
    const deleted = await this.model.findByIdAndDelete(id).exec();
    return this.toObject(deleted);
  }

  async findOne(
    filter: FilterQuery<T>,
    options: QueryOptions = {}
  ): Promise<T | null> {
    const result = await this.model.findOne(filter, null, options).exec();
    return this.toObject(result);
  }

  async findById(id: string, options: QueryOptions = {}): Promise<T | null> {
    const result = await this.model.findById(id, null, options).exec();
    return this.toObject(result);
  }

  async findAll(query: Record<string, unknown> = {}) {
    const {
      page = 1,
      limit = 25,
      sort = '-createdAt',
      includeDeleted,
      ...filter
    } = query;

    if (!this.isPaginateModel()) {
      throw new Error('Model does not support pagination');
    }

    const shouldIncludeDeleted =
      includeDeleted === true || includeDeleted === 'true';

    const paginateOptions = {
      page: Number(page),
      limit: Number(limit),
      sort: sort as string,
      lean: true,
      ...(shouldIncludeDeleted ? { withDeleted: true } : {}),
    };

    return await this.model.paginate(filter as FilterQuery<T>, paginateOptions);
  }

  async softDelete(id: string): Promise<T | null> {
    if (!this.isSoftDeleteModel()) {
      throw new Error('Model does not support soft delete');
    }
    const result = await this.model.deleteById(id);
    if (!result) throw new NotFoundError('Document not found');
    return this.toObject(result);
  }

  async restore(id: string): Promise<T | null> {
    if (!this.isSoftDeleteModel()) {
      throw new Error('Model does not support soft delete');
    }
    const result = await this.model.restoreById(id);
    if (!result) throw new NotFoundError('Document not found');
    return this.toObject(result);
  }
}

export default Service;
