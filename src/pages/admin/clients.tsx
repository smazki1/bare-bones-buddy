import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminClients() {
  return (
    <AdminLayout title="ניהול לקוחות">
      <Card>
        <CardHeader>
          <CardTitle className="font-assistant">לקוחות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground font-open-sans py-8">
            <p>ניהול לקוחות יתווסף בקרוב</p>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}