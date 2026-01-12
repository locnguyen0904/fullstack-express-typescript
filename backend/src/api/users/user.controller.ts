import { Service } from 'typedi';
import Controller from '@/core/controller.core';
import UserService from '@/api/users/user.service';
import { IUser } from '@/api/users/user.model';

@Service()
export default class UserController extends Controller<IUser, UserService> {
  constructor(service: UserService) {
    super(service);
  }
}
