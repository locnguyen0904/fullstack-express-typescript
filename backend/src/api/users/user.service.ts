import { Service } from 'typedi';
import User, { IUser } from '@/api/users/user.model';
import ServiceCore from '@/core/service.core';
import { BadRequestError } from '@/core/response-error.core';

@Service()
export default class UserService extends ServiceCore<IUser> {
  constructor() {
    super(User);
  }

  async create(userBody: Partial<IUser>): Promise<IUser> {
    if (await User.isEmailTaken(userBody.email as string)) {
      throw new BadRequestError('Email already taken');
    }
    return this.model.create(userBody);
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return this.model.findOne({ email }).exec();
  }

  async getUserById(id: string): Promise<IUser | null> {
    return this.model.findById(id).exec();
  }
}
