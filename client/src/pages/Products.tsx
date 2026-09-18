import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { fetchProducts, deleteProduct } from '../store/slices/productSlice';
import ProductList from '../components/Products/ProductList';
import ProductForm from '../components/Products/ProductForm';
import ProductSearch from '../components/Products/ProductSearch';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

export default function Products() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { products, loading, pagination } = useSelector((state: RootState) => state.products);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filters, setFilters] = useState({ page: 1, limit: 20, query: '' });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      toast.error('You do not have permission to delete products');
      return;
    }
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await dispatch(deleteProduct(id)).unwrap();
        toast.success('Product deleted successfully');
        dispatch(fetchProducts(filters));
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleSearch = (query: string) => {
    setFilters({ ...filters, query, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="text-gray-500">Manage your product catalog</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary btn-md flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        )}
      </div>

      <ProductSearch onSearch={handleSearch} />

      <ProductList
        products={products}
        loading={loading}
        onEdit={(product) => {
          if (!isAdmin) {
            toast.error('You do not have permission to edit products');
            return;
          }
          setEditingProduct(product);
          setShowForm(true);
        }}
        onDelete={handleDelete}
        pagination={pagination}
        onPageChange={handlePageChange}
        isAdmin={isAdmin}
      />

      {showForm && isAdmin && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          onSuccess={() => {
            dispatch(fetchProducts(filters));
            toast.success(editingProduct ? 'Product updated' : 'Product created');
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
}