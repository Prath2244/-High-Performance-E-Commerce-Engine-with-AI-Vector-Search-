import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';

// Get sales report
export const getSalesReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, interval = 'day' } = req.query;

    const match: any = {};
    if (startDate) match.createdAt = { $gte: new Date(startDate as string) };
    if (endDate) match.createdAt = { $lte: new Date(endDate as string) };

    const salesData = await Order.aggregate([
      { $match: { ...match, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: interval === 'month' ? '%Y-%m' : '%Y-%m-%d',
                date: '$createdAt'
              }
            }
          },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          totalDiscount: { $sum: '$discount' },
          averageOrderValue: { $avg: '$total' }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: salesData
    });
  } catch (error) {
    console.error('❌ Sales report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating sales report'
    });
  }
};

// Get top selling products
export const getTopSellingProducts = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: parseInt(limit as string) },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: { path: '$productDetails', preserveNullAndEmptyArrays: true } }
    ]);

    res.status(200).json({
      success: true,
      data: topProducts
    });
  } catch (error) {
    console.error('❌ Top products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting top products'
    });
  }
};

// Get customer analytics
export const getCustomerAnalytics = async (req: Request, res: Response) => {
  try {
    const analytics = await User.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'userId',
          as: 'orders'
        }
      },
      {
        $addFields: {
          orderCount: { $size: '$orders' },
          totalSpent: {
            $sum: '$orders.total'
          },
          lastOrderDate: { $max: '$orders.createdAt' }
        }
      },
      {
        $match: { orderCount: { $gt: 0 } }
      },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          averageOrderValue: { $avg: '$totalSpent' },
          averageOrdersPerCustomer: { $avg: '$orderCount' },
          totalRevenue: { $sum: '$totalSpent' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: analytics[0] || {}
    });
  } catch (error) {
    console.error('❌ Customer analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting customer analytics'
    });
  }
};