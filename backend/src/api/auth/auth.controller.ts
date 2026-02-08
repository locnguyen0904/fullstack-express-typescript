import { Request, Response } from 'express';
import { inject, singleton } from 'tsyringe';

import AuthService from '@/api/auth/auth.service';
import { SuccessResponse, UnAuthorizedError } from '@/core';
import { decrypt, encrypt } from '@/helpers/crypto.helper';

@singleton()
export default class AuthController {
  constructor(@inject(AuthService) private authService: AuthService) {}

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const { user, tokens } = await this.authService.loginWithEmailAndPassword(
      email,
      password
    );

    res.cookie('refreshToken', encrypt(tokens.refresh.token), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
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
      const encryptedToken = req.cookies.refreshToken;
      if (!encryptedToken) {
        throw new UnAuthorizedError('No refresh token provided');
      }

      const refreshToken = decrypt(encryptedToken);
      const tokens = await this.authService.refreshAuth(refreshToken);

      res.cookie('refreshToken', encrypt(tokens.refresh.token), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
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

  async logout(req: Request, res: Response) {
    // Revoke the access token if present
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      await this.authService.revokeAccessToken(authHeader.split(' ')[1]);
    }

    res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh-token' });
    new SuccessResponse({ message: 'Logout successfully' }).send(res);
  }
}
