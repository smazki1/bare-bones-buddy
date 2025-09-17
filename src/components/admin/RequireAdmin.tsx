import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export function RequireAdmin() {
  const { user, isAdmin, isLoading, error } = useSupabaseAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-open-sans">טוען...</p>
          {error && (
            <div className="mt-4 text-sm text-destructive bg-destructive/10 p-3 rounded-lg max-w-md mx-auto">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname, error }} />;
  }

  return <Outlet />;
}