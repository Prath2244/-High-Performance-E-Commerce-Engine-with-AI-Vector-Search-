import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { fetchCustomers } from '../store/slices/customerSlice';
import { Search, Mail, Phone, MapPin, Users, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Pagination from '../components/Common/Pagination';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Customers() {
  const { user, loading: authLoading } = useAuth();
  const dispatch = useDispatch();
  const { customers, loading, pagination, error } = useSelector((state: RootState) => state.customers);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ page: 1, limit: 20 });

  // Redirect if not admin
  if (!authLoading && user?.role !== 'admin') {
    return <Navigate to="/store" replace />;
  }

  useEffect(() => {
    if (user?.role === 'admin') {
      dispatch(fetchCustomers({ ...filters, search: searchQuery }));
    }
  }, [dispatch, filters, searchQuery, user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  if (loading) return <LoadingSpinner size="lg" />;
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">Error loading customers</h3>
        <p className="text-gray-500">{error}</p>
        <button
          onClick={() => dispatch(fetchCustomers(filters))}
          className="mt-4 btn btn-primary btn-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
          <p className="text-gray-500">Manage your customer base</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            <Users className="h-4 w-4 inline mr-1" />
            {pagination.total} total
          </span>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers by name or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <button type="submit" className="btn btn-primary btn-md">
          Search
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No customers found
          </div>
        ) : (
          customers.map((customer) => (
            <div key={customer.id} className="card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-lg">
                    {customer.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                    <p className="text-sm text-gray-500">{customer.email}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  customer.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {customer.role}
                </span>
              </div>
              
              <div className="mt-3 space-y-1 text-sm">
                {customer.phone && (
                  <p className="text-gray-600 flex items-center gap-2">
                    <Phone className="h-3 w-3 text-gray-400" />
                    {customer.phone}
                  </p>
                )}
                {customer.address && (
                  <p className="text-gray-600 flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    {customer.address.city}, {customer.address.country}
                  </p>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Joined {new Date(customer.createdAt).toLocaleDateString()}</span>
                <span>{customer.orderCount || 0} orders</span>
              </div>
            </div>
          ))
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}