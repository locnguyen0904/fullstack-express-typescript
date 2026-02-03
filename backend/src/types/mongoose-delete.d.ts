import { Document, FilterQuery,Model } from 'mongoose';
import { PaginateModel, PaginateOptions } from 'mongoose-paginate-v2';

declare module 'mongoose' {
  interface SoftDeleteModel<T extends Document> extends Model<T> {
    delete(filter?: FilterQuery<T>): Promise<unknown>;
    restore(filter?: FilterQuery<T>): Promise<unknown>;
    deleteById(id: string | Document): Promise<T | null>;
    restoreById(id: string | Document): Promise<T | null>;
  }

  interface SoftDeleteDocument extends Document {
    deletedAt?: Date;
  }

  interface PaginateModelWithDeleted<T extends Document>
    extends PaginateModel<T>, SoftDeleteModel<T> {
    paginate(
      query?: FilterQuery<T>,
      options?: PaginateOptions & { withDeleted?: boolean }
    ): Promise<PaginateResult<T>>;
  }
}
