import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Image, Users, FileText, Lock, Mail } from 'lucide-react';
import { AdminUserManager } from '@/components/admin/AdminUserManager';

const AdminLogin = ({ onSignIn }: { onSignIn: (email: string, password: string) => Promise<{ error: any }> }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const { error } = await onSignIn(email, password);
    
    if (error) {
      setError(error.message || 'שגיאה בהתחברות');
    }
    
    setIsLoading(false);
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
                type="email"
                placeholder="כתובת אימייל"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-right"
                dir="rtl"
                required
              />
              <Input
                type="password"
                placeholder="סיסמה"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-right"
                dir="rtl"
                required
              />
              {error && (
                <p className="text-sm text-destructive text-right">{error}</p>
              )}
            </div>
            <Button type="submit" className="w-full font-assistant" disabled={isLoading}>
              {isLoading ? 'מתחבר...' : 'כניסה'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              כניסה עם חשבון מנהל מאושר בלבד
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const AdminDashboard = ({ onLogout, userEmail }: { onLogout: () => void; userEmail?: string }) => {
  const adminSections = [
    {
      title: 'ניהול לקוחות',
      description: 'ניהול לקוחות, התמונות שלהם וחיסכון חודשי',
      icon: Users,
      href: '/admin/clients',
      color: 'text-indigo-600'
    },
    {
      title: 'ניהול הלקוחות שלנו',
      description: 'ניהול הכרטיסים: תמונה, כותרת, קישורי רשתות וסדר תצוגה',
      icon: Users,
      href: '/admin/testimonials',
      color: 'text-pink-600'
    },
    {
      title: 'ניהול פתרונות עסקיים',
      description: 'עריכת התוכן, התמונות והקישורים של הסקשן',
      icon: Image,
      href: '/admin/solutions',
      color: 'text-blue-600'
    },
    {
      title: 'ניהול פתרונות ויזואליים',
      description: 'עריכת הקלפים בסקציה "מה אפשר ליצור איתנו"',
      icon: Settings,
      href: '/admin/visual-solutions',
      color: 'text-purple-600'
    },
    {
      title: 'ניהול שווקי מזון',
      description: 'עריכת התגיות והקישורים של סקשן השווקים',
      icon: Users,
      href: '/admin/markets',
      color: 'text-green-600'
    },
    {
      title: 'ניהול קטלוג הפרויקטים',
      description: 'העלאה ועריכה של פרויקטים עם תמונות לפני ואחרי',
      icon: Image,
      href: '/admin/portfolio',
      color: 'text-purple-600'
    },
    {
      title: 'ניהול תוכן',
      description: 'עריכת טקסטים ותוכן כללי (בקרוב)',
      icon: FileText,
      href: '#',
      color: 'text-orange-600',
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
            {userEmail && (
              <p className="text-sm text-muted-foreground font-open-sans flex items-center gap-2 mt-2">
                <Mail className="h-4 w-4" />
                מחובר כ: {userEmail}
              </p>
            )}
          </div>
          <Button variant="outline" onClick={onLogout} className="font-assistant">
            יציאה
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

        {/* Admin User Management - Only for super admin */}
        {userEmail === 'admin@food-vision.co.il' && (
          <AdminUserManager currentUserEmail={userEmail} />
        )}

        {/* Admin Token Settings for Edge Functions */}
        <AdminSettings />
      </div>
    </div>
  );
};

const AdminSettings = () => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    try {
      setUrl(localStorage.getItem('aiMaster:supabaseUrl') || '');
      setKey(localStorage.getItem('aiMaster:supabaseAnon') || '');
      setToken(localStorage.getItem('aiMaster:adminToken') || '');
    } catch {}
  }, []);

  const save = () => {
    try {
      if (url) localStorage.setItem('aiMaster:supabaseUrl', url);
      if (key) localStorage.setItem('aiMaster:supabaseAnon', key);
      if (token) localStorage.setItem('aiMaster:adminToken', token);
      window.alert('הוגדרו מפתחות ניהול בהצלחה');
    } catch {
      window.alert('שגיאה בשמירה');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-assistant">הגדרות ניהול (דפדפן זה)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <input className="w-full border border-input bg-background text-foreground placeholder:text-muted-foreground px-2 py-1 text-sm" placeholder="SUPABASE_URL" value={url} onChange={e => setUrl(e.target.value)} />
        <input className="w-full border border-input bg-background text-foreground placeholder:text-muted-foreground px-2 py-1 text-sm" placeholder="SUPABASE_ANON_KEY" value={key} onChange={e => setKey(e.target.value)} />
        <input className="w-full border border-input bg-background text-foreground placeholder:text-muted-foreground px-2 py-1 text-sm" placeholder="ADMIN_TOKEN" value={token} onChange={e => setToken(e.target.value)} />
        <Button size="sm" onClick={save} className="font-assistant text-xs">שמור</Button>
      </CardContent>
    </Card>
  );
};

const AdminIndex = () => {
  const { user, isLoading, isAdmin, signIn, signOut } = useSupabaseAuth();

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
    return <AdminLogin onSignIn={signIn} />;
  }

  return <AdminDashboard onLogout={signOut} userEmail={user.email} />;
};

export default AdminIndex;