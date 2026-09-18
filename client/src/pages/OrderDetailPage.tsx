import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { fetchOrderById, clearSelectedOrder } from '../store/slices/orderSlice';
import OrderDetails from '../components/Orders/OrderDetails';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedOrder, loading, error } = useSelector((state: RootState) => state.orders);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId));
    }
    return () => {
      dispatch(clearSelectedOrder());
    };
  }, [dispatch, orderId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => navigate('/orders')}
          className="mt-4 btn btn-primary btn-md"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  if (!selectedOrder) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found</p>
        <button
          onClick={() => navigate('/orders')}
          className="mt-4 btn btn-primary btn-md"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </button>
      <OrderDetails
        order={selectedOrder}
        onClose={() => navigate('/orders')}
        onStatusChange={(orderId, status) => {
          // Update status – you can dispatch updateOrderStatus here
          // For simplicity, we'll just navigate back and let the list refresh
          navigate('/orders');
        }}
      />
    </div>
  );
}