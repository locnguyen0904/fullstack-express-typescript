import { Document } from 'mongoose';
import MongooseDelete from 'mongoose-delete';

/**
 * Extended soft delete model with additional helper methods
 *
 * Extends @types/mongoose-delete with convenience methods:
 * - deleteById: Soft delete by ID (returns the document)
 * - restoreById: Restore by ID (returns the document)
 */
declare module 'mongoose' {
  interface SoftDeleteModel<
    T extends Document,
  > extends MongooseDelete.SoftDeleteModel<T> {
    deleteById(id: string | Document): Promise<T | null>;
    restoreById(id: string | Document): Promise<T | null>;
  }

  interface PaginateModelWithDeleted<T extends Document>
    extends PaginateModel<T>, SoftDeleteModel<T> {}
}
