import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let adminCheckInProgress = false;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check admin status when session changes (avoid duplicate calls)
        if (session?.user && !adminCheckInProgress) {
          adminCheckInProgress = true;
          setTimeout(async () => {
            await checkAdminStatus(session.user.id);
            // Link admin account by calling function
            try {
              await supabase.rpc('link_admin_user');
            } catch (e) {
              console.warn('Admin linking failed:', e);
            }
            adminCheckInProgress = false;
          }, 0);
        } else if (!session?.user) {
          setIsAdmin(false);
          adminCheckInProgress = false;
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user && !adminCheckInProgress) {
        adminCheckInProgress = true;
        setTimeout(async () => {
          await checkAdminStatus(session.user.id);
          adminCheckInProgress = false;
        }, 0);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      // Use SECURITY DEFINER function to bypass restrictive RLS on admin_users
      const { data, error } = await supabase
        .rpc('get_admin_user', { user_id_param: userId })
        .maybeSingle();

      if (error) {
        console.error('Admin status check error:', error);
        setIsAdmin(false);
        return;
      }
      
      const isAdminUser = !!data && (data as any).user_id === userId;
      console.log('Admin status for user', userId, ':', isAdminUser);
      setIsAdmin(isAdminUser);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    }
    return { error };
  };

  return {
    user,
    session,
    isLoading,
    isAdmin,
    signUp,
    signIn,
    signOut
  };
};