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

    const redirectTo = `${siteUrl}/join-setup?business_id=${businessId}&business_name=${encodeURIComponent(businessName || 'the team')}&email=${encodeURIComponent(email)}`;

    let actionLink;
    
    // Check if the user already exists in profiles
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingProfile) {
      // User already exists. Send them a direct link to the app to log in and accept the invite.
      actionLink = `${siteUrl}/login?email=${encodeURIComponent(email)}&returnTo=${encodeURIComponent(redirectTo)}`;
    } else {
      // New user. Send them to join-setup to create their account and accept the invite natively.
      actionLink = redirectTo;
    }

    // 2. Send the email directly via Resend API
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const emailFrom = Deno.env.get("INVITE_EMAIL_FROM") || "Miniventory <noreply@miniventory.com>";

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured in the edge function environment.");
    }

    const brandColor = "#11b5cc";
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 0; color: #1e293b; }
          .container { max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
          .header { background-color: #0f172a; padding: 24px; text-align: center; }
          .logo { color: ${brandColor}; font-size: 24px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; }
          .content { padding: 32px 24px; text-align: center; }
          .btn { display: inline-block; background-color: ${brandColor}; color: #ffffff !important; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px; margin-top: 16px; margin-bottom: 24px; }
          .footer { padding: 24px; text-align: center; font-size: 13px; color: #94a3b8; background-color: #f8fafc; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <a href="${siteUrl}" class="logo">Miniventory</a>
          </div>
          <div class="content">
            <h2 style="margin-top: 0;">You're Invited!</h2>
            <p>${inviterName} has invited you to join <strong>${businessName || 'a business'}</strong> on Miniventory.</p>
            <a href="${actionLink}" class="btn">Accept Invitation</a>
            <p style="font-size: 13px; color: #64748b;">
              Having trouble with the button?<br>
              <a href="${actionLink}" style="color: ${brandColor}; text-decoration: underline;">Click here to accept the invitation</a>
            </p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Miniventory. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: emailFrom,
        to: email,
        subject: `You've been invited to join ${businessName || 'a business'} on Miniventory`,
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send email via Resend: ${errorData.message || 'Unknown error'}`);
    }

    return new Response(JSON.stringify({ success: true }), { 

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
