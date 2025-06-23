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

    const { reading_id } = await req.json()

    if (!reading_id) {
      return new Response(
        JSON.stringify({ error: 'reading_id is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get the reading with card details
    const { data: reading, error: readingError } = await supabaseClient
      .from('readings')
      .select(`
        *,
        decks (name, description)
      `)
      .eq('id', reading_id)
      .eq('user_id', user.id)
      .single()

    if (readingError || !reading) {
      return new Response(
        JSON.stringify({ error: 'Reading not found or unauthorized' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get the cards used in this reading
    const cardPositions = reading.card_positions as any
    const cardIds = Object.values(cardPositions).map((pos: any) => pos.card_id)

    const { data: cards, error: cardsError } = await supabaseClient
      .from('cards')
      .select('id, title, meaning, keywords')
      .in('id', cardIds)

    if (cardsError) {
      throw new Error(`Failed to fetch cards: ${cardsError.message}`)
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
      .eq('service_type', 'reading_interpretation')
      .gte('created_at', new Date().toISOString().split('T')[0])

    const totalUsage = usageToday?.reduce((sum, record) => sum + record.tokens_used, 0) || 0
    const dailyLimit = profile?.subscription_tier === 'free' ? 5 : profile?.subscription_tier === 'premium' ? 50 : 200

    if (totalUsage >= dailyLimit) {
      return new Response(
        JSON.stringify({ error: 'Daily AI interpretation limit exceeded' }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Build card context for interpretation
    const cardContext = Object.entries(cardPositions).map(([position, data]: [string, any]) => {
      const card = cards?.find(c => c.id === data.card_id)
      return {
        position,
        card: card ? {
          title: card.title,
          meaning: card.meaning,
          keywords: card.keywords
        } : null
      }
    }).filter(item => item.card)

    // Prepare the prompt for Gemini
    const spreadType = reading.spread_type
    const intention = reading.intention || 'seeking guidance'
    
    const prompt = `You are a wise oracle card reader providing interpretation for a ${spreadType} spread. 

User's intention: ${intention}

Cards drawn:
${cardContext.map(item => `
Position: ${item.position}
Card: ${item.card?.title}
Meaning: ${item.card?.meaning}
Keywords: ${item.card?.keywords?.join(', ') || 'none'}
`).join('\n')}

Provide a comprehensive interpretation that:
1. Considers the meaning of each card in its position
2. Looks at the overall message and theme
3. Addresses the user's intention
4. Offers practical guidance and insight
5. Is warm, supportive, and empowering
6. Is 3-5 paragraphs long

The interpretation should feel personal and meaningful, helping the user gain clarity and wisdom for their situation.`

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
    const interpretation = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!interpretation) {
      throw new Error('No interpretation generated from Gemini')
    }

    // Update the reading with the interpretation
    const { error: updateError } = await supabaseClient
      .from('readings')
      .update({ ai_interpretation: interpretation })
      .eq('id', reading_id)

    if (updateError) {
      throw new Error(`Failed to update reading: ${updateError.message}`)
    }

    // Track usage
    await supabaseClient
      .from('usage_tracking')
      .insert({
        user_id: user.id,
        service_type: 'reading_interpretation',
        tokens_used: Math.ceil(interpretation.length / 4) // Rough token estimation
      })

    return new Response(
      JSON.stringify({ interpretation }),
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