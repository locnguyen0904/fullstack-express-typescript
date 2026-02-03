import { Container } from 'typedi';

import { logger } from '@/services';
import EventService, { EventNames } from '@/services/event.service';

import { IUser } from './user.model';

const events = Container.get(EventService);

/**
 * User Created Event Handler
 * Triggered when a new user is created
 */
events.on(EventNames.UserCreated, (user: IUser) => {
  logger.info(`User created: ${user.id}`, {
    userId: user.id,
    email: user.email,
  });
});

/**
 * User Deleted Event Handler
 * Triggered when a user is deleted (soft or hard)
 */
events.on(EventNames.UserDeleted, (userId: string) => {
  logger.info(`User deleted: ${userId}`, {
    userId,
  });
});
