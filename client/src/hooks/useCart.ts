import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import {
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
  fetchCart,
} from '../store/slices/cartSlice';
import { useAuth } from './useAuth';
import { useEffect } from 'react';

export const useCart = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { items, loading, error, totalItems, totalPrice } = useSelector(
    (state: RootState) => state.cart
  );

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCart(user.id));
    }
  }, [dispatch, user]);

  const addItem = (productId: string, quantity: number = 1) => {
    if (user?.id) {
      dispatch(addToCart({ userId: user.id, productId, quantity }));
    } else {
      console.warn('Cannot add to cart: user not authenticated');
    }
  };

  const updateItem = (productId: string, quantity: number) => {
    if (user?.id) {
      dispatch(updateCartItem({ userId: user.id, productId, quantity }));
    }
  };

  const removeItem = (productId: string) => {
    if (user?.id) {
      dispatch(removeFromCart({ userId: user.id, productId }));
    }
  };

  const clearAll = () => {
    if (user?.id) {
      dispatch(clearCart(user.id));
    }
  };

  return {
    cartItems: items,
    totalItems,
    totalPrice,
    loading,
    error,
    addToCart: addItem,
    updateQuantity: updateItem,
    removeItem,
    clearCart: clearAll,
  };
};