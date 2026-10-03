import express from 'express';
import { getAnalytics } from '../controllers/analyticsController';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = express.Router();

// Admin only
router.use(authenticate);
router.use(authorizeAdmin);

router.get('/', getAnalytics);

export default router;