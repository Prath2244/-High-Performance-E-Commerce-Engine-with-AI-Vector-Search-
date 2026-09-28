import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 1. Total Revenue, Orders, etc.
    const orderStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' },
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$total' },
        },
      },
    ]);

    // 2. Daily sales (for chart)
    const dailySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' },
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 3. Category distribution (from order items) – now works with ObjectId
    const categorySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' },
          paymentStatus: 'paid',
        },
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$product.category',
          value: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { value: -1 } },
    ]);

    // 4. Monthly trend (for line chart)
    const monthlyTrend = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' },
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 5. Conversion rate (visitors vs orders)
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments({
      status: { $ne: 'cancelled' },
      paymentStatus: 'paid',
    });
    const conversionRate = totalUsers > 0 ? +((totalOrders / totalUsers) * 100).toFixed(2) : 0;

    const stats = orderStats[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
    };

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: stats.totalRevenue || 0,
        totalOrders: stats.totalOrders || 0,
        avgOrderValue: stats.avgOrderValue || 0,
        conversionRate,
        sales: dailySales.map(d => ({
          date: d._id,
          revenue: d.revenue,
          orders: d.orders,
        })),
        categories: categorySales.map(c => ({
          name: c._id || 'Uncategorized',
          value: c.value,
        })),
        monthly: monthlyTrend.map(m => ({
          month: m._id,
          revenue: m.revenue,
          orders: m.orders,
        })),
      },
    });
  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating analytics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};