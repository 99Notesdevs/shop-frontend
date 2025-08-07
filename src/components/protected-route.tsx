import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { admin, checkAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      await checkAdmin();
      setIsLoading(false);
    };
    verifyAdmin();
  }, [checkAdmin]);

  if (isLoading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return admin ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

export const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};
