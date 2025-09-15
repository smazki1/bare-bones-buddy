import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminFAQ() {
  return (
    <AdminLayout title="ניהול שאלות ותשובות">
      <Card>
        <CardHeader>
          <CardTitle className="font-assistant">שאלות ותשובות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground font-open-sans py-8">
            <p>ניהול שאלות ותשובות יתווסף בקרוב</p>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}