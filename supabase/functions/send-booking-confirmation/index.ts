import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingConfirmationRequest {
  sessionId: string;
  studentEmail: string;
  studentName: string;
  tutorName: string;
  subject: string;
  scheduledAt: string;
  durationMinutes: number;
  location: string;
  zoomLink?: string;
  totalAmount: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const {
      sessionId,
      studentEmail,
      studentName,
      tutorName,
      subject,
      scheduledAt,
      durationMinutes,
      location,
      zoomLink,
      totalAmount
    }: BookingConfirmationRequest = await req.json();

    console.log("Sending booking confirmation for session:", sessionId);

    // Format the date nicely
    const sessionDate = new Date(scheduledAt);
    const formattedDate = sessionDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = sessionDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const emailHtml = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="background: linear-gradient(135deg, #6C5CE7, #A29BFE); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Session Confirmed!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your tutoring session has been successfully booked</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #6C5CE7; margin: 0 0 20px 0; font-size: 20px;">📚 Session Details</h2>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #555;">Student:</strong> ${studentName}
            </div>
            <div style="margin-bottom: 15px;">
              <strong style="color: #555;">Tutor:</strong> ${tutorName}
            </div>
            <div style="margin-bottom: 15px;">
              <strong style="color: #555;">Subject:</strong> ${subject}
            </div>
            <div style="margin-bottom: 15px;">
              <strong style="color: #555;">Date:</strong> ${formattedDate}
            </div>
            <div style="margin-bottom: 15px;">
              <strong style="color: #555;">Time:</strong> ${formattedTime}
            </div>
            <div style="margin-bottom: 15px;">
              <strong style="color: #555;">Duration:</strong> ${durationMinutes} minutes
            </div>
            <div style="margin-bottom: 15px;">
              <strong style="color: #555;">Location:</strong> ${location}
            </div>
            <div style="margin-bottom: 15px;">
              <strong style="color: #555;">Amount:</strong> $${totalAmount}
            </div>
            
            ${zoomLink ? `
              <div style="margin-top: 25px; padding: 20px; background: #e3f2fd; border-radius: 8px; border-left: 4px solid #2196F3;">
                <strong style="color: #1976D2;">🔗 Join Meeting:</strong><br>
                <a href="${zoomLink}" style="color: #1976D2; text-decoration: none; font-weight: bold;">${zoomLink}</a>
              </div>
            ` : ''}
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #6C5CE7; margin: 0 0 15px 0;">📋 What's Next?</h3>
            <ul style="padding-left: 20px; margin: 0;">
              <li style="margin-bottom: 8px;">You'll receive a calendar invite shortly</li>
              <li style="margin-bottom: 8px;">Come prepared with specific questions or topics</li>
              <li style="margin-bottom: 8px;">Join the meeting 5 minutes early</li>
              <li style="margin-bottom: 8px;">Have your learning materials ready</li>
            </ul>
          </div>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404;">
              <strong>Need to reschedule?</strong> Please contact your tutor at least 24 hours in advance.
            </p>
          </div>
          
          <div style="text-center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              Best of luck with your studies! 🚀<br>
              <strong>Campus Connect Team</strong>
            </p>
          </div>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Campus Connect <onboarding@resend.dev>",
      to: [studentEmail],
      subject: `📚 Session Confirmed: ${subject} with ${tutorName}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending booking confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);