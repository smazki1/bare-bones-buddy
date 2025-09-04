import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL || (window as any)?.SUPABASE_URL;
const supabaseAnonKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || (window as any)?.SUPABASE_PUBLISHABLE_KEY;

// Guard against undefined env on static hosts (e.g., GitHub Pages). When missing, avoid crashing.
let supabase: SupabaseClient | null = null;
if (typeof supabaseUrl === 'string' && supabaseUrl && typeof supabaseAnonKey === 'string' && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
}

// Lazily initialize from localStorage if env/window are not available (e.g., GitHub Pages)
export function getSupabase(): SupabaseClient | null {
  if (supabase) return supabase;
  try {
    const lsUrl = typeof window !== 'undefined' ? localStorage.getItem('aiMaster:supabaseUrl') || '' : '';
    const lsKey = typeof window !== 'undefined' ? localStorage.getItem('aiMaster:supabaseAnon') || '' : '';
    if (lsUrl && lsKey) {
      supabase = createClient(lsUrl, lsKey, { auth: { persistSession: false } });
      return supabase;
    }
  } catch {}
  return null;
}

export { supabase };

export type DbProject = {
  id: number;
  business_name: string;
  business_type: string;
  service_type: 'תמונות' | 'סרטונים';
  image_after: string;
  image_before?: string | null;
  size: 'small' | 'medium' | 'large';
  category: string;
  pinned: boolean;
  created_at: string;
};

export async function fetchProjects(): Promise<DbProject[]> {
  const client = getSupabase() || supabase;
  if (!client) {
    // Env not configured on this host; return empty to keep UI functional
    return [];
  }
  const { data, error } = await client
    .from('projects')
    .select('*')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false });
  if (error) throw error;
  return data ?? [];
}


