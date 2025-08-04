import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { student_needs, available_tutors } = await req.json();

    console.log('AI Matchmaking request:', { student_needs, available_tutors });

    const systemPrompt = `You are the Campus Connect Scheduler, an efficient AI agent that matches students with tutors based on their schedules and course needs.

Your task:
1. Analyze the student's schedule_text to identify specific days and times when they are available
2. Filter available_tutors to only include those who teach the required class
3. Compare the student's availability with the filtered tutors' availability
4. Rank the matches based on the number and duration of overlapping time slots
5. Sort the final list in descending order by match score (0-100)
6. Generate a short, friendly message introducing the results

You must return ONLY a valid JSON object with this exact structure:
{
  "matched_tutors": [
    {
      "name": "Tutor Name",
      "match_score": 95,
      "best_overlap": "Day, Time range"
    }
  ],
  "message": "Short friendly message about the matches"
}

Important:
- Only include tutors who teach the student's required class
- Match scores should be 0-100 based on schedule overlap quality
- best_overlap should show the most convenient shared time slot
- If no matches found, return empty matched_tutors array with appropriate message`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Find the best tutor matches for this student:\n\nStudent needs: ${JSON.stringify(student_needs)}\n\nAvailable tutors: ${JSON.stringify(available_tutors)}` 
          }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response:', aiResponse);

    // Parse the AI response as JSON
    let matchingResults;
    try {
      matchingResults = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      throw new Error('AI returned invalid JSON format');
    }

    return new Response(JSON.stringify(matchingResults), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-matchmaking function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      matched_tutors: [],
      message: "Sorry, we couldn't find matches right now. Please try again later."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});