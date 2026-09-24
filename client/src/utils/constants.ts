export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
};

export const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  { value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

export const CATEGORIES = [
  'Electronics',
  'Apparel',
  'Home & Kitchen',
  'Books',
  'Toys',
  'Beauty',
  'Sports',
];

export const PAYMENT_METHODS = [
  { value: 'card', label: 'Credit Card' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'bank', label: 'Bank Transfer' },
];

export const CACHE_TTL = 3600; // 1 hour in seconds