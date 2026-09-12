import { Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';

interface StatsProps {
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  };
}

export default function Stats({ stats }: StatsProps) {
  const statItems = [
    {
      label: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'blue',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'green',
    },
    {
      label: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'purple',
    },
    {
      label: 'Average Order Value',
      value: `$${stats.averageOrderValue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'amber',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item) => (
        <div key={item.label} className="card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${colorClasses[item.color as keyof typeof colorClasses]}`}>
              <item.icon className="h-5 w-5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}