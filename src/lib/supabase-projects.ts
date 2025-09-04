import { supabase } from '@/integrations/supabase/client';
import type { Project } from '@/data/portfolioMock';

// Convert Supabase projects to frontend Project format
const convertSupabaseProject = (supabaseProject: any): Project => {
  return {
    id: supabaseProject.id.toString(),
    businessName: supabaseProject.business_name,
    businessType: supabaseProject.business_type,
    serviceType: supabaseProject.service_type,
    imageAfter: supabaseProject.image_after,
    imageBefore: supabaseProject.image_before,
    size: supabaseProject.size,
    category: supabaseProject.category,
    pinned: supabaseProject.pinned || false,
    createdAt: supabaseProject.created_at
  };
};

// Fetch projects from Supabase
export const fetchProjectsFromSupabase = async (): Promise<Project[]> => {
  try {
    console.log('Fetching projects from Supabase...');
    
    const { data, error } = await (supabase as any)
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      throw error;
    }

    console.log('Fetched projects from Supabase:', data?.length || 0);
    
    if (!data || data.length === 0) {
      return [];
    }

    return data.map(convertSupabaseProject);
  } catch (error) {
    console.error('Error fetching projects from Supabase:', error);
    throw error;
  }
};

// Call the portfolio-admin Edge Function with proper authentication
export const callPortfolioAdmin = async (action: string, payload: any): Promise<any> => {
  try {
    // Get current session to verify admin access
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('User not authenticated. Please log in.');
    }

    // Verify admin status
    const { data: adminCheck } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', session.user.id)
      .single();

    if (!adminCheck) {
      throw new Error('Access denied. Admin privileges required.');
    }

    // Get admin token from localStorage/sessionStorage as fallback
    const adminToken = localStorage.getItem('admin_token') || 
                     sessionStorage.getItem('admin_token');
    
    if (!adminToken) {
      throw new Error('Admin token not found. Please configure admin token in settings.');
    }

    const response = await supabase.functions.invoke('portfolio-admin', {
      body: { action, payload },
      headers: {
        'x-admin-token': adminToken
      }
    });

    if (response.error) {
      throw new Error(response.error.message || 'Function call failed');
    }

    if (!response.data?.ok) {
      throw new Error(response.data?.error || 'Unknown error occurred');
    }

    return response.data.data;
  } catch (error: any) {
    console.error('Error calling portfolio admin function:', error);
    throw error;
  }
};