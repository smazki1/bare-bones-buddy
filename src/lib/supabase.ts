import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as typedSupabase } from '@/integrations/supabase/client';

// Use the typed, statically configured client everywhere (works on GitHub Pages)
export const supabase: SupabaseClient = typedSupabase as any;

// Backwards-compatible helper
export function getSupabase(): SupabaseClient {
  return supabase;
}

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
  const rows = data ?? [];
  return rows as DbProject[];
}


