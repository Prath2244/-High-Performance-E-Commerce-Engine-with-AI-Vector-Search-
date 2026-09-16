import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

export const useAuth = () => {
  const { user, token, loading, error } = useSelector((state: RootState) => state.auth);
  
  return {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token && !!user,
  };
};