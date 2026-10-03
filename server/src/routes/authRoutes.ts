import express from 'express';
import {
  login,
  register,
  getMe,
  updateProfile,
  changePassword,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

export default router;