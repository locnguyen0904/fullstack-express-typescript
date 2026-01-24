import { Request, Response } from 'express';
import { Service } from 'typedi';
import AuthService from '@/api/auth/auth.service';
import { SuccessResponse, UnAuthorizedError } from '@/core';

@Service()
export default class AuthController {
  constructor(private authService: AuthService) {}

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const { user, tokens } = await this.authService.loginWithEmailAndPassword(
      email,
      password
    );

    res.cookie('refreshToken', tokens.refresh.token, {
      httpOnly: true,
      path: '/api/v1/auth/refresh-token',
      expires: tokens.refresh.expires,
    });

    new SuccessResponse({
      message: 'Login successfully',
      data: { user, token: tokens.access.token },
    }).send(res);
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        throw new UnAuthorizedError('No refresh token provided');
      }
      const tokens = await this.authService.refreshAuth(refreshToken);

      res.cookie('refreshToken', tokens.refresh.token, {
        httpOnly: true,
        path: '/api/v1/auth/refresh-token',
        expires: tokens.refresh.expires,
      });

      new SuccessResponse({
        message: 'Token refreshed',
        data: { token: tokens.access.token },
      }).send(res);
    } catch (error) {
      res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh-token' });
      throw error;
    }
  }

  async logout(_req: Request, res: Response) {
    res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh-token' });
    new SuccessResponse({ message: 'Logout successfully' }).send(res);
  }
}
