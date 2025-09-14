import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@foodvision.com');
  const [password, setPassword] = useState('FoodVision2025!');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, isLoading, signIn, signUp } = useSupabaseAuth();

  // Single redirect effect - only runs when auth state is determined
  useEffect(() => {
    if (!isLoading && user && isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, isAdmin, isLoading, navigate]);

  // Show loading while auth is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-open-sans">בודק הרשאות...</p>
        </div>
      </div>
    );
  }

  // If already authenticated, don't show the form
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
        console.error('Login error:', error);
        let errorMessage = 'אנא נסה שנית';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'אימייל או סיסמה שגויים';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'יש לאמת את האימייל';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'יותר מדי ניסיונות התחברות. נסה שוב מאוחר יותר';
        }
        
        toast({
          title: 'שגיאה בהתחברות',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'שגיאה בהתחברות',
        description: 'בעיה ברשת או בשרת. אנא נסה שנית',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);

    try {
      const { error } = await signUp(email, password);

      if (error) {
        console.error('Signup error:', error);
        
        let errorMessage = error.message;
        if (error.message.includes('User already registered')) {
          errorMessage = 'החשבון כבר קיים! נסה להתחבר.';
        }
        
        toast({
          title: 'הודעת הרשמה',
          description: errorMessage,
          variant: error.message.includes('User already registered') ? 'default' : 'destructive'
        });
      } else {
        toast({
          title: 'החשבון נוצר בהצלחה!',
          description: 'כעת תוכל להתחבר עם הפרטים למטה.',
        });
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: 'שגיאה בהרשמה',
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
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-secondary hover:bg-secondary/90 font-assistant mb-4"
              >
                {loading ? 'מתחבר...' : 'התחבר'}
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">אין לך חשבון אדמין?</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSignUp}
                  disabled={loading}
                  className="w-full font-assistant"
                >
                  צור חשבון אדמין חדש
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}