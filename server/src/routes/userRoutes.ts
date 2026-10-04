import express from 'express';
import { getAllUsers, getUserById } from '../controllers/userController';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = express.Router();

// All user routes require admin
router.use(authenticate);
router.use(authorizeAdmin);

router.get('/', getAllUsers);
router.get('/:id', getUserById);

export default router;