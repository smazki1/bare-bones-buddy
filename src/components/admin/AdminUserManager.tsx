import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, UserCheck, UserX } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  user_id: string;
  created_at: string;
}

interface AdminUserManagerProps {
  currentUserEmail: string;
}

export const AdminUserManager = ({ currentUserEmail }: AdminUserManagerProps) => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const { toast } = useToast();

  const isEmailValid = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const sanitizeEmail = (email: string): string => {
    return email.toLowerCase().trim();
  };

  useEffect(() => {
    loadAdminUsers();
  }, []);

  const loadAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdminUsers(data || []);
    } catch (error: any) {
      console.error('Error loading admin users:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לטעון את רשימת המנהלים',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addAdminUser = async () => {
    if (!newAdminEmail) {
      toast({
        title: 'שגיאה',
        description: 'יש להזין כתובת אימייל',
        variant: 'destructive'
      });
      return;
    }

    const sanitizedEmail = sanitizeEmail(newAdminEmail);
    
    if (!isEmailValid(sanitizedEmail)) {
      toast({
        title: 'שגיאה',
        description: 'כתובת אימייל לא תקינה',
        variant: 'destructive'
      });
      return;
    }

    // Check if user already exists as admin
    if (adminUsers.some(admin => admin.email === sanitizedEmail)) {
      toast({
        title: 'שגיאה',
        description: 'משתמש זה כבר מנהל במערכת',
        variant: 'destructive'
      });
      return;
    }

    setIsAddingAdmin(true);
    
    try {
      // Add user to admin_users table with placeholder UUID
      // The user will need to sign up to activate their admin access
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert({
          email: sanitizedEmail,
          user_id: '00000000-0000-0000-0000-000000000000' // Placeholder UUID
        });

      if (insertError) throw insertError;

      toast({
        title: 'הצלחה',
        description: `${sanitizedEmail} נוסף כמנהל. המשתמש יצטרך להרשם למערכת תחילה.`,
      });

      setNewAdminEmail('');
      await loadAdminUsers();
    } catch (error: any) {
      console.error('Error adding admin user:', error);
      toast({
        title: 'שגיאה',
        description: error.message || 'שגיאה בהוספת המנהל',
        variant: 'destructive'
      });
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const removeAdminUser = async (adminId: string, email: string) => {
    if (email === currentUserEmail) {
      toast({
        title: 'שגיאה',
        description: 'לא ניתן להסיר את עצמך ממנהלי המערכת',
        variant: 'destructive'
      });
      return;
    }

    if (!confirm(`האם אתה בטוח שברצונך להסיר את ${email} ממנהלי המערכת?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminId);

      if (error) throw error;

      toast({
        title: 'הצלחה',
        description: `המנהל ${email} הוסר מהמערכת`,
      });

      await loadAdminUsers();
    } catch (error: any) {
      console.error('Error removing admin user:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בהסרת המנהל',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-assistant flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          ניהול מנהלי המערכת
        </CardTitle>
        <CardDescription className="font-open-sans">
          הוספת והסרת מנהלים במערכת (זמין למנהל עליון בלבד)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Admin Form */}
        <div className="space-y-3">
          <Label htmlFor="newAdminEmail" className="font-assistant">
            הוסף מנהל חדש
          </Label>
          <div className="flex gap-2">
            <Input
              id="newAdminEmail"
              type="email"
              placeholder="כתובת אימייל"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="text-right"
              dir="rtl"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addAdminUser();
                }
              }}
            />
            <Button 
              onClick={addAdminUser} 
              disabled={isAddingAdmin}
              className="font-assistant"
            >
              {isAddingAdmin ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  הוסף
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Admin Users List */}
        <div className="space-y-3">
          <Label className="font-assistant">מנהלי המערכת הנוכחיים:</Label>
          
          {adminUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground font-open-sans text-center py-4">
              אין מנהלים רשומים במערכת
            </p>
          ) : (
            <div className="space-y-2">
              {adminUsers.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      <div className="font-medium font-assistant">{admin.email}</div>
                      <div className="text-xs text-muted-foreground font-open-sans">
                        נוסף: {new Date(admin.created_at).toLocaleDateString('he-IL')}
                      </div>
                    </div>
                    {admin.email === currentUserEmail && (
                      <Badge variant="default" className="font-assistant text-xs">
                        אתה
                      </Badge>
                    )}
                    {admin.user_id === '00000000-0000-0000-0000-000000000000' && (
                      <Badge variant="outline" className="font-assistant text-xs">
                        טרם נרשם
                      </Badge>
                    )}
                  </div>
                  
                  {admin.email !== currentUserEmail && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeAdminUser(admin.id, admin.email)}
                      className="font-assistant"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      הסר
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};