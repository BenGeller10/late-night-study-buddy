import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { stripe_session_id, session_id } = await req.json();

    if (!stripe_session_id || !session_id) {
      throw new Error("Missing required parameters");
    }

    console.log('Verifying payment for session:', { stripe_session_id, session_id });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get Stripe session details
    const stripeSession = await stripe.checkout.sessions.retrieve(stripe_session_id);

    console.log('Stripe session status:', stripeSession.payment_status);

    // Create Supabase service client
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    let newStatus = 'pending_payment';
    let paymentStatus = 'pending';

    if (stripeSession.payment_status === 'paid') {
      newStatus = 'confirmed';
      paymentStatus = 'paid';
    } else if (stripeSession.payment_status === 'unpaid') {
      newStatus = 'cancelled';
      paymentStatus = 'failed';
    }

    // Update session status based on payment
    const { error: updateError } = await supabaseService
      .from('sessions')
      .update({
        status: newStatus,
        payment_status: paymentStatus,
      })
      .eq('id', session_id);

    if (updateError) {
      console.error('Error updating session status:', updateError);
      throw new Error("Failed to update session status");
    }

    // Send confirmation email if payment was successful
    if (paymentStatus === 'paid') {
      try {
        // Get session details for email
        const { data: sessionData } = await supabaseService
          .from('sessions')
          .select(`
            *,
            student_profile:profiles!student_id(display_name, user_id),
            tutor_profile:profiles!tutor_id(display_name, venmo_handle),
            subject:subjects(name, code)
          `)
          .eq('id', session_id)
          .single();

        if (sessionData) {
          // Get student email
          const { data: userData } = await supabaseService.auth.admin.getUserById(sessionData.student_id);
          
          if (userData.user?.email) {
            await supabaseService.functions.invoke('send-booking-confirmation', {
              body: {
                sessionId: session_id,
                studentEmail: userData.user.email,
                studentName: sessionData.student_profile?.display_name || 'Student',
                tutorName: sessionData.tutor_profile?.display_name || 'Tutor',
                subject: sessionData.subject?.name || 'General Tutoring',
                scheduledAt: sessionData.scheduled_at,
                durationMinutes: sessionData.duration_minutes,
                location: sessionData.location,
                totalAmount: sessionData.total_amount,
                zoomLink: "https://zoom.us/j/meeting-room" // Replace with actual Zoom integration
              }
            });
          }
        }
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't fail the verification if email fails
      }
    }

    console.log('Payment verification completed:', { session_id, status: newStatus, payment_status: paymentStatus });

    return new Response(
      JSON.stringify({ 
        success: true,
        session_status: newStatus,
        payment_status: paymentStatus,
        stripe_session: {
          id: stripeSession.id,
          payment_status: stripeSession.payment_status,
          amount_total: stripeSession.amount_total
        }
      }), 
      {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Payment verification error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to verify payment" 
      }), 
      {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        },
        status: 500,
      }
    );
  }
});