import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cartController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

router.get('/:userId', getCart);
router.post('/:userId', addToCart);
router.put('/:userId/:productId', updateCartItem);
router.delete('/:userId/:productId', removeFromCart);
router.delete('/:userId/clear', clearCart);

export default router;