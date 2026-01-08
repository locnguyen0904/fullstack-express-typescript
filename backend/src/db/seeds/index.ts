import mongoose from 'mongoose';

import config from '@/config/env.config';
import { logger } from '@/services';

(async () => {
  try {
    console.info('=======seeding data===========');
    await mongoose.connect(config.mongodb.url);
    await mongoose.disconnect();
    console.info('=======seeded data was successfully===========');
  } catch (error) {
    logger.debug(error);
  }
})();
