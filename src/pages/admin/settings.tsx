import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSettings() {
  return (
    <AdminLayout title="הגדרות">
      <Card>
        <CardHeader>
          <CardTitle className="font-assistant">הגדרות מערכת</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground font-open-sans py-8">
            <p>הגדרות מערכת יתווספו בקרוב</p>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}