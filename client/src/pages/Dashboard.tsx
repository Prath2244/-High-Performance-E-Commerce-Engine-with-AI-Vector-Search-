import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { fetchProducts } from '../store/slices/productSlice';
import { fetchOrders } from '../store/slices/orderSlice';
import Stats from '../components/Dashboard/Stats';
import RecentOrders from '../components/Dashboard/RecentOrders';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Package, ShoppingBag } from 'lucide-react';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { products, loading: productsLoading } = useSelector((state: RootState) => state.products);
  const { orders, loading: ordersLoading } = useSelector((state: RootState) => state.orders);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 10 }));
    dispatch(fetchOrders({ limit: 5 }));
  }, [dispatch]);

  if (productsLoading || ordersLoading) {
    return <LoadingSpinner size="lg" />;
  }

  const stats = {
    totalProducts: products?.length || 0,
    totalOrders: orders?.length || 0,
    totalRevenue: orders?.reduce((sum, order) => sum + order.total, 0) || 0,
    averageOrderValue: orders?.length ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
  };

  const quickActions = [
    { label: 'Add New Product', icon: Package, path: '/products', color: 'bg-blue-50 text-blue-600' },
    { label: 'View All Orders', icon: ShoppingBag, path: '/orders', color: 'bg-green-50 text-green-600' },
    { label: 'Analytics Report', icon: TrendingUp, path: '/analytics', color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500">Welcome back! Here's what's happening with your store.</p>
      </div>

      <Stats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="card lg:col-span-1">
          <div className="card-header">
            <h3 className="font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="card-body space-y-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.path}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{action.label}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <RecentOrders orders={orders || []} />
        </div>
      </div>
    </div>
  );
}