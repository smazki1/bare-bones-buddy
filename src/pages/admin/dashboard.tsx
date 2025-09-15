import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, MessageSquare, HelpCircle, FileText } from 'lucide-react';

interface DashboardStats {
  testimonials: number;
  clients: number;
  faq: number;
  services: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    testimonials: 0,
    clients: 0,
    faq: 0,
    services: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [testimonials, clients, faq, services] = await Promise.all([
        supabase.from('testimonials').select('*', { count: 'exact', head: true }),
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('faq').select('*', { count: 'exact', head: true }),
        supabase.from('services').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        testimonials: testimonials.count || 0,
        clients: clients.count || 0,
        faq: faq.count || 0,
        services: services.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'לקוחות', value: stats.clients, icon: Users },
    { title: 'המלצות', value: stats.testimonials, icon: MessageSquare },
    { title: 'שאלות ותשובות', value: stats.faq, icon: HelpCircle },
    { title: 'שירותים', value: stats.services, icon: FileText }
  ];

  return (
    <AdminLayout title="לוח בקרה">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground font-assistant">סקירה כללית</h2>
          <p className="text-muted-foreground font-open-sans">
            סטטיסטיקות מערכת הניהול
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <Card key={card.title}>
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

        <Card>
          <CardHeader>
            <CardTitle className="font-assistant">ברוכים הבאים למערכת הניהול</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground font-open-sans">
              <p>השתמשו בתפריט הצד כדי לנווט בין חלקי המערכת השונים:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>ניהול לקוחות - הוספה ועריכה של פרטי לקוחות</li>
                <li>ניהול המלצות - הוספה ועריכה של המלצות לקוחות</li>
                <li>הגדרות - הגדרות כלליות של המערכת</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}