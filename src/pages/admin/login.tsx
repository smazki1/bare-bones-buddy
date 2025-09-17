import { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [hasShownError, setHasShownError] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, isAdmin, isLoading, signIn, error } = useSupabaseAuth();

  // Memoize navigation state to prevent re-renders
  const navigationState = useMemo(() => location.state as any, [location.state]);
  
  // Stable redirect function to prevent useEffect loops
  const redirectToDashboard = useCallback(() => {
    const redirectTo = navigationState?.from || '/admin/dashboard';
    navigate(redirectTo, { replace: true });
  }, [navigate, navigationState]);

  // Handle navigation errors only once
  useEffect(() => {
    if (navigationState?.error && !hasShownError) {
      toast({
        variant: "destructive",
        title: "בעיית חיבור",
        description: navigationState.error,
      });
      setHasShownError(true);
    }
  }, [navigationState?.error, hasShownError, toast]);

  // Handle auth errors only once per error
  useEffect(() => {
    if (error && !hasShownError) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: error,
      });
      setHasShownError(true);
    }
    
    // Reset error flag when error clears
    if (!error) {
      setHasShownError(false);
    }
  }, [error, hasShownError, toast]);

  // Handle redirection with stable dependencies
  useEffect(() => {
    if (!isLoading && user && isAdmin) {
      redirectToDashboard();
    }
  }, [user, isAdmin, isLoading, redirectToDashboard]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setHasShownError(false); // Reset error flag before new attempt

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
        setHasShownError(true);
      }
    } catch (error: any) {
      toast({
        title: 'שגיאה',
        description: 'בעיה ברשת או בשרת. אנא נסה שנית',
        variant: 'destructive'
      });
      setHasShownError(true);
    } finally {
      setLoading(false);
    }
  };

  // Stable loading component to prevent layout shifts
  const LoadingScreen = ({ message }: { message: string }) => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground font-open-sans">{message}</p>
        {error && (
          <div className="mt-4 text-sm text-destructive bg-destructive/10 p-3 rounded-lg max-w-md mx-auto">
            {error}
          </div>
        )}
      </div>
    </div>
  );

  // Show loading while checking auth state
  if (isLoading) {
    return <LoadingScreen message="בודק הרשאות..." />;
  }

  // Show loading while redirecting authenticated user
  if (user && isAdmin) {
    return <LoadingScreen message="מעביר לדשבורד..." />;
  }

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