import { Document, Model } from 'mongoose';
import { Service, NotFoundError } from '@/core';

// Mock document type
interface IMockDoc extends Document {
  id: string;
  name: string;
}

// Helper to create mock document with toObject
const createMockDoc = (data: Partial<IMockDoc>): IMockDoc => {
  return {
    ...data,
    toObject: jest.fn().mockReturnValue(data),
  } as unknown as IMockDoc;
};

// Helper to create basic mock model
const createMockModel = () => {
  return {
    create: jest.fn(),
    findByIdAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn() }),
    findByIdAndDelete: jest.fn().mockReturnValue({ exec: jest.fn() }),
    findOne: jest.fn().mockReturnValue({ exec: jest.fn() }),
    findById: jest.fn().mockReturnValue({ exec: jest.fn() }),
  } as unknown as Model<IMockDoc>;
};

// Helper to create model with pagination support
const createPaginateModel = () => {
  const model = createMockModel();
  (model as unknown as Record<string, unknown>).paginate = jest.fn();
  return model;
};

// Helper to create model with soft delete support
const createSoftDeleteModel = () => {
  const model = createMockModel();
  (model as unknown as Record<string, unknown>).delete = jest.fn();
  (model as unknown as Record<string, unknown>).deleteById = jest.fn();
  (model as unknown as Record<string, unknown>).restoreById = jest.fn();
  return model;
};

// Concrete implementation for testing
class TestService extends Service<IMockDoc> {
  constructor(model: Model<IMockDoc>) {
    super(model);
  }
}

describe('Service', () => {
  let mockModel: Model<IMockDoc>;
  let service: TestService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    beforeEach(() => {
      mockModel = createMockModel();
      service = new TestService(mockModel);
    });

    it('creates document and returns plain object', async () => {
      const mockDoc = createMockDoc({ id: '1', name: 'Test' });
      (mockModel.create as jest.Mock).mockResolvedValue(mockDoc);

      const result = await service.create({ name: 'Test' });

      expect(mockModel.create).toHaveBeenCalledWith({ name: 'Test' });
      expect(result).toEqual({ id: '1', name: 'Test' });
    });

    it('calls toObject on created document', async () => {
      const mockDoc = createMockDoc({ id: '1', name: 'Test' });
      (mockModel.create as jest.Mock).mockResolvedValue(mockDoc);

      await service.create({ name: 'Test' });

      expect(mockDoc.toObject).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    beforeEach(() => {
      mockModel = createMockModel();
      service = new TestService(mockModel);
    });

    it('updates document and returns plain object', async () => {
      const mockDoc = createMockDoc({ id: '1', name: 'Updated' });
      (mockModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDoc),
      });

      const result = await service.update('1', { name: 'Updated' });

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { name: 'Updated' },
        { new: true }
      );
      expect(result).toEqual({ id: '1', name: 'Updated' });
    });

    it('returns null when document not found', async () => {
      (mockModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.update('nonexistent', { name: 'Updated' });

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      mockModel = createMockModel();
      service = new TestService(mockModel);
    });

    it('removes document and returns plain object', async () => {
      const mockDoc = createMockDoc({ id: '1', name: 'Deleted' });
      (mockModel.findByIdAndDelete as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDoc),
      });

      const result = await service.remove('1');

      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual({ id: '1', name: 'Deleted' });
    });

    it('returns null when document not found', async () => {
      (mockModel.findByIdAndDelete as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.remove('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    beforeEach(() => {
      mockModel = createMockModel();
      service = new TestService(mockModel);
    });

    it('finds document by filter', async () => {
      const mockDoc = createMockDoc({ id: '1', name: 'Found' });
      (mockModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDoc),
      });

      const result = await service.findOne({ name: 'Found' });

      expect(mockModel.findOne).toHaveBeenCalledWith(
        { name: 'Found' },
        null,
        {}
      );
      expect(result).toEqual({ id: '1', name: 'Found' });
    });

    it('returns null when not found', async () => {
      (mockModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findOne({ name: 'NotExist' });

      expect(result).toBeNull();
    });

    it('passes options to findOne', async () => {
      const mockDoc = createMockDoc({ id: '1', name: 'Found' });
      (mockModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDoc),
      });

      await service.findOne({ name: 'Found' }, { lean: true });

      expect(mockModel.findOne).toHaveBeenCalledWith({ name: 'Found' }, null, {
        lean: true,
      });
    });
  });

  describe('findById', () => {
    beforeEach(() => {
      mockModel = createMockModel();
      service = new TestService(mockModel);
    });

    it('finds document by id', async () => {
      const mockDoc = createMockDoc({ id: '1', name: 'Found' });
      (mockModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDoc),
      });

      const result = await service.findById('1');

      expect(mockModel.findById).toHaveBeenCalledWith('1', null, {});
      expect(result).toEqual({ id: '1', name: 'Found' });
    });

    it('returns null when not found', async () => {
      (mockModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });

    it('passes options to findById', async () => {
      const mockDoc = createMockDoc({ id: '1', name: 'Found' });
      (mockModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDoc),
      });

      await service.findById('1', { lean: true });

      expect(mockModel.findById).toHaveBeenCalledWith('1', null, {
        lean: true,
      });
    });
  });

  describe('findAll', () => {
    it('throws error when model does not support pagination', async () => {
      mockModel = createMockModel(); // No paginate method
      service = new TestService(mockModel);

      await expect(service.findAll()).rejects.toThrow(
        'Model does not support pagination'
      );
    });

    it('paginates with default values', async () => {
      mockModel = createPaginateModel();
      service = new TestService(mockModel);
      const paginateMock = (mockModel as unknown as { paginate: jest.Mock })
        .paginate;
      paginateMock.mockResolvedValue({ docs: [], totalDocs: 0 });

      await service.findAll();

      expect(paginateMock).toHaveBeenCalledWith(
        {},
        { page: 1, limit: 25, sort: '-createdAt', lean: true }
      );
    });

    it('paginates with custom values', async () => {
      mockModel = createPaginateModel();
      service = new TestService(mockModel);
      const paginateMock = (mockModel as unknown as { paginate: jest.Mock })
        .paginate;
      paginateMock.mockResolvedValue({ docs: [], totalDocs: 0 });

      await service.findAll({ page: 2, limit: 10, sort: 'name' });

      expect(paginateMock).toHaveBeenCalledWith(
        {},
        { page: 2, limit: 10, sort: 'name', lean: true }
      );
    });

    it('includes deleted documents when includeDeleted is true', async () => {
      mockModel = createPaginateModel();
      service = new TestService(mockModel);
      const paginateMock = (mockModel as unknown as { paginate: jest.Mock })
        .paginate;
      paginateMock.mockResolvedValue({ docs: [], totalDocs: 0 });

      await service.findAll({ includeDeleted: true });

      expect(paginateMock).toHaveBeenCalledWith(
        {},
        {
          page: 1,
          limit: 25,
          sort: '-createdAt',
          withDeleted: true,
          lean: true,
        }
      );
    });

    it('includes deleted documents when includeDeleted is "true" string', async () => {
      mockModel = createPaginateModel();
      service = new TestService(mockModel);
      const paginateMock = (mockModel as unknown as { paginate: jest.Mock })
        .paginate;
      paginateMock.mockResolvedValue({ docs: [], totalDocs: 0 });

      await service.findAll({ includeDeleted: 'true' });

      expect(paginateMock).toHaveBeenCalledWith(
        {},
        {
          page: 1,
          limit: 25,
          sort: '-createdAt',
          withDeleted: true,
          lean: true,
        }
      );
    });

    it('passes additional filters to paginate', async () => {
      mockModel = createPaginateModel();
      service = new TestService(mockModel);
      const paginateMock = (mockModel as unknown as { paginate: jest.Mock })
        .paginate;
      paginateMock.mockResolvedValue({ docs: [], totalDocs: 0 });

      await service.findAll({ name: 'Test', status: 'active' });

      expect(paginateMock).toHaveBeenCalledWith(
        { name: 'Test', status: 'active' },
        { page: 1, limit: 25, sort: '-createdAt', lean: true }
      );
    });
  });

  describe('softDelete', () => {
    it('throws error when model does not support soft delete', async () => {
      mockModel = createMockModel(); // No delete method
      service = new TestService(mockModel);

      await expect(service.softDelete('1')).rejects.toThrow(
        'Model does not support soft delete'
      );
    });

    it('soft deletes document and returns plain object', async () => {
      mockModel = createSoftDeleteModel();
      service = new TestService(mockModel);
      const mockDoc = createMockDoc({ id: '1', name: 'Deleted' });
      (
        mockModel as unknown as { deleteById: jest.Mock }
      ).deleteById.mockResolvedValue(mockDoc);

      const result = await service.softDelete('1');

      expect(
        (mockModel as unknown as { deleteById: jest.Mock }).deleteById
      ).toHaveBeenCalledWith('1');
      expect(result).toEqual({ id: '1', name: 'Deleted' });
    });

    it('throws NotFoundError when document not found', async () => {
      mockModel = createSoftDeleteModel();
      service = new TestService(mockModel);
      (
        mockModel as unknown as { deleteById: jest.Mock }
      ).deleteById.mockResolvedValue(null);

      await expect(service.softDelete('nonexistent')).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('restore', () => {
    it('throws error when model does not support soft delete', async () => {
      mockModel = createMockModel(); // No delete method
      service = new TestService(mockModel);

      await expect(service.restore('1')).rejects.toThrow(
        'Model does not support soft delete'
      );
    });

    it('restores document and returns plain object', async () => {
      mockModel = createSoftDeleteModel();
      service = new TestService(mockModel);
      const mockDoc = createMockDoc({ id: '1', name: 'Restored' });
      (
        mockModel as unknown as { restoreById: jest.Mock }
      ).restoreById.mockResolvedValue(mockDoc);

      const result = await service.restore('1');

      expect(
        (mockModel as unknown as { restoreById: jest.Mock }).restoreById
      ).toHaveBeenCalledWith('1');
      expect(result).toEqual({ id: '1', name: 'Restored' });
    });

    it('throws NotFoundError when document not found', async () => {
      mockModel = createSoftDeleteModel();
      service = new TestService(mockModel);
      (
        mockModel as unknown as { restoreById: jest.Mock }
      ).restoreById.mockResolvedValue(null);

      await expect(service.restore('nonexistent')).rejects.toThrow(
        NotFoundError
      );
    });
  });
});
