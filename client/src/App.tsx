import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import OrderDetailPage from './pages/OrderDetailPage'; // new import
import Customers from './pages/Customers';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Store from './pages/Store';
import LoadingSpinner from './components/Common/LoadingSpinner';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner size="lg" />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner size="lg" />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/store" replace />;
  return <>{children}</>;
}

function App() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        {isAdmin ? (
          <>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:orderId" element={<OrderDetailPage />} /> {/* ✅ new route */}
            <Route
              path="customers"
              element={
                <AdminRoute>
                  <Customers />
                </AdminRoute>
              }
            />
            <Route
              path="analytics"
              element={
                <AdminRoute>
                  <Analytics />
                </AdminRoute>
              }
            />
          </>
        ) : (
          <>
            <Route index element={<Navigate to="/store" replace />} />
            <Route path="store" element={<Store />} />
            <Route path="cart" element={<Store />} />
          </>
        )}

        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;