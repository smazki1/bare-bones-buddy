import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Retry mechanism for failed operations
  const retryOperation = async <T,>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    throw new Error('Max retries exceeded');
  };

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await retryOperation(async () => {
        return await supabase
          .from('admin_users')
          .select('user_id')
          .eq('user_id', userId)
          .maybeSingle();
      });

      if (!error && data) {
        setIsAdmin(true);
        setError(null);
      } else {
        setIsAdmin(false);
        if (error) {
          setError('Failed to verify admin status');
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      setError('Failed to verify admin status');
    }
  };

  useEffect(() => {
    let mounted = true;
    let retryTimeout: NodeJS.Timeout | null = null;
    let sessionMonitor: NodeJS.Timeout | null = null;

    // Clear any previous errors
    setError(null);

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await retryOperation(async () => {
          return await supabase.auth.getSession();
        });
        
        if (error) throw error;
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          // Defer admin status check to avoid blocking auth flow
          if (initialSession?.user) {
            checkAdminStatus(initialSession.user.id).finally(() => {
              if (mounted) {
                setIsLoading(false);
              }
            });
          } else {
            setIsAdmin(false);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (mounted) {
          setError('Failed to restore session');
          setIsLoading(false);
          
          // Retry after delay
          retryTimeout = setTimeout(() => {
            if (mounted) getInitialSession();
          }, 3000);
        }
      }
    };

    // Set up auth state listener - CRITICAL: No async calls in callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Removed console.log to prevent re-renders
        
        if (!mounted) return;
        
        // Only synchronous operations in callback
        setSession(session);
        setUser(session?.user ?? null);
        setError(null);
        
        // Handle different auth events
        if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
          setIsAdmin(false);
          setIsLoading(false);
        } else if (event === 'SIGNED_IN') {
          // Keep loading until admin check completes
          setIsLoading(true);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setIsLoading(false);
        }
        
        // Defer admin status check to next tick, but complete loading state properly
        if (session?.user) {
          setTimeout(async () => {
            if (mounted) {
              await checkAdminStatus(session.user.id);
              if (mounted) {
                setIsLoading(false);
              }
            }
          }, 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    // Monitor session expiry and refresh
    const monitorSession = () => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.expires_at) {
          const expiresAt = new Date(session.expires_at * 1000);
          const now = new Date();
          const timeUntilExpiry = expiresAt.getTime() - now.getTime();
          
          // Refresh token 5 minutes before expiry
          if (timeUntilExpiry > 0 && timeUntilExpiry < 5 * 60 * 1000) {
            supabase.auth.refreshSession().catch(error => {
              console.error('Token refresh failed:', error);
              if (mounted) {
                setError('Session expired. Please login again.');
              }
            });
          }
        }
      }).catch(error => {
        console.error('Error monitoring session:', error);
      });
    };

    // Monitor session every minute
    sessionMonitor = setInterval(monitorSession, 60000);
    
    getInitialSession();

    return () => {
      mounted = false;
      if (retryTimeout) clearTimeout(retryTimeout);
      if (sessionMonitor) clearInterval(sessionMonitor);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        setError(error.message);
      } else {
        setError(null);
      }
      
      return { data, error };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setError(error.message);
      } else {
        setError(null);
        setUser(null);
        setSession(null);
        setIsAdmin(false);
      }
      
      return { error };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/login`
        }
      });
      
      if (error) {
        setError(error.message);
      } else {
        setError(null);
      }
      
      return { data, error };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      setError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    }
  };

  return {
    user,
    session,
    isLoading,
    isAdmin,
    error,
    signIn,
    signOut,
    signUp
  };
}