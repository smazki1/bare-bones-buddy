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

// Call the portfolio-admin Edge Function
export const callPortfolioAdmin = async (action: string, payload: any): Promise<any> => {
  try {
    const adminToken = localStorage.getItem('admin_token') || 
                     sessionStorage.getItem('admin_token');
    
    if (!adminToken) {
      throw new Error('Admin token not found. Please log in as admin.');
    }

    const response = await supabase.functions.invoke('portfolio-admin', {
      body: { action, payload },
      headers: {
        'x-admin-token': adminToken
      }
    });

    if (response.error) {
      console.error('Edge function error:', response.error);
      throw new Error(response.error.message || 'Edge function error');
    }

    const result = response.data;
    
    if (!result.ok) {
      throw new Error(result.error || 'Unknown error');
    }

    return result.data;
  } catch (error) {
    console.error('Portfolio admin call error:', error);
    throw error;
  }
};