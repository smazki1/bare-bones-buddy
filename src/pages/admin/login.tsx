import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, isLoading } = useSupabaseAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && user && isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [user, isAdmin, isLoading, navigate]);

  const handleSignUp = async () => {
    // Prevent signup if user is already authenticated
    if (user && isAdmin) {
      toast({
        title: 'Already Logged In',
        description: 'Redirecting to dashboard...',
      });
      navigate('/admin/dashboard');
      return;
    }

    setLoading(true);
    const adminEmail = 'admin@foodvision.com';
    const adminPassword = 'FoodVision2025!';

    try {
      console.log('Attempting to sign up with:', adminEmail);
      
      const { data, error } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/dashboard`
        }
      });

      console.log('Signup response:', { data, error });

      if (error) {
        console.error('Signup error:', error);
        
        // Handle specific error cases
        let errorMessage = error.message;
        if (error.message.includes('User already registered')) {
          errorMessage = 'Admin account already exists! Try logging in directly.';
          setEmail(adminEmail);
          setPassword(adminPassword);
        }
        
        toast({
          title: 'Sign-up Status',
          description: errorMessage,
          variant: error.message.includes('User already registered') ? 'default' : 'destructive'
        });
        return;
      }

      if (data.user) {
        toast({
          title: 'Account Created Successfully!',
          description: 'You can now login with the credentials below.',
        });
        
        // Auto-fill the form
        setEmail(adminEmail);
        setPassword(adminPassword);
      }
      
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: 'Sign-up Error',
        description: 'Network or server issue. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

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
        return;
      }

      if (data.user) {
        // Wait a moment for the auth state to update
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1000);
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