import { Product } from '../../types';
import { Edit, Trash2, Eye } from 'lucide-react';
import Pagination from '../Common/Pagination';
import LoadingSpinner from '../Common/LoadingSpinner';

interface ProductListProps {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onPageChange: (page: number) => void;
  isAdmin?: boolean;
}

export default function ProductList({
  products,
  loading,
  onEdit,
  onDelete,
  pagination,
  onPageChange,
  isAdmin = false,
}: ProductListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const safeToFixed = (value: any, digits: number = 2): string => {
    const num = typeof value === 'number' ? value : parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(digits);
  };

  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Brand
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              {isAdmin && (
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="px-4 py-8 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name || 'Unnamed'}</p>
                      <p className="text-xs text-gray-500 truncate max-w-xs">{product.description || ''}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                      {product.category || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.brand || '-'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                    ${safeToFixed(product.price)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm ${(product.stock || 0) < 20 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                      {product.stock || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-sm text-gray-600">{safeToFixed(product.rating, 1)}</span>
                      <span className="text-xs text-gray-400">({product.reviews || 0})</span>
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(product)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(product.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {pagination.pages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}