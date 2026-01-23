import { Schema, Aggregate } from 'mongoose';

declare module 'mongoose-aggregate-paginate-v2' {
  export interface AggregatePaginateOptions {
    page?: number;
    limit?: number;
    offset?: number;
    customLabels?: Record<string, string>;
    pagination?: boolean;
    allowDiskUse?: boolean;
    countQuery?: Record<string, unknown>;
  }

  export interface AggregatePaginateResult<T> {
    docs: T[];
    totalDocs: number;
    limit: number;
    page?: number;
    totalPages: number;
    nextPage?: number | null;
    prevPage?: number | null;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    meta?: Record<string, unknown>;
  }

  function aggregatePaginate(
    schema: Schema,
    options?: Record<string, unknown>
  ): void;

  export = aggregatePaginate;
}

declare module 'mongoose' {
  interface AggregatePaginateModel<T> {
    aggregatePaginate<R = T>(
      aggregateQuery?: Aggregate<T[]>,
      options?: import('mongoose-aggregate-paginate-v2').AggregatePaginateOptions,
      callback?: (
        err: Error,
        result: import('mongoose-aggregate-paginate-v2').AggregatePaginateResult<R>
      ) => void
    ): Promise<
      import('mongoose-aggregate-paginate-v2').AggregatePaginateResult<R>
    >;
  }
}
