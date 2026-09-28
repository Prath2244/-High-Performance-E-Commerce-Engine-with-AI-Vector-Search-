import { Request, Response } from 'express';
import { User } from '../models/User';
import { Product } from '../models/Product';

// Get user's cart with populated product details
export const getCart = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Populate cart items with product details
    const cartItems = await Promise.all(
      user.cart.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) return null;
        return {
          id: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          subtotal: product.price * item.quantity,
          stock: product.stock,
          available: product.stock >= item.quantity,
        };
      })
    );

    const validItems = cartItems.filter(item => item !== null);
    const total = validItems.reduce((sum, item) => sum + item.subtotal, 0);

    res.status(200).json({
      success: true,
      data: {
        items: validItems,
        total: total,
        itemCount: validItems.length,
      },
    });
  } catch (error) {
    console.error('❌ Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting cart',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Add item to cart
export const addToCart = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { productId, quantity = 1 } = req.body;

    // Check product exists and stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Not enough stock. Available: ${product.stock}`,
      });
    }

    // Find user and update cart
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if product already in cart
    const existingItem = user.cart.find(item => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ productId, quantity });
    }
    await user.save();

    // Return updated cart with populated product details
    const cartItems = await Promise.all(
      user.cart.map(async (item) => {
        const prod = await Product.findById(item.productId);
        if (!prod) return null;
        return {
          id: prod._id,
          name: prod.name,
          price: prod.price,
          quantity: item.quantity,
          subtotal: prod.price * item.quantity,
          stock: prod.stock,
          available: prod.stock >= item.quantity,
        };
      })
    );

    const validItems = cartItems.filter(item => item !== null);
    const total = validItems.reduce((sum, item) => sum + item.subtotal, 0);

    res.status(200).json({
      success: true,
      data: {
        items: validItems,
        total: total,
        itemCount: validItems.length,
      },
    });
  } catch (error) {
    console.error('❌ Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding item to cart',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update cart item quantity
export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity cannot be negative',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (quantity === 0) {
      // Remove item
      user.cart = user.cart.filter(item => item.productId !== productId);
    } else {
      const item = user.cart.find(item => item.productId === productId);
      if (item) {
        item.quantity = quantity;
      } else {
        return res.status(404).json({
          success: false,
          message: 'Item not in cart',
        });
      }
    }
    await user.save();

    // Return updated cart
    const cartItems = await Promise.all(
      user.cart.map(async (item) => {
        const prod = await Product.findById(item.productId);
        if (!prod) return null;
        return {
          id: prod._id,
          name: prod.name,
          price: prod.price,
          quantity: item.quantity,
          subtotal: prod.price * item.quantity,
          stock: prod.stock,
          available: prod.stock >= item.quantity,
        };
      })
    );
    const validItems = cartItems.filter(item => item !== null);
    const total = validItems.reduce((sum, item) => sum + item.subtotal, 0);

    res.status(200).json({
      success: true,
      data: {
        items: validItems,
        total: total,
        itemCount: validItems.length,
      },
    });
  } catch (error) {
    console.error('❌ Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating cart',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Remove item from cart
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const { userId, productId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.cart = user.cart.filter(item => item.productId !== productId);
    await user.save();

    // Return updated cart
    const cartItems = await Promise.all(
      user.cart.map(async (item) => {
        const prod = await Product.findById(item.productId);
        if (!prod) return null;
        return {
          id: prod._id,
          name: prod.name,
          price: prod.price,
          quantity: item.quantity,
          subtotal: prod.price * item.quantity,
          stock: prod.stock,
          available: prod.stock >= item.quantity,
        };
      })
    );
    const validItems = cartItems.filter(item => item !== null);
    const total = validItems.reduce((sum, item) => sum + item.subtotal, 0);

    res.status(200).json({
      success: true,
      data: {
        items: validItems,
        total: total,
        itemCount: validItems.length,
      },
    });
  } catch (error) {
    console.error('❌ Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing item from cart',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Clear cart
export const clearCart = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.cart = [];
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        items: [],
        total: 0,
        itemCount: 0,
      },
    });
  } catch (error) {
    console.error('❌ Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing cart',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};