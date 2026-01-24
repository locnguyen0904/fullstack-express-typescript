import User from '@/api/users/user.model';
import UserService from '@/api/users/user.service';
import { BadRequestError } from '@/core';
import EventService from '@/services/event.service';

jest.mock('@/api/users/user.model', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findByIdAndDelete: jest.fn(),
    isEmailTaken: jest.fn(),
  },
  UserRole: { Admin: 'admin', User: 'user' },
  userRoles: ['admin', 'user'],
}));

const mockedUser = User as unknown as {
  create: jest.Mock;
  findByIdAndDelete: jest.Mock;
  isEmailTaken: jest.Mock;
};

describe('UserService', () => {
  const eventService = {
    emitUserCreated: jest.fn(),
    emitUserDeleted: jest.fn(),
  } as unknown as EventService;

  const service = new UserService(eventService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws when email is already taken', async () => {
    mockedUser.isEmailTaken.mockResolvedValue(true);

    await expect(
      service.create({ email: 'taken@example.com' })
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('creates user and emits event', async () => {
    mockedUser.isEmailTaken.mockResolvedValue(false);
    mockedUser.create.mockResolvedValue({
      toObject: () => ({ id: 'user-1', email: 'user@example.com' }),
    });

    const result = await service.create({ email: 'user@example.com' });

    expect(result).toEqual({ id: 'user-1', email: 'user@example.com' });
    expect(eventService.emitUserCreated).toHaveBeenCalledWith(result);
  });

  it('emits event on delete', async () => {
    mockedUser.findByIdAndDelete.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ toObject: () => ({ id: 'user-1' }) }),
    });

    const result = await service.remove('user-1');

    expect(result).toEqual({ id: 'user-1' });
    expect(eventService.emitUserDeleted).toHaveBeenCalledWith('user-1');
  });
});
