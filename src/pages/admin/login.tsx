import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@foodvision.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, isAdmin, isLoading, signIn, error } = useSupabaseAuth();

  // Show any error that came from navigation state (session failures)
  useEffect(() => {
    const navigationError = (location.state as any)?.error;
    if (navigationError) {
      toast({
        variant: "destructive",
        title: "בעיית חיבור",
        description: navigationError,
      });
    }
  }, [location.state, toast]);

  // Show auth errors
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: error,
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if (!isLoading && user && isAdmin) {
      const redirectTo = (location.state as any)?.from || '/admin/dashboard';
      navigate(redirectTo, { replace: true });
    }
  }, [user, isAdmin, isLoading, navigate, location.state]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-open-sans">בודק הרשאות...</p>
          {error && (
            <div className="mt-4 text-sm text-destructive bg-destructive/10 p-3 rounded-lg max-w-md mx-auto">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (user && isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-open-sans">מעביר לדשבורד...</p>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        let errorMessage = 'שגיאה בהתחברות';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'אימייל או סיסמה שגויים';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'יש לאמת את האימייל';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'יותר מדי ניסיונות התחברות. נסה שוב מאוחר יותר';
        }
        
        toast({
          title: 'שגיאה',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'שגיאה',
        description: 'בעיה ברשת או בשרת. אנא נסה שנית',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
      <div className="w-full max-w-md space-y-8 p-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground font-assistant">
            כניסת מנהל - Food Vision
          </h2>
          <p className="mt-2 text-muted-foreground font-open-sans">
            התחבר למערכת הניהול
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center font-assistant">התחברות</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-open-sans">
                    אימייל
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="הכנס אימייל"
                    className="text-right"
                    dir="rtl"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="font-open-sans">
                    סיסמה
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="הכנס סיסמה"
                    className="text-right"
                    dir="rtl"
                    disabled={loading}
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-secondary hover:bg-secondary/90 font-assistant"
              >
                {loading ? 'מתחבר...' : 'התחבר'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}