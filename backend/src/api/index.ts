import { Router } from 'express';
import examples from './examples';

const router: Router = Router();

router.use('/examples', examples);

export default router;
