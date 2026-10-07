export const CACHE_KEYS = {
  product: (id: string) => `product:${id}`,
  products: (page: number = 1, limit: number = 20, category?: string) => {
    const base = `products:page:${page}:limit:${limit}`;
    return category ? `${base}:category:${category}` : base;
  },
  productsAll: 'products:all',
  search: (query: string) => `search:${query.toLowerCase().trim()}`,
  cart: (userId: string) => `cart:${userId}`,
  session: (sessionId: string) => `session:${sessionId}`,
  pattern: {
    products: 'products:*',
    search: 'search:*',
    product: (id?: string) => id ? `product:${id}` : 'product:*',
  }
};

export const generateCacheKey = (prefix: string, ...parts: (string | number)[]): string => {
  return `${prefix}:${parts.join(':')}`;
};

export const getCacheTTL = (): number => {
  return parseInt(process.env.CACHE_TTL || '3600', 10);
};