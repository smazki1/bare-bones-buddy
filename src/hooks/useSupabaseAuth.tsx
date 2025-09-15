import { useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const adminCheckRef = useRef<boolean>(false);

  const checkAdminStatus = async (userId: string): Promise<boolean> => {
    if (adminCheckRef.current) return;
    adminCheckRef.current = true;

    try {
      const { data, error } = await supabase
        .rpc('get_admin_user', { user_id_param: userId })
        .maybeSingle();

      if (error) {
        console.error('Admin status check error:', error);
        setIsAdmin(false);
        return false;
      }
      
      const isAdminUser = !!data && (data as any).user_id === userId;
      setIsAdmin(isAdminUser);
      return isAdminUser;
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      return false;
    } finally {
      adminCheckRef.current = false;
    }
  };

  const linkAndCheckAdmin = async (userId: string): Promise<boolean> => {
    try {
      // Best-effort: link current auth user to admin_users by email if needed
      await supabase.rpc('link_admin_user');
    } catch (_) {
      // Ignore linking errors; we'll still check admin status
    }
    return await checkAdminStatus(userId);
  };

  const isEmailAllowlisted = (email?: string | null): boolean => {
    if (!email) return false;
    const csv = (import.meta as any)?.env?.VITE_ADMIN_ALLOW_EMAILS as string | undefined;
    if (!csv || typeof csv !== 'string') return false;
    return csv.split(',').map(s => s.trim().toLowerCase()).includes(email.toLowerCase());
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const isAdminNow = await linkAndCheckAdmin(session.user.id);
          if (!isAdminNow) {
            const email = (session.user as any).email as string | undefined;
            const host = window.location.hostname;
            const isLocal = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(host);
            const allowed = ['admin@foodvision.com'];
            if (isLocal && email && allowed.includes(email)) {
              console.warn('[Auth] Local admin bootstrap override enabled for', email);
              setIsAdmin(true);
            } else if (isEmailAllowlisted(email)) {
              console.warn('[Auth] Admin allowlist override enabled for', email);
              setIsAdmin(true);
            }
          }
        } else {
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const isAdminNow = await linkAndCheckAdmin(session.user.id);
          if (!isAdminNow) {
            const email = (session.user as any).email as string | undefined;
            const host = window.location.hostname;
            const isLocal = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(host);
            const allowed = ['admin@foodvision.com'];
            if (isLocal && email && allowed.includes(email)) {
              console.warn('[Auth] Local admin bootstrap override enabled for', email);
              setIsAdmin(true);
            } else if (isEmailAllowlisted(email)) {
              console.warn('[Auth] Admin allowlist override enabled for', email);
              setIsAdmin(true);
            }
          }
        } else {
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/admin/dashboard`;
    
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