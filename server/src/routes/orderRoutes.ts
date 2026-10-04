import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
  getUserOrders,
} from '../controllers/orderController';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

// User routes
router.post('/:userId', createOrder);
router.get('/user/:userId', getUserOrders);

// Admin routes
router.get('/', authorizeAdmin, getAllOrders);
router.get('/:orderId', authorizeAdmin, getOrderDetails);
router.put('/:orderId/status', authorizeAdmin, updateOrderStatus);

export default router;