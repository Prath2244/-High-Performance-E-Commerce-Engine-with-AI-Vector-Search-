import { Order } from '../../types';
import { format } from 'date-fns';
import { X } from 'lucide-react';

interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
  onStatusChange?: (orderId: string, status: string) => void;
}

export default function OrderDetails({ order, onClose, onStatusChange }: OrderDetailsProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
            <p className="text-sm text-gray-500">{order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Order Status</p>
              {onStatusChange ? (
                <select
                  value={order.status}
                  onChange={(e) => onStatusChange(order.id, e.target.value)}
                  className={`mt-1 px-3 py-1.5 text-sm rounded-lg border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(order.status)}`}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              ) : (
                <span className={`mt-1 inline-block px-3 py-1.5 text-sm rounded-lg ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="text-sm font-medium text-gray-900">
                {format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items?.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                        No items in this order
                      </td>
                    </tr>
                  ) : (
                    order.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-600 text-right">${item.price.toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm text-gray-600 text-right">{item.quantity}</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                          ${item.subtotal.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-sm font-medium text-gray-700 text-right">
                      Subtotal
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                      ${order.subtotal.toFixed(2)}
                    </td>
                  </tr>
                  {order.discount > 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-sm font-medium text-green-600 text-right">
                        Discount ({order.discountCode})
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-green-600 text-right">
                        -${order.discount.toFixed(2)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-base font-bold text-gray-900 text-right">
                      Total
                    </td>
                    <td className="px-4 py-3 text-base font-bold text-gray-900 text-right">
                      ${order.total.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{order.shippingAddress?.street}</p>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                </p>
                <p className="text-sm text-gray-600">{order.shippingAddress?.country}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Payment Information</h3>
              <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Method:</span> {order.paymentMethod}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Status:</span>{' '}
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button onClick={onClose} className="btn btn-secondary btn-md">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}