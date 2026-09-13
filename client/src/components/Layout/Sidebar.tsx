import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Store,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

export default function Sidebar({ open, onToggle }: SidebarProps) {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const adminMenuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const userMenuItems = [
    { path: '/store', icon: Store, label: 'Store' },
    { path: '/cart', icon: ShoppingCart, label: 'Cart' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  return (
    <aside
      className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col fixed lg:relative h-full z-40 ${
        open ? 'w-64' : 'w-0 lg:w-20'
      } overflow-hidden lg:overflow-visible`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
        {open && (
          <span className="text-xl font-bold text-blue-600 whitespace-nowrap">E‑Commerce</span>
        )}
        <button
          onClick={onToggle}
          className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
            open ? 'ml-auto' : 'mx-auto'
          }`}
        >
          {open ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } ${!open && 'justify-center'}`}
              title={!open ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {open && <span className="text-sm font-medium">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        {open ? (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex justify-center p-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>
    </aside>
  );
}