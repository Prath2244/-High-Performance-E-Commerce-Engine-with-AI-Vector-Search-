import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useState } from 'react';
import CheckoutModal from './CheckoutModal';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cartItems, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setCheckoutOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white w-full max-w-md h-full shadow-xl flex flex-col slide-in">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Your Cart</h2>
              <p className="text-sm text-gray-500">{totalItems} items</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-gray-300 text-6xl mb-4">🛒</div>
                <h3 className="text-lg font-medium text-gray-900">Your cart is empty</h3>
                <p className="text-sm text-gray-500 mt-1">Start shopping to add items</p>
                <button
                  onClick={onClose}
                  className="mt-4 btn btn-primary btn-md"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id!, item.quantity - 1)}
                      className="p-1 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id!, item.quantity + 1)}
                      className="p-1 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => removeItem(item.id!)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors ml-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="text-lg font-bold text-gray-900">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={clearCart}
                  className="btn btn-secondary flex-1"
                >
                  Clear
                </button>
                <button
                  onClick={handleCheckout}
                  className="btn btn-primary flex-1"
                >
                  Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={() => {
          setCheckoutOpen(false);
          onClose();
        }}
      />
    </>
  );
}