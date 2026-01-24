import { Request, Response } from 'express';
import { Document } from 'mongoose';
import { Controller, Service, NotFoundError } from '@/core';

// Mock document type
interface IMockDoc extends Document {
  id: string;
  name: string;
}

// Mock service
const createMockService = () => {
  return {
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
  } as unknown as Service<IMockDoc>;
};

// Mock response
const createMockResponse = () => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as Response;
};

// Mock request
const createMockRequest = (overrides: Partial<Request> = {}): Request => {
  return {
    body: {},
    params: {},
    query: {},
    ...overrides,
  } as Request;
};

// Concrete controller for testing
class TestController extends Controller<IMockDoc, Service<IMockDoc>> {
  constructor(service: Service<IMockDoc>) {
    super(service);
  }
}

describe('Controller', () => {
  let controller: TestController;
  let mockService: Service<IMockDoc>;
  let mockRes: Response;

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = createMockService();
    controller = new TestController(mockService);
    mockRes = createMockResponse();
  });

  describe('constructor', () => {
    it('sets _name by removing "Controller" suffix', () => {
      expect((controller as unknown as { _name: string })._name).toBe('Test');
    });
  });

  describe('create', () => {
    it('creates document and sends CREATED response', async () => {
      const mockData = { name: 'Test' };
      const mockResult = { id: '1', name: 'Test' };
      const mockReq = createMockRequest({ body: mockData });

      (mockService.create as jest.Mock).mockResolvedValue(mockResult);

      await controller.create(mockReq, mockRes);

      expect(mockService.create).toHaveBeenCalledWith(mockData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: mockResult,
        })
      );
    });
  });

  describe('update', () => {
    it('updates document and sends OK response', async () => {
      const mockData = { name: 'Updated' };
      const mockResult = { id: '1', name: 'Updated' };
      const mockReq = createMockRequest({
        params: { id: '1' },
        body: mockData,
      });

      (mockService.update as jest.Mock).mockResolvedValue(mockResult);

      await controller.update(mockReq, mockRes);

      expect(mockService.update).toHaveBeenCalledWith('1', mockData);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: mockResult,
        })
      );
    });

    it('throws NotFoundError when document not found', async () => {
      const mockReq = createMockRequest({
        params: { id: 'nonexistent' },
        body: { name: 'Updated' },
      });

      (mockService.update as jest.Mock).mockResolvedValue(null);

      await expect(controller.update(mockReq, mockRes)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('delete', () => {
    it('soft deletes document and sends OK response', async () => {
      const mockResult = { id: '1', name: 'Deleted' };
      const mockReq = createMockRequest({ params: { id: '1' } });

      (mockService.softDelete as jest.Mock).mockResolvedValue(mockResult);

      await controller.delete(mockReq, mockRes);

      expect(mockService.softDelete).toHaveBeenCalledWith('1');
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('throws NotFoundError when document not found', async () => {
      const mockReq = createMockRequest({ params: { id: 'nonexistent' } });

      (mockService.softDelete as jest.Mock).mockResolvedValue(null);

      await expect(controller.delete(mockReq, mockRes)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('findAll', () => {
    it('returns paginated list', async () => {
      const mockResult = {
        docs: [{ id: '1', name: 'Test' }],
        totalDocs: 1,
        page: 1,
        totalPages: 1,
        limit: 25,
      };
      const mockReq = createMockRequest({ query: { page: '1', limit: '25' } });

      (mockService.findAll as jest.Mock).mockResolvedValue(mockResult);

      await controller.findAll(mockReq, mockRes);

      expect(mockService.findAll).toHaveBeenCalledWith({
        page: '1',
        limit: '25',
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: mockResult.docs,
          total: 1,
          page: 1,
          pages: 1,
          limit: 25,
        })
      );
    });
  });

  describe('findOne', () => {
    it('finds document by id and sends OK response', async () => {
      const mockResult = { id: '1', name: 'Found' };
      const mockReq = createMockRequest({ params: { id: '1' } });

      (mockService.findById as jest.Mock).mockResolvedValue(mockResult);

      await controller.findOne(mockReq, mockRes);

      expect(mockService.findById).toHaveBeenCalledWith('1');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: mockResult,
        })
      );
    });

    it('throws NotFoundError when document not found', async () => {
      const mockReq = createMockRequest({ params: { id: 'nonexistent' } });

      (mockService.findById as jest.Mock).mockResolvedValue(null);

      await expect(controller.findOne(mockReq, mockRes)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('handler', () => {
    it('wraps method and calls it with req, res', async () => {
      const mockMethod = jest.fn().mockResolvedValue(undefined);
      const handler = Controller.handler(mockMethod);
      const mockReq = createMockRequest();
      const mockNext = jest.fn();

      await handler(mockReq, mockRes, mockNext);

      expect(mockMethod).toHaveBeenCalledWith(mockReq, mockRes);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('calls next with error when method throws', async () => {
      const error = new Error('Test error');
      const mockMethod = jest.fn().mockRejectedValue(error);
      const handler = Controller.handler(mockMethod);
      const mockReq = createMockRequest();
      const mockNext = jest.fn();

      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
