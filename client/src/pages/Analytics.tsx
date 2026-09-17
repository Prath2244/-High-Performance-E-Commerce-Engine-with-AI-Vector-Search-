import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { fetchAnalytics } from '../store/slices/analyticsSlice';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Calendar, Download, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function Analytics() {
  const { user, loading: authLoading } = useAuth();
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state: RootState) => state.analytics);
  const [dateRange, setDateRange] = useState('30');

  // Redirect if not admin
  if (!authLoading && user?.role !== 'admin') {
    return <Navigate to="/store" replace />;
  }

  useEffect(() => {
    if (user?.role === 'admin') {
      dispatch(fetchAnalytics({ days: parseInt(dateRange) }));
    }
  }, [dispatch, dateRange, user]);

  if (loading) return <LoadingSpinner size="lg" />;
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">Error loading analytics</h3>
        <p className="text-gray-500">{error}</p>
        <button
          onClick={() => dispatch(fetchAnalytics({ days: parseInt(dateRange) }))}
          className="mt-4 btn btn-primary btn-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  const salesData = data?.sales || [];
  const categoryData = data?.categories || [];
  const monthlyData = data?.monthly || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-500">Track your store performance</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input py-1.5 text-sm w-36"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button className="btn btn-secondary btn-md flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900">${data?.totalRevenue?.toFixed(2) || '0.00'}</p>
          <p className="text-sm text-green-600 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            +12.5% from last period
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{data?.totalOrders || 0}</p>
          <p className="text-sm text-green-600 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            +8.3% from last period
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Average Order Value</p>
          <p className="text-2xl font-bold text-gray-900">${data?.avgOrderValue?.toFixed(2) || '0.00'}</p>
          <p className="text-sm text-gray-500">Across all orders</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Conversion Rate</p>
          <p className="text-2xl font-bold text-gray-900">{data?.conversionRate || 0}%</p>
          <p className="text-sm text-red-600 flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            -2.1% from last period
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Revenue Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Sales by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Daily Sales */}
      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Daily Sales</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#3b82f6" />
              <Bar dataKey="orders" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}