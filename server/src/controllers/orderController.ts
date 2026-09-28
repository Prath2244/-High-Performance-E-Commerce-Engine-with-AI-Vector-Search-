import { Request, Response } from 'express';
import { Order, IOrderItem } from '../models/Order';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Discount } from '../models/Discount';
import { reserveInventory, releaseInventory } from '../services/inventoryService';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';

// Helper to convert order doc to response with id
const orderToResponse = (order: any) => {
  const doc = order.toObject ? order.toObject() : order;
  return { ...doc, id: doc._id };
};

// Create order from cart
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { shippingAddress, paymentMethod, discountCode } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
    }

    const orderItems: IOrderItem[] = [];
    let subtotal = 0;

    for (const cartItem of user.cart) {
      const product = await Product.findById(cartItem.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${cartItem.productId} not found`,
        });
      }

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }

      const subtotalItem = product.price * cartItem.quantity;
      orderItems.push({
        productId: product._id as mongoose.Types.ObjectId,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        subtotal: subtotalItem,
      });
      subtotal += subtotalItem;
    }

    let discountAmount = 0;
    let appliedDiscount = null;

    if (discountCode) {
      const discount = await Discount.findOne({
        code: discountCode.toUpperCase(),
        active: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      });

      if (discount) {
        if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
          return res.status(400).json({
            success: false,
            message: 'Discount code has reached its usage limit',
          });
        }

        if (discount.minOrderAmount && subtotal < discount.minOrderAmount) {
          return res.status(400).json({
            success: false,
            message: `Minimum order amount of $${discount.minOrderAmount} required for this discount`,
          });
        }

        if (discount.type === 'percentage') {
          discountAmount = (subtotal * discount.value) / 100;
          if (discount.maxDiscount) {
            discountAmount = Math.min(discountAmount, discount.maxDiscount);
          }
        } else {
          discountAmount = discount.value;
        }

        appliedDiscount = discount;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired discount code',
        });
      }
    }

    const total = subtotal - discountAmount;

    const order = new Order({
      orderNumber: `ORD-${Date.now()}-${uuidv4().slice(0, 8)}`,
      userId: userId,
      items: orderItems,
      subtotal,
      discount: discountAmount,
      discountCode: discountCode ? discountCode.toUpperCase() : undefined,
      total,
      shippingAddress,
      paymentMethod,
      status: 'confirmed',
      paymentStatus: 'paid',
    });

    const reservation = await reserveInventory(
      orderItems.map(item => ({
        productId: item.productId.toString(),
        quantity: item.quantity,
      }))
    );

    if (!reservation.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to reserve inventory',
        errors: reservation.failed,
      });
    }

    if (appliedDiscount) {
      await Discount.findByIdAndUpdate(appliedDiscount._id, {
        $inc: { usedCount: 1 },
      });
    }

    await User.findByIdAndUpdate(userId, { $set: { cart: [] } });

    await order.save();

    const responseOrder = orderToResponse(order);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order: responseOrder,
      },
    });
  } catch (error) {
    console.error('❌ Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get user orders
export const getUserOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { status, limit = 20, page = 1 } = req.query;

    const query: any = { userId };
    if (status) query.status = status;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));

    const total = await Order.countDocuments(query);

    const responseOrders = orders.map(orderToResponse);

    res.status(200).json({
      success: true,
      data: {
        orders: responseOrders,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string)),
        },
      },
    });
  } catch (error) {
    console.error('❌ Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get order details (admin or owner)
export const getOrderDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!orderId || orderId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format',
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if user owns this order or is admin
    if (req.user?.role !== 'admin' && order.userId !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const responseOrder = orderToResponse(order);

    res.status(200).json({
      success: true,
      data: responseOrder,
    });
  } catch (error) {
    console.error('❌ Get order details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order details',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!orderId || orderId === 'undefined' || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID',
      });
    }

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (status === 'cancelled' && order.status !== 'cancelled') {
      await releaseInventory(
        order.items.map(item => ({
          productId: item.productId.toString(),
          quantity: item.quantity,
        }))
      );
    }

    order.status = status;
    await order.save();

    const responseOrder = orderToResponse(order);

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      data: responseOrder,
    });
  } catch (error) {
    console.error('❌ Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get all orders (admin)
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 20, page = 1, status } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const query: any = {};
    if (status) query.status = status;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));

    const total = await Order.countDocuments(query);

    const responseOrders = orders.map(orderToResponse);

    res.status(200).json({
      success: true,
      data: {
        orders: responseOrders,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string)),
        },
      },
    });
  } catch (error) {
    console.error('❌ Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};