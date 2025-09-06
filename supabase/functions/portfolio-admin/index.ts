import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const adminToken = Deno.env.get('ADMIN_TOKEN')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin token
    const token = req.headers.get('x-admin-token');
    if (!token || token !== adminToken) {
      console.log('Unauthorized: Invalid or missing admin token');
      return new Response(
        JSON.stringify({ ok: false, error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { action, payload } = await req.json();
    console.log('Portfolio admin action:', action, payload);

    let result;

    switch (action) {
      case 'add': {
        // Allow optional explicit id and created_at. If not provided, compute next id.
        let idToUse = payload.id;
        if (!idToUse) {
          const { data: maxRow } = await supabase
            .from('projects')
            .select('id')
            .order('id', { ascending: false })
            .limit(1)
            .maybeSingle();
          idToUse = (maxRow?.id || 0) + 1;
        }

        const insertPayload: any = {
          id: idToUse,
          business_name: payload.business_name,
          business_type: payload.business_type,
          service_type: payload.service_type,
          image_after: payload.image_after,
          image_before: payload.image_before || null,
          size: payload.size,
          category: payload.category,
          pinned: payload.pinned || false,
        };
        if (payload.created_at) insertPayload.created_at = payload.created_at;

        const { data: insertData, error: insertError } = await supabase
          .from('projects')
          .insert(insertPayload)
          .select()
          .single();

        if (insertError) {
          console.error('Insert error:', insertError);
          return new Response(
            JSON.stringify({ ok: false, error: insertError.message }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        result = { ok: true, data: insertData };
        break;
      }

      case 'update':
        if (!payload.id) {
          return new Response(
            JSON.stringify({ ok: false, error: 'ID is required for update' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const updateFields: any = {};
        if (payload.business_name !== undefined) updateFields.business_name = payload.business_name;
        if (payload.business_type !== undefined) updateFields.business_type = payload.business_type;
        if (payload.service_type !== undefined) updateFields.service_type = payload.service_type;
        if (payload.image_after !== undefined) updateFields.image_after = payload.image_after;
        if (payload.image_before !== undefined) updateFields.image_before = payload.image_before;
        if (payload.size !== undefined) updateFields.size = payload.size;
        if (payload.category !== undefined) updateFields.category = payload.category;
        if (payload.pinned !== undefined) updateFields.pinned = payload.pinned;

        const { data: updateData, error: updateError } = await supabase
          .from('projects')
          .update(updateFields)
          .eq('id', payload.id)
          .select()
          .single();

        if (updateError) {
          console.error('Update error:', updateError);
          return new Response(
            JSON.stringify({ ok: false, error: updateError.message }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        result = { ok: true, data: updateData };
        break;

      case 'delete':
        if (!payload.id) {
          return new Response(
            JSON.stringify({ ok: false, error: 'ID is required for delete' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const { error: deleteError } = await supabase
          .from('projects')
          .delete()
          .eq('id', payload.id);

        if (deleteError) {
          console.error('Delete error:', deleteError);
          return new Response(
            JSON.stringify({ ok: false, error: deleteError.message }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        result = { ok: true, data: { id: payload.id } };
        break;

      default:
        return new Response(
          JSON.stringify({ ok: false, error: 'Invalid action. Use add, update, or delete.' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }

    console.log('Portfolio admin result:', result);
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Portfolio admin function error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});