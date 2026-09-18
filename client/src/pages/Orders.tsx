import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { fetchOrders, updateOrderStatus, fetchOrderById } from '../store/slices/orderSlice';
import OrderList from '../components/Orders/OrderList';
import OrderDetails from '../components/Orders/OrderDetails';
import { Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';

export default function Orders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orderId } = useParams(); // For detail view
  const { orders, loading, pagination, selectedOrder } = useSelector((state: RootState) => state.orders);
  const [filters, setFilters] = useState({ page: 1, limit: 20, status: '' });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    dispatch(fetchOrders(filters));
  }, [dispatch, filters]);

  // If orderId param exists, fetch that order and show details
  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId)).unwrap()
        .then(() => setShowDetails(true))
        .catch(() => {
          toast.error('Order not found');
          navigate('/orders');
        });
    }
  }, [orderId, dispatch, navigate]);

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await dispatch(updateOrderStatus({ orderId, status })).unwrap();
      toast.success('Order status updated');
      dispatch(fetchOrders(filters));
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleStatusFilter = (status: string) => {
    setFilters({ ...filters, status, page: 1 });
  };

  const handleViewOrder = (id: string) => {
    navigate(`/orders/${id}`);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    navigate('/orders');
  };

  const statuses = ['', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
          <p className="text-gray-500">Manage customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filters.status}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="input py-1.5 text-sm w-36"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All Status'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <OrderList
        orders={orders}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onStatusChange={handleStatusChange}
        onViewOrder={handleViewOrder}
      />

      {showDetails && selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          onClose={handleCloseDetails}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}