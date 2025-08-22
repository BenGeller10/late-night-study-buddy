import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  session_id: string;
  tutor_id: string;
  amount: number;
  subject: string;
  duration_minutes: number;
  scheduled_at: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    // Parse request body
    const { session_id, tutor_id, amount, subject, duration_minutes, scheduled_at }: PaymentRequest = await req.json();

    console.log('Creating payment session for:', { session_id, tutor_id, amount, subject });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get student and tutor profiles
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const [studentProfile, tutorProfile] = await Promise.all([
      supabaseService
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .single(),
      supabaseService
        .from('profiles')
        .select('display_name, venmo_handle')
        .eq('user_id', tutor_id)
        .single()
    ]);

    if (!tutorProfile.data) {
      throw new Error("Tutor profile not found");
    }

    // Check if Stripe customer exists for this user
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: studentProfile.data?.display_name || user.email.split('@')[0],
      });
      customerId = customer.id;
    }

    // Create Stripe Checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Tutoring Session - ${subject}`,
              description: `${duration_minutes}-minute session with ${tutorProfile.data.display_name}`,
              images: tutorProfile.data?.avatar_url ? [tutorProfile.data.avatar_url] : undefined,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/sessions?payment=success&session=${session_id}`,
      cancel_url: `${req.headers.get("origin")}/sessions?payment=cancelled&session=${session_id}`,
      metadata: {
        session_id: session_id,
        tutor_id: tutor_id,
        student_id: user.id,
        subject: subject,
        duration_minutes: String(duration_minutes),
        scheduled_at: scheduled_at,
      },
    });

    // Update session with Stripe session ID and payment status
    const { error: updateError } = await supabaseService
      .from('sessions')
      .update({
        payment_status: 'pending',
        // Store Stripe session ID in notes for now (you might want a separate field)
        notes: `${checkoutSession.id}${session_id ? ` - Original notes: ${session_id}` : ''}`
      })
      .eq('id', session_id);

    if (updateError) {
      console.error('Error updating session:', updateError);
      // Don't fail the payment creation, just log the error
    }

    console.log('Payment session created successfully:', checkoutSession.id);

    return new Response(
      JSON.stringify({ 
        checkout_url: checkoutSession.url,
        session_id: checkoutSession.id
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
    console.error('Payment session creation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to create payment session" 
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