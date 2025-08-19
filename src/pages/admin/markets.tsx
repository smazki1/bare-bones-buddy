import { Link } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import AdminMarketsEditor from '@/components/admin/markets/AdminMarketsEditor';

const AdminMarketsPage = () => {
  const { isAuthenticated, isLoading } = useAdminAuth();

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-assistant font-bold text-primary mb-4">
            נדרשת הרשאה
          </h1>
          <p className="text-muted-foreground font-open-sans mb-6">
            יש להתחבר כדי לגשת לעמוד זה
          </p>
          <Link to="/admin">
            <Button className="font-assistant">
              חזרה לעמוד הכניסה
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin">
            <Button variant="outline" size="icon">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <div className="text-right">
            <h1 className="text-3xl font-assistant font-bold text-primary mb-2">
              ניהול שווקי מזון
            </h1>
            <p className="text-muted-foreground font-open-sans">
              עריכת התגיות והקישורים של סקשן השווקים
            </p>
          </div>
        </div>

        <AdminMarketsEditor />
      </div>
    </div>
  );
};

export default AdminMarketsPage;