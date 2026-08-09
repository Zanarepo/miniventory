// @ts-nocheck
// This file is executed by Deno on Supabase Edge Functions, not Node.js.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const { email, siteUrl, businessId, businessName, inviterName } = payload;

    if (!email || !siteUrl) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Initialize Supabase admin client to trigger the built-in Invite email
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // This uses your Supabase Custom SMTP (Resend) and the "Invite User" email template
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { business_name: businessName, inviter_name: inviterName },
      redirectTo: `${siteUrl}/join-setup?business_id=${businessId}&business_name=${encodeURIComponent(businessName || 'the team')}`,
    });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, data }), { 
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
