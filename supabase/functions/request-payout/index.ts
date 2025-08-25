import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[REQUEST-PAYOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { amount } = await req.json();
    if (!amount || amount < 10) {
      throw new Error("Minimum payout amount is $10");
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    // Use service role key to handle database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Get user's Stripe Connect account
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('stripe_connect_account_id, connect_onboarding_completed')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile?.stripe_connect_account_id) {
      throw new Error("Stripe Connect account not found. Please complete account setup first.");
    }

    if (!profile.connect_onboarding_completed) {
      throw new Error("Please complete your Stripe Connect onboarding first.");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if account can receive payouts
    const account = await stripe.accounts.retrieve(profile.stripe_connect_account_id);
    if (!account.payouts_enabled) {
      throw new Error("Your account is not yet enabled to receive payouts. Please complete your account setup.");
    }

    // Calculate available balance (you might want to implement this based on your business logic)
    const { data: sessions } = await supabaseClient
      .from('sessions')
      .select('total_amount')
      .eq('tutor_id', user.id)
      .eq('payment_status', 'paid');

    const totalEarnings = sessions?.reduce((sum, session) => sum + (session.total_amount || 0), 0) || 0;
    
    // Get already paid out amounts
    const { data: payouts } = await supabaseClient
      .from('payouts')
      .select('amount')
      .eq('tutor_id', user.id)
      .eq('status', 'completed');

    const alreadyPaidOut = payouts?.reduce((sum, payout) => sum + payout.amount, 0) || 0;
    const availableBalance = totalEarnings - alreadyPaidOut;

    if (amount > availableBalance) {
      throw new Error(`Insufficient balance. Available: $${availableBalance}`);
    }

    // Create payout record first
    const { data: payoutRecord, error: payoutError } = await supabaseClient
      .from('payouts')
      .insert({
        tutor_id: user.id,
        amount: amount,
        status: 'pending',
        stripe_connect_account_id: profile.stripe_connect_account_id,
      })
      .select()
      .single();

    if (payoutError) throw new Error(`Database error: ${payoutError.message}`);

    try {
      // Create Stripe payout (in cents)
      const payout = await stripe.transfers.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        destination: profile.stripe_connect_account_id,
        metadata: {
          tutor_id: user.id,
          payout_id: payoutRecord.id,
        },
      });

      // Update payout record with Stripe payout ID
      await supabaseClient
        .from('payouts')
        .update({
          stripe_payout_id: payout.id,
          status: 'processing',
          processed_at: new Date().toISOString(),
        })
        .eq('id', payoutRecord.id);

      logStep("Payout created successfully", { payoutId: payout.id, amount });

      return new Response(JSON.stringify({
        success: true,
        payout_id: payoutRecord.id,
        stripe_payout_id: payout.id,
        amount: amount,
        status: 'processing'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (stripeError) {
      // Update payout record to failed
      await supabaseClient
        .from('payouts')
        .update({ status: 'failed' })
        .eq('id', payoutRecord.id);
      throw stripeError;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in request-payout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});