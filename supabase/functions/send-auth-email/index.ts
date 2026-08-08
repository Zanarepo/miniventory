// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const INVITE_EMAIL_FROM = Deno.env.get("INVITE_EMAIL_FROM") || "Miniventory <noreply@miniventory.com>";

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
    
    // Webhook payload from Supabase Auth contains:
    // { user, email_data: { token, token_hash, redirect_to, email_action_type, site_url, token_new, token_hash_new } }
    const { user, email_data } = payload;
    
    if (!user || !email_data || !user.email) {
      return new Response(JSON.stringify({ error: "Invalid webhook payload" }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    const { email_action_type, token_hash, redirect_to, site_url } = email_data;

    let subject = "";
    let htmlContent = "";

    // The confirmation link combines the site URL or redirect_to with the token_hash
    // Supabase standard format: [site_url]/auth/v1/verify?token=[token_hash]&type=[email_action_type]&redirect_to=[redirect_to]
    // But since we control the frontend, we can redirect directly to the frontend's verification handler (or just use standard Supabase verify)

    // The brand color from landing page: hsl(188, 85%, 45%) which is roughly #11b5cc
    const brandColor = "#11b5cc";

    const baseEmailTemplate = (title: string, message: string, buttonText: string, link: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 0; color: #1e293b; }
          .container { max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
          .header { background-color: #0f172a; padding: 24px; text-align: center; }
          .logo { color: ${brandColor}; font-size: 24px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; }
          .content { padding: 32px 24px; }
          .title { font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 16px; color: #0f172a; }
          .text { font-size: 15px; line-height: 1.6; margin-bottom: 24px; color: #475569; }
          .btn { display: inline-block; background-color: ${brandColor}; color: #ffffff !important; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px; }
          .footer { padding: 24px; text-align: center; font-size: 13px; color: #94a3b8; background-color: #f8fafc; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <a href="${site_url}" class="logo">
              Miniventory
            </a>
          </div>
          <div class="content">
            <h1 class="title">${title}</h1>
            <p class="text">${message}</p>
            <div style="text-align: center;">
              <a href="${link}" class="btn">${buttonText}</a>
            </div>
            <p class="text" style="margin-top: 24px; font-size: 13px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${link}" style="color: ${brandColor}; word-break: break-all;">${link}</a>
            </p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Miniventory. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    if (email_action_type === 'signup') {
      subject = "Verify your Miniventory account";
      // Constructing Supabase verification link
      const link = `${site_url}/auth/v1/verify?token=${token_hash}&type=signup&redirect_to=${encodeURIComponent(redirect_to)}`;
      htmlContent = baseEmailTemplate(
        "Welcome to Miniventory!",
        "Thanks for signing up! Please verify your email address to get started managing your business.",
        "Verify Email",
        link
      );
    } else if (email_action_type === 'recovery') {
      subject = "Reset your Miniventory password";
      const link = `${site_url}/auth/v1/verify?token=${token_hash}&type=recovery&redirect_to=${encodeURIComponent(redirect_to)}`;
      htmlContent = baseEmailTemplate(
        "Reset Your Password",
        "We received a request to reset your password. Click the button below to set a new one.",
        "Reset Password",
        link
      );
    } else {
      // Ignore other types or fallback
      return new Response(JSON.stringify({ message: "Email type not handled" }), { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: INVITE_EMAIL_FROM,
        to: user.email,
        subject: subject,
        html: htmlContent,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      return new Response(JSON.stringify(data), { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    } else {
      return new Response(JSON.stringify(data), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
