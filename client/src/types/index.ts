// ============================================================
//  USER & AUTH
// ============================================================
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  cart: CartItem[];
  wishlist: string[];
  lastLogin?: Date | string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'user';
  phone?: string;
}

// ============================================================
//  PRODUCT
// ============================================================
export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  rating: number;
  reviews: number;
  description: string;
  tags: string[];
  featured: boolean;
  vector?: number[];
  image?: string;          // ✅ image field (optional)
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
  query?: string;
}

// ============================================================
//  CART
// ============================================================
export interface CartItem {
  id?: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  stock?: number;
  available?: boolean;
}

// ============================================================
//  ORDER
// ============================================================
export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountCode?: string;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

// ============================================================
//  DISCOUNT
// ============================================================
export interface Discount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount: number;
  active: boolean;
  applicableCategories?: string[];
  applicableProducts?: string[];
  userIds?: string[];
}

// ============================================================
//  API RESPONSE WRAPPERS
// ============================================================
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  error: string | null;
}