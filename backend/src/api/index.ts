import { Router } from 'express';
import examples from './examples';
import auth from './auth';
import users from './users';
import health from './health';

const router: Router = Router();

router.use('/examples', examples);
router.use('/auth', auth);
router.use('/users', users);
router.use('/health', health);

export default router;
