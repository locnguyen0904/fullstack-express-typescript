import { Service } from 'typedi';

import { IUser } from '@/api/users/user.model';
import UserService from '@/api/users/user.service';
import { Controller } from '@/core';

@Service()
export default class UserController extends Controller<IUser, UserService> {
  constructor(service: UserService) {
    super(service);
  }
}
