import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/client';
import { CartItem } from '../../types';

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  totalPrice: number;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
  totalItems: 0,
  totalPrice: 0,
};

export const fetchCart = createAsyncThunk(
  'cart/fetch',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/cart/${userId}`);
      return response.data.data; // { items, total, itemCount }
    } catch (error: any) {
      console.error('Fetch cart error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/add',
  async ({ userId, productId, quantity = 1 }: { userId: string; productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/cart/${userId}`, { productId, quantity });
      return response.data.data;
    } catch (error: any) {
      console.error('Add to cart error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/update',
  async ({ userId, productId, quantity }: { userId: string; productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/cart/${userId}/${productId}`, { quantity });
      return response.data.data;
    } catch (error: any) {
      console.error('Update cart error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/remove',
  async ({ userId, productId }: { userId: string; productId: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(`/cart/${userId}/${productId}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Remove from cart error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clear',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(`/cart/${userId}/clear`);
      return response.data.data;
    } catch (error: any) {
      console.error('Clear cart error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.totalItems = action.payload.itemCount || 0;
        state.totalPrice = action.payload.total || 0;
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // keep existing items if any
      })
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.totalItems = action.payload.itemCount || 0;
        state.totalPrice = action.payload.total || 0;
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.totalItems = action.payload.itemCount || 0;
        state.totalPrice = action.payload.total || 0;
        state.error = null;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.totalItems = action.payload.itemCount || 0;
        state.totalPrice = action.payload.total || 0;
        state.error = null;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.totalItems = 0;
        state.totalPrice = 0;
        state.error = null;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = cartSlice.actions;
export default cartSlice.reducer;