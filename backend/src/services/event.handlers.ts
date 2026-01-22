import { Container } from 'typedi';
import EventService, { EventNames } from './event.service';
import logger from './logger.service';

const events = Container.get(EventService);

events.on(EventNames.UserCreated, (user) => {
  logger.info(`User created: ${user.id}`);
});

events.on(EventNames.UserDeleted, (userId: string) => {
  logger.info(`User deleted: ${userId}`);
});
