import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { invalidateMultipleCache } from '../middleware/cache';
import { CACHE_KEYS } from '../utils/cacheKeys';
import { generateQueryEmbedding } from '../services/vectorService';

// ──────────────────────────────────────
// 1. BASIC CRUD OPERATIONS
// ──────────────────────────────────────

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const category = req.query.category as string;
    const query = req.query.query as string;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (category && category !== 'all') filter.category = category;

    // Text search support for admin product search
    if (query && query.trim()) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const transformed = products.map(p => ({
      id: p._id,
      name: p.name || '',
      category: p.category || '',
      brand: p.brand || '',
      price: typeof p.price === 'number' ? p.price : 0,
      stock: typeof p.stock === 'number' ? p.stock : 0,
      rating: typeof p.rating === 'number' ? p.rating : 0,
      reviews: typeof p.reviews === 'number' ? p.reviews : 0,
      description: p.description || '',
      tags: p.tags || [],
      featured: p.featured || false,
      image: p.image || '',
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        products: transformed,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).lean();
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: product._id,
        name: product.name,
        category: product.category,
        brand: product.brand,
        price: typeof product.price === 'number' ? product.price : 0,
        stock: typeof product.stock === 'number' ? product.stock : 0,
        rating: typeof product.rating === 'number' ? product.rating : 0,
        reviews: typeof product.reviews === 'number' ? product.reviews : 0,
        description: product.description,
        tags: product.tags || [],
        featured: product.featured || false,
        image: product.image || '',
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const productData = req.body;
    const required = ['name', 'category', 'brand', 'price', 'stock'];
    const missing = required.filter(f => !productData[f]);
    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Missing fields: ${missing.join(', ')}`,
      });
    }

    const vector = Array.from({ length: 768 }, () => +(Math.random() * 2 - 1).toFixed(4));

    const newProduct = new Product({
      ...productData,
      vector,
      rating: 0,
      reviews: 0,
    });

    await newProduct.save();

    await invalidateMultipleCache([
      CACHE_KEYS.pattern.products,
      CACHE_KEYS.pattern.search,
    ]);

    res.status(201).json({
      success: true,
      message: 'Product created',
      data: {
        id: newProduct._id,
        name: newProduct.name,
        category: newProduct.category,
        brand: newProduct.brand,
        price: newProduct.price,
        stock: newProduct.stock,
      },
    });
  } catch (error) {
    console.error('❌ Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    delete updates._id;
    delete updates.id;
    delete updates.createdAt;
    delete updates.updatedAt;
    delete updates.vector;

    const updated = await Product.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await invalidateMultipleCache([
      CACHE_KEYS.product(id),
      CACHE_KEYS.pattern.products,
      CACHE_KEYS.pattern.search,
    ]);

    res.status(200).json({
      success: true,
      message: 'Product updated',
      data: {
        id: updated._id,
        name: updated.name,
        category: updated.category,
        brand: updated.brand,
        price: updated.price,
        stock: updated.stock,
        rating: updated.rating,
        reviews: updated.reviews,
        description: updated.description,
        image: updated.image || '',
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error('❌ Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await invalidateMultipleCache([
      CACHE_KEYS.product(id),
      CACHE_KEYS.pattern.products,
      CACHE_KEYS.pattern.search,
    ]);

    res.status(200).json({
      success: true,
      message: 'Product deleted',
      data: { id: deleted._id, name: deleted.name },
    });
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getProductStats = async (req: Request, res: Response) => {
  try {
    const total = await Product.countDocuments();
    const stockAgg = await Product.aggregate([
      { $group: { _id: null, total: { $sum: '$stock' } } },
    ]);
    const revenueAgg = await Product.aggregate([
      { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$stock'] } } } },
    ]);
    const avgPriceAgg = await Product.aggregate([
      { $group: { _id: null, avg: { $avg: '$price' } } },
    ]);
    const categories = await Product.distinct('category');

    res.status(200).json({
      success: true,
      data: {
        totalProducts: total,
        totalStock: stockAgg[0]?.total || 0,
        totalRevenue: revenueAgg[0]?.total || 0,
        averagePrice: avgPriceAgg[0]?.avg || 0,
        categories,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stats',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ──────────────────────────────────────
// 2. VECTOR SEARCH (fallback included)
// ──────────────────────────────────────

export const vectorSearchProducts = async (req: Request, res: Response) => {
  try {
    const { query, limit = 20, minScore = 0.5 } = req.query;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const queryVector = await generateQueryEmbedding(query);

    let results = await Product.aggregate([
      {
        $vectorSearch: {
          index: 'product_vector_index',
          path: 'vector',
          queryVector: queryVector,
          numCandidates: 100,
          limit: parseInt(limit as string) || 20,
        },
      },
      {
        $addFields: {
          score: { $meta: 'vectorSearchScore' },
        },
      },
      {
        $match: {
          score: { $gte: parseFloat(minScore as string) || 0.5 },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          category: 1,
          brand: 1,
          price: 1,
          stock: 1,
          rating: 1,
          reviews: 1,
          description: 1,
          tags: 1,
          featured: 1,
          image: 1,
          score: 1,
          vector: 0,
        },
      },
    ]).catch(() => {
      // Fallback to text search if vector index is missing
      return Product.aggregate([
        {
          $match: {
            $text: { $search: query as string },
          },
        },
        {
          $addFields: {
            score: { $meta: 'textScore' },
          },
        },
        {
          $sort: { score: -1 },
        },
        {
          $limit: parseInt(limit as string) || 20,
        },
        {
          $project: {
            _id: 1,
            name: 1,
            category: 1,
            brand: 1,
            price: 1,
            stock: 1,
            rating: 1,
            reviews: 1,
            description: 1,
            tags: 1,
            featured: 1,
            image: 1,
            score: 1,
          },
        },
      ]);
    });

    const transformed = results.map((p: any) => ({
      id: p._id,
      name: p.name,
      category: p.category,
      brand: p.brand,
      price: p.price,
      stock: p.stock,
      rating: p.rating,
      reviews: p.reviews,
      description: p.description,
      tags: p.tags || [],
      featured: p.featured || false,
      image: p.image || '',
      score: +(p.score * 100).toFixed(2),
    }));

    res.status(200).json({
      success: true,
      data: {
        query,
        results: transformed,
        total: transformed.length,
        limit: parseInt(limit as string) || 20,
      },
    });
  } catch (error) {
    console.error('❌ Vector search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing vector search',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getSimilarProducts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    const source = await Product.findById(id);
    if (!source) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (!source.vector || source.vector.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product has no vector',
      });
    }

    const similar = await Product.aggregate([
      {
        $vectorSearch: {
          index: 'product_vector_index',
          path: 'vector',
          queryVector: source.vector,
          numCandidates: 50,
          limit: limit,
        },
      },
      {
        $match: {
          _id: { $ne: source._id },
        },
      },
      {
        $addFields: {
          similarity: { $multiply: [{ $meta: 'vectorSearchScore' }, 100] },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          category: 1,
          brand: 1,
          price: 1,
          stock: 1,
          rating: 1,
          description: 1,
          image: 1,
          similarity: 1,
        },
      },
    ]);

    const transformed = similar.map((p: any) => ({
      id: p._id,
      name: p.name,
      category: p.category,
      brand: p.brand,
      price: p.price,
      stock: p.stock,
      rating: p.rating,
      description: p.description,
      image: p.image || '',
      similarity: +(p.similarity || 0).toFixed(2),
    }));

    res.status(200).json({
      success: true,
      data: {
        sourceProduct: {
          id: source._id,
          name: source.name,
          category: source.category,
        },
        similar: transformed,
      },
    });
  } catch (error) {
    console.error('❌ Similar products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error finding similar products',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const advancedProductSearch = async (req: Request, res: Response) => {
  // Stub – you can implement full advanced search if needed
  res.status(200).json({
    success: true,
    message: 'Advanced search endpoint',
  });
};

export const getPersonalizedRecommendations = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    const recommendations = await Product.aggregate([
      {
        $match: {
          featured: true,
          stock: { $gt: 0 },
        },
      },
      { $sample: { size: limit } },
      {
        $project: {
          _id: 1,
          name: 1,
          category: 1,
          brand: 1,
          price: 1,
          stock: 1,
          rating: 1,
          description: 1,
          image: 1,
        },
      },
    ]);

    const transformed = recommendations.map((p: any) => ({
      id: p._id,
      name: p.name,
      category: p.category,
      brand: p.brand,
      price: p.price,
      stock: p.stock,
      rating: p.rating,
      description: p.description,
      image: p.image || '',
    }));

    res.status(200).json({
      success: true,
      data: {
        recommendations: transformed,
        reason: 'featured_products',
      },
    });
  } catch (error) {
    console.error('❌ Recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting recommendations',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};