import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export default function AdminIndex() {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading } = useSupabaseAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user && isAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/admin/login', { replace: true });
      }
    }
  }, [user, isAdmin, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground font-open-sans">טוען...</p>
      </div>
    </div>
  );
}