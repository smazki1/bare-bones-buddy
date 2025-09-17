import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Users, MessageSquare, HelpCircle, FileText, Plus, Settings, BarChart3, Image } from 'lucide-react';

interface DashboardStats {
  testimonials: number;
  clients: number;
  faq: number;
  services: number;
  projects: number;
  loading: boolean;
  error: string | null;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    testimonials: 0,
    clients: 0,
    faq: 0,
    services: 0,
    projects: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));
      
      const [testimonials, clients, faq, services, projects] = await Promise.all([
        supabase.from('testimonials').select('*', { count: 'exact', head: true }),
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('faq').select('*', { count: 'exact', head: true }),
        supabase.from('services').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true })
      ]);

      // Check for errors in any of the queries
      const errors = [testimonials.error, clients.error, faq.error, services.error, projects.error].filter(Boolean);
      if (errors.length > 0) {
        throw new Error(`Failed to fetch stats: ${errors[0]?.message}`);
      }

      setStats({
        testimonials: testimonials.count || 0,
        clients: clients.count || 0,
        faq: faq.count || 0,
        services: services.count || 0,
        projects: projects.count || 0,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'שגיאה בטעינת הנתונים'
      }));
    }
  };

  const statCards = [
    { 
      title: 'פרויקטים',
      value: stats.projects,
      icon: Image, 
      href: '/admin/projects',
      description: 'פרויקטים לפני ואחרי'
    },
    { 
      title: 'לקוחות', 
      value: stats.clients, 
      icon: Users, 
      href: '/admin/clients',
      description: 'סה"כ לקוחות רשומים'
    },
    { 
      title: 'המלצות', 
      value: stats.testimonials, 
      icon: MessageSquare, 
      href: '/admin/testimonials',
      description: 'המלצות פעילות'
    },
    { 
      title: 'שאלות ותשובות', 
      value: stats.faq, 
      icon: HelpCircle, 
      href: '/admin/faq',
      description: 'שאלות נפוצות'
    }
  ];

  const quickLinks = [
    {
      title: 'הוסף פרויקט חדש',
      description: 'העלה תמונות לפני ואחרי חדשות',
      href: '/admin/projects',
      icon: Plus
    },
    {
      title: 'נהל תמונות Hero',
      description: 'עדכן תמונות רקע בעמוד הראשי',
      href: '/admin/hero-images',
      icon: Image
    },
    {
      title: 'נהל המלצות',
      description: 'הוסף והסר המלצות לקוחות',
      href: '/admin/testimonials',
      icon: MessageSquare
    },
    {
      title: 'עדכן שאלות נפוצות',
      description: 'ערוך וסדר שאלות ותשובות',
      href: '/admin/faq',
      icon: HelpCircle
    },
    {
      title: 'הגדרות מערכת',
      description: 'הגדרות כלליות ותצורה',
      href: '/admin/settings',
      icon: Settings
    }
  ];

  if (stats.error) {
    return (
      <AdminLayout title="לוח בקרה">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">שגיאה בטעינת הנתונים</h3>
            <p className="text-muted-foreground text-center mb-4">{stats.error}</p>
            <Button onClick={fetchStats} variant="outline">
              נסה שוב
            </Button>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="לוח בקרה">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-foreground font-assistant">סקירה כללית</h2>
          <p className="text-muted-foreground font-open-sans">
            סטטיסטיקות ופעולות מהירות במערכת הניהול
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} to={card.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium font-open-sans flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold font-assistant mb-1">
                      {stats.loading ? (
                        <div className="animate-pulse bg-muted h-8 w-12 rounded"></div>
                      ) : (
                        card.value
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-open-sans">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-assistant flex items-center gap-2">
              <Settings className="h-5 w-5" />
              פעולות מהירות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <Link key={link.title} to={link.href}>
                    <div className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <IconComponent className="h-5 w-5 text-primary" />
                        <h4 className="font-medium font-assistant">{link.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground font-open-sans">
                        {link.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Welcome Section */}
        <Card>
          <CardHeader>
            <CardTitle className="font-assistant">ברוכים הבאים למערכת הניהול של Food Vision</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground font-open-sans space-y-2">
              <p>מערכת ניהול מתקדמת לניהול לקוחות ותוכן האתר.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h5 className="font-medium text-foreground mb-2">ניהול לקוחות</h5>
                  <ul className="text-sm space-y-1">
                    <li>• הוספה ועריכה של פרטי לקוחות</li>
                    <li>• מעקב אחר סטטוס לקוחות</li>
                    <li>• ניהול פרטי התקשרות</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-foreground mb-2">ניהול תוכן</h5>
                  <ul className="text-sm space-y-1">
                    <li>• ניהול המלצות לקוחות</li>
                    <li>• עדכון שאלות ותשובות</li>
                    <li>• הגדרות מערכת כלליות</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}