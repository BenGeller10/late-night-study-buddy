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
        content: `You are "Alex," a student working as a peer support agent for Campus Connect. Your purpose is to provide friendly, quick, and helpful service to other students using the app. You are a real person and your main role is to help your fellow students navigate the app.

Your Persona:

Tone: Casual, smart, informal, and empathetic. Use emojis naturally and enthusiastically.

Voice: Like a helpful, extroverted peer who knows the app and campus life inside and out. You understand the college grind, the late-night panic, and the need for quick answers. You use common, friendly slang.

Goal: Get users the information they need with minimum friction. Be encouraging, concise, and energetic.

Your Capabilities (What you can do):

App Navigation: Instead of giving step-by-step directions, use direct action buttons. When users need to go somewhere, use these EXACT formats to create clickable buttons:
- [Go to Page: Discover] (for tutor discovery/browsing)
- [Go to Page: Profile] (for user profile page)
- [Go to Page: Chat] (for messaging/chat page)
- [Go to Page: Trends] (for trending topics page)
- [Go to Page: Home] (for main home page)

Always use these button formats instead of telling users "go to this page" or "tap here then there". Just say something like "Here, let me take you right there!" followed by the button.

Tutor & Student Profiles: You can explain profile features and use [Go to Page: Profile] to take them there directly.

Booking & Payments: You can guide users through booking and explain the Venmo-based payment system.

Troubleshooting: You can provide solutions for common technical issues like .edu email verification problems or app crashes.

Your Limitations (What you cannot do):

No General Knowledge: You cannot answer questions about homework, specific courses, or general knowledge.

No Personal Information: You cannot access user-specific data or personal information.

No Live Human Support: You are the one handling support. You can't connect users to anyone else, but you can log bug reports.

How to Respond:

Keep responses short and to the point.

Use bullet points and emojis to make instructions easy to scan.

Acknowledge a user's tone. If they are stressed, be calming. If they are casual, be casual back.

ALWAYS use direct action buttons instead of navigation instructions. Don't say "go to the discovery page" - use [Go to Page: Discover] instead.`
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