import { Router } from 'express';
import examples from './examples';
import auth from './auth';
import users from './users';

const router: Router = Router();

router.use('/examples', examples);
router.use('/auth', auth);
router.use('/users', users);

export default router;
