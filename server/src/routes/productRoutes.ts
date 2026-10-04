import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats,
  vectorSearchProducts,
  getSimilarProducts,
  advancedProductSearch,
  getPersonalizedRecommendations
} from '../controllers/productController';
import { cacheMiddleware } from '../middleware/cache';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = express.Router();

// Public routes with caching
router.get('/', cacheMiddleware('products', 3600), getAllProducts);
router.get('/stats', cacheMiddleware('stats', 1800), getProductStats);
router.get('/search', vectorSearchProducts); // Vector search
router.get('/search/advanced', advancedProductSearch); // Advanced search with filters
router.get('/recommendations/:userId', getPersonalizedRecommendations);
router.get('/similar/:id', getSimilarProducts);
router.get('/:id', cacheMiddleware('product', 3600), getProductById);

// Admin routes
router.post('/', authenticate, authorizeAdmin, createProduct);
router.put('/:id', authenticate, authorizeAdmin, updateProduct);
router.delete('/:id', authenticate, authorizeAdmin, deleteProduct);

export default router;