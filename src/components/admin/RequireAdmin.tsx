import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export function RequireAdmin() {
  const { user, isAdmin, isLoading } = useSupabaseAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-open-sans">טוען...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    // Redirect to login, preserving the attempted path to avoid loops and allow post-login return
    if (location.pathname !== '/admin/login') {
      return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
    }
  }

  return <Outlet />;
}


