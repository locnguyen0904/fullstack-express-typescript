import { Service } from 'typedi';
import jwt from 'jsonwebtoken';
import { config } from '@/config';
import UserService from '@/api/users/user.service';
import { UnAuthorizedError } from '@/core/response-error.core';
import { IUser } from '@/api/users/user.model';
import { AuthTokens } from './auth.interface';

@Service()
export default class AuthService {
  constructor(private userService: UserService) {}

  async loginWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<{ user: IUser; tokens: AuthTokens }> {
    const user = await this.userService.getUserByEmail(email);
    if (!user || !(await user.isPasswordMatch(password))) {
      throw new UnAuthorizedError('Incorrect email or password');
    }
    const tokens = this.generateAuthTokens(user);
    return { user, tokens };
  }

  async refreshAuth(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, config.jwt.secret) as {
        sub: string;
        type: string;
      };
      if (payload.type !== 'refresh') {
        throw new UnAuthorizedError('Invalid token type');
      }
      const user = await this.userService.getUserById(payload.sub);
      if (!user) {
        throw new UnAuthorizedError('User not found');
      }
      return this.generateAuthTokens(user);
    } catch {
      throw new UnAuthorizedError('Please authenticate');
    }
  }

  generateAuthTokens(user: IUser) {
    const accessTokenExpires =
      Math.floor(Date.now() / 1000) + config.jwt.accessExpirationMinutes * 60;
    const accessToken = jwt.sign(
      { sub: user.id, role: user.role, type: 'access' },
      config.jwt.secret,
      { expiresIn: config.jwt.accessExpirationMinutes * 60 }
    );

    const refreshTokenExpires =
      Math.floor(Date.now() / 1000) +
      config.jwt.refreshExpirationDays * 24 * 60 * 60;
    const refreshToken = jwt.sign(
      { sub: user.id, type: 'refresh' },
      config.jwt.secret,
      { expiresIn: `${config.jwt.refreshExpirationDays}d` }
    );

    return {
      access: {
        token: accessToken,
        expires: new Date(accessTokenExpires * 1000),
      },
      refresh: {
        token: refreshToken,
        expires: new Date(refreshTokenExpires * 1000),
      },
    };
  }
}
