import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Image, Users, FileText, Lock } from 'lucide-react';

const AdminLogin = ({ onLogin }: { onLogin: (password: string) => boolean }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin(password)) {
      setError('');
    } else {
      setError('סיסמה שגויה');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Lock className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-assistant">כניסה למערכת ניהול</CardTitle>
          <CardDescription className="font-open-sans">
            הזינו סיסמה לגישה לממשק הניהול
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="סיסמה"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-right"
                dir="rtl"
              />
              {error && (
                <p className="text-sm text-destructive text-right">{error}</p>
              )}
            </div>
            <Button type="submit" className="w-full font-assistant">
              כניסה
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              סיסמה זמנית: admin
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const AdminDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const adminSections = [
    {
      title: 'ניהול פתרונות עסקיים',
      description: 'עריכת התוכן, התמונות והקישורים של הסקשן',
      icon: Image,
      href: '/admin/solutions',
      color: 'text-blue-600'
    },
    {
      title: 'ניהול לקוחות',
      description: 'עדכון פרטי לקוחות והמלצות (בקרוב)',
      icon: Users,
      href: '#',
      color: 'text-green-600',
      disabled: true
    },
    {
      title: 'ניהול תוכן',
      description: 'עריכת טקסטים ותוכן כללי (בקרוב)',
      icon: FileText,
      href: '#',
      color: 'text-purple-600',
      disabled: true
    },
    {
      title: 'הגדרות מערכת',
      description: 'הגדרות כלליות ותצורות (בקרוב)',
      icon: Settings,
      href: '#',
      color: 'text-orange-600',
      disabled: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="text-right">
            <h1 className="text-3xl font-assistant font-bold text-primary mb-2">
              ממשק ניהול
            </h1>
            <p className="text-muted-foreground font-open-sans">
              ניהול תוכן האתר ופתרונות עסקיים
            </p>
          </div>
          <Button variant="outline" onClick={onLogout} className="font-assistant">
            יציאה
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => {
            const IconComponent = section.icon;
            
            if (section.disabled) {
              return (
                <Card key={section.title} className="opacity-50 cursor-not-allowed">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <IconComponent className={`h-6 w-6 ${section.color}`} />
                      <CardTitle className="text-lg font-assistant text-right">
                        {section.title}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-right font-open-sans">
                      {section.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            }

            return (
              <Link key={section.title} to={section.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <IconComponent className={`h-6 w-6 ${section.color} group-hover:scale-110 transition-transform`} />
                      <CardTitle className="text-lg font-assistant text-right">
                        {section.title}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-right font-open-sans">
                      {section.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const AdminIndex = () => {
  const { isAuthenticated, isLoading, login, logout } = useAdminAuth();

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
    return <AdminLogin onLogin={login} />;
  }

  return <AdminDashboard onLogout={logout} />;
};

export default AdminIndex;