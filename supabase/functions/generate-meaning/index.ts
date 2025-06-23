import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the JWT token
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const { card_id, title, keywords, style_template } = await req.json()

    if (!card_id) {
      return new Response(
        JSON.stringify({ error: 'card_id is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get the card details
    const { data: card, error: cardError } = await supabaseClient
      .from('cards')
      .select('*, decks!inner(user_id)')
      .eq('id', card_id)
      .single()

    if (cardError || !card || card.decks.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Card not found or unauthorized' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check user's subscription and usage limits
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const { data: usageToday } = await supabaseClient
      .from('usage_tracking')
      .select('tokens_used')
      .eq('user_id', user.id)
      .eq('service_type', 'meaning_generation')
      .gte('created_at', new Date().toISOString().split('T')[0])

    const totalUsage = usageToday?.reduce((sum, record) => sum + record.tokens_used, 0) || 0
    const dailyLimit = profile?.subscription_tier === 'free' ? 10 : profile?.subscription_tier === 'premium' ? 100 : 500

    if (totalUsage >= dailyLimit) {
      return new Response(
        JSON.stringify({ error: 'Daily AI usage limit exceeded' }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Prepare the prompt for Gemini
    const prompt = `You are a wise oracle card meaning generator. Create a profound, inspirational meaning for an oracle card with the following details:

Title: ${title || card.title}
Keywords: ${(keywords || card.keywords || []).join(', ')}
Style: ${style_template || card.style_template || 'mystical'}

Generate a meaningful interpretation that:
1. Captures the essence of the title and keywords
2. Provides spiritual guidance and insight
3. Is positive and empowering
4. Is 2-3 sentences long
5. Uses accessible, beautiful language

The meaning should help someone connect with their inner wisdom and find guidance for their life situation.`

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${Deno.env.get('GEMINI_API_KEY')}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      }
    )

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`)
    }

    const geminiData = await geminiResponse.json()
    const generatedMeaning = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!generatedMeaning) {
      throw new Error('No meaning generated from Gemini')
    }

    // Update the card with the generated meaning
    const { error: updateError } = await supabaseClient
      .from('cards')
      .update({ meaning: generatedMeaning })
      .eq('id', card_id)

    if (updateError) {
      throw new Error(`Failed to update card: ${updateError.message}`)
    }

    // Track usage
    await supabaseClient
      .from('usage_tracking')
      .insert({
        user_id: user.id,
        service_type: 'meaning_generation',
        tokens_used: Math.ceil(generatedMeaning.length / 4) // Rough token estimation
      })

    return new Response(
      JSON.stringify({ meaning: generatedMeaning }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})