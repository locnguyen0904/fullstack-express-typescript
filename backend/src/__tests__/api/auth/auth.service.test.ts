import AuthService from '@/api/auth/auth.service';
import UserService from '@/api/users/user.service';

describe('AuthService', () => {
  const userService = {
    getUserByEmail: jest.fn(),
    getUserById: jest.fn(),
  } as unknown as UserService;

  const authService = new AuthService(userService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws when email or password is invalid', async () => {
    userService.getUserByEmail = jest.fn().mockResolvedValue(null);

    await expect(
      authService.loginWithEmailAndPassword('test@example.com', 'wrong')
    ).rejects.toThrow('Incorrect email or password');
  });

  it('returns tokens when credentials are valid', async () => {
    userService.getUserByEmail = jest.fn().mockResolvedValue({
      id: 'user-1',
      role: 'user',
      isPasswordMatch: jest.fn().mockResolvedValue(true),
    });

    const result = await authService.loginWithEmailAndPassword(
      'test@example.com',
      'password123'
    );

    expect(result.tokens.access.token).toBeDefined();
    expect(result.tokens.refresh.token).toBeDefined();
  });

  it('rejects non-refresh tokens', async () => {
    const { access, refresh } = authService.generateAuthTokens({
      id: 'user-1',
      role: 'user',
    } as never);

    await expect(authService.refreshAuth(access.token)).rejects.toThrow(
      'Please authenticate'
    );

    userService.getUserById = jest.fn().mockResolvedValue({
      id: 'user-1',
      role: 'user',
    });

    await expect(authService.refreshAuth(refresh.token)).resolves.toBeDefined();
  });
});
