import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL || (window as any)?.SUPABASE_URL;
const supabaseAnonKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || (window as any)?.SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

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
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false });
  if (error) throw error;
  return data ?? [];
}


