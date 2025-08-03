import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId } = await req.json();
    
    if (!message || !sessionId) {
      throw new Error('Message and sessionId are required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get chat history for context
    const { data: chatHistory } = await supabase
      .from('support_chats')
      .select('user_message, ai_response')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(10);

    // Build conversation context
    const messages = [
      {
        role: 'system',
        content: `You are a helpful customer support agent for Campus Connect, a platform that helps students find tutors and study partners. You should:
        
        - Be friendly, professional, and empathetic
        - Help with account issues, tutor matching, booking sessions, technical problems
        - Provide clear step-by-step guidance
        - If you can't solve something, offer to escalate to a human agent
        - Keep responses concise but helpful
        - Use a warm, encouraging tone appropriate for college students
        
        Key features of Campus Connect:
        - Swipe-based tutor discovery 
        - Chat with tutors before booking
        - Session booking system
        - Study streak tracking and gamification
        - Hot topics feed for trending subjects
        
        If users ask about features not yet available, politely explain what's currently available and suggest alternatives.`
      }
    ];

    // Add chat history to context
    if (chatHistory) {
      for (const chat of chatHistory) {
        messages.push(
          { role: 'user', content: chat.user_message },
          { role: 'assistant', content: chat.ai_response }
        );
      }
    }

    // Add current message
    messages.push({ role: 'user', content: message });

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Save the conversation to database
    await supabase
      .from('support_chats')
      .insert({
        session_id: sessionId,
        user_message: message,
        ai_response: aiResponse,
      });

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-support-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});