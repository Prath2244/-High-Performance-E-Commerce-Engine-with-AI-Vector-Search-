import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { fetchProducts } from '../store/slices/productSlice';
import { useCart } from '../hooks/useCart';
import { Search, ShoppingBag, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import CartDrawer from '../components/Cart/CartDrawer';
import ErrorBoundary from '../components/Common/ErrorBoundary';

const categoryIcons: { [key: string]: string } = {
  'Electronics': '💻',
  'Apparel': '👕',
  'Home & Kitchen': '🏠',
  'Books, Media & Stationery': '📚',
  'Beauty & Personal Care': '💄',
  'Health & Wellness': '💪',
  'Groceries & Food': '🍎',
  'Toys, Kids & Baby Products': '🧸',
  'Sports & Outdoors': '⚽',
  'Automotive & Industrial': '🚗',
};

export default function Store() {
  const dispatch = useDispatch();
  const { products, loading: productsLoading, error: productsError } = useSelector((state: RootState) => state.products);
  const { addToCart, totalItems, loading: cartLoading, error: cartError } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (cartError) toast.error(cartError);
  }, [cartError]);

  const handleAddToCart = (product: any) => {
    if (product.stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }
    addToCart(product.id, 1);
    toast.success(`Added ${product.name} to cart`, { duration: 1000 });
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(products.map(p => p.category))];

  if (productsLoading) return <LoadingSpinner size="lg" className="py-12" />;
  if (productsError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">Error loading products</h3>
        <p className="text-gray-500">{productsError}</p>
        <button onClick={() => dispatch(fetchProducts({ limit: 100 }))} className="mt-4 btn btn-primary btn-md">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Shop</h2>
            <p className="text-gray-500">Browse and discover products</p>
          </div>
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ShoppingBag className="h-6 w-6 text-gray-600" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No products found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="card hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-100 rounded-t-lg overflow-hidden flex items-center justify-center">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // On image fail, show fallback emoji
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `<span class="text-6xl">${categoryIcons[product.category] || '📦'}</span>`;
                        }
                      }}
                    />
                  ) : (
                    <span className="text-6xl">{categoryIcons[product.category] || '📦'}</span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {product.category}
                    </span>
                    <span className="text-xs text-amber-500 flex items-center gap-1">
                      ⭐ {product.rating?.toFixed(1) || '0'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mt-2 line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <span className="text-lg font-bold text-gray-900">
                      ${typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
                    </span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0 || cartLoading}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        product.stock > 0
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      </div>
    </ErrorBoundary>
  );
}