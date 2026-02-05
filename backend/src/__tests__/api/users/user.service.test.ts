import { UserRepository } from '@/api/users/user.repository';
import UserService from '@/api/users/user.service';
import { BadRequestError } from '@/core';
import EventService from '@/services/event.service';

describe('UserService', () => {
  const userRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
    softDeleteById: jest.fn(),
    isEmailTaken: jest.fn(),
  } as unknown as UserRepository;

  const eventService = {
    emitUserCreated: jest.fn(),
    emitUserDeleted: jest.fn(),
  } as unknown as EventService;

  const service = new UserService(userRepository, eventService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws when email is already taken', async () => {
    userRepository.isEmailTaken = jest.fn().mockResolvedValue(true);

    await expect(
      service.create({ email: 'taken@example.com' })
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('creates user and emits event', async () => {
    userRepository.isEmailTaken = jest.fn().mockResolvedValue(false);
    userRepository.create = jest
      .fn()
      .mockResolvedValue({ id: 'user-1', email: 'user@example.com' });

    const result = await service.create({ email: 'user@example.com' });

    expect(result).toEqual({ id: 'user-1', email: 'user@example.com' });
    expect(eventService.emitUserCreated).toHaveBeenCalledWith(result);
  });

  it('emits event on delete', async () => {
    userRepository.deleteById = jest
      .fn()
      .mockResolvedValue({ id: 'user-1' });

    const result = await service.remove('user-1');

    expect(result).toEqual({ id: 'user-1' });
    expect(eventService.emitUserDeleted).toHaveBeenCalledWith('user-1');
  });

  it('emits event on soft delete', async () => {
    userRepository.softDeleteById = jest
      .fn()
      .mockResolvedValue({ id: 'user-1' });

    const result = await service.softDelete('user-1');

    expect(result).toEqual({ id: 'user-1' });
    expect(eventService.emitUserDeleted).toHaveBeenCalledWith('user-1');
  });
});
