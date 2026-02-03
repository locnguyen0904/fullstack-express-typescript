import { Service } from 'typedi';

import User, { IUser } from '@/api/users/user.model';
import { BadRequestError, Service as ServiceCore } from '@/core';
import EventService from '@/services/event.service';

@Service()
export default class UserService extends ServiceCore<IUser> {
  constructor(private eventService: EventService) {
    super(User);
  }

  async create(userBody: Partial<IUser>): Promise<IUser> {
    if (await User.isEmailTaken(userBody.email as string)) {
      throw new BadRequestError('Email already taken');
    }
    const created = await this.model.create(userBody);
    const user = created.toObject() as IUser;
    this.eventService.emitUserCreated(user);
    return user;
  }

  async remove(id: string): Promise<IUser | null> {
    const deleted = await super.remove(id);
    if (deleted) {
      this.eventService.emitUserDeleted(deleted.id);
    }
    return deleted;
  }

  async softDelete(id: string): Promise<IUser | null> {
    const deleted = await super.softDelete(id);
    if (deleted) {
      this.eventService.emitUserDeleted(deleted.id);
    }
    return deleted;
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return this.findOne({ email });
  }

  async getUserById(id: string): Promise<IUser | null> {
    return this.findById(id);
  }
}
