import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Image, Tag, MessageSquare, HelpCircle, Users, FileText } from 'lucide-react';

interface DashboardStats {
  projects: number;
  categories: number;
  services: number;
  testimonials: number;
  faq: number;
  clients: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    projects: 0,
    categories: 0,
    services: 0,
    testimonials: 0,
    faq: 0,
    clients: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [projects, categories, services, testimonials, faq, clients] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('services').select('*', { count: 'exact', head: true }),
        supabase.from('testimonials').select('*', { count: 'exact', head: true }),
        supabase.from('faq').select('*', { count: 'exact', head: true }),
        supabase.from('clients').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        projects: projects.count || 0,
        categories: categories.count || 0,
        services: services.count || 0,
        testimonials: testimonials.count || 0,
        faq: faq.count || 0,
        clients: clients.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'פרויקטים', value: stats.projects, icon: Image, href: '/admin/projects' },
    { title: 'קטגוריות', value: stats.categories, icon: Tag, href: '/admin/categories' },
    { title: 'המלצות לקוחות', value: stats.testimonials, icon: MessageSquare, href: '/admin/testimonials' },
    { title: 'שאלות ותשובות', value: stats.faq, icon: HelpCircle, href: '/admin/faq' },
    { title: 'לקוחות', value: stats.clients, icon: Users, href: '/admin/clients' },
    { title: 'שירותים', value: stats.services, icon: FileText, href: '/admin/services' }
  ];

  return (
    <AdminLayout title="סקירה כללית">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-assistant">לוח בקרה</h2>
          <p className="text-muted-foreground font-open-sans">
            סקירה כללית של מערכת הניהול
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <Card key={card.title} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium font-open-sans flex items-center gap-2">
                    <IconComponent className="h-4 w-4 text-primary" />
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-assistant">
                    {loading ? '...' : card.value}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="font-assistant">פעילות אחרונה</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground font-open-sans py-8">
              <p>פעילות אחרונה תוצג כאן</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}