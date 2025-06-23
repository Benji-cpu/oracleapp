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

    const { card_id, title, meaning, keywords, style_template } = await req.json()

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
      .eq('service_type', 'image_generation')
      .gte('created_at', new Date().toISOString().split('T')[0])

    const totalUsage = usageToday?.reduce((sum, record) => sum + record.tokens_used, 0) || 0
    const dailyLimit = profile?.subscription_tier === 'free' ? 2 : profile?.subscription_tier === 'premium' ? 20 : 100

    if (totalUsage >= dailyLimit) {
      return new Response(
        JSON.stringify({ error: 'Daily AI image generation limit exceeded' }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Prepare the prompt for DALL-E
    const cardTitle = title || card.title
    const cardMeaning = meaning || card.meaning
    const cardKeywords = keywords || card.keywords || []
    const cardStyle = style_template || card.style_template || 'mystical'

    const imagePrompt = `Create a beautiful oracle card illustration for "${cardTitle}". 

Style: ${cardStyle}, spiritual, mystical, ethereal, high quality digital art
Keywords: ${cardKeywords.join(', ')}
Meaning: ${cardMeaning}

The image should be:
- Symbolic and meaningful
- Suitable for an oracle card
- Inspiring and uplifting
- Rich in mystical symbolism
- Square format suitable for cards
- No text or words in the image`

    // Call DALL-E API
    const dalleResponse = await fetch(
      'https://api.openai.com/v1/images/generations',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: imagePrompt,
          n: 1,
          size: "1024x1024",
          quality: profile?.subscription_tier === 'free' ? 'standard' : 'hd',
          style: 'vivid'
        }),
      }
    )

    if (!dalleResponse.ok) {
      const errorData = await dalleResponse.json()
      throw new Error(`DALL-E API error: ${dalleResponse.status} - ${errorData.error?.message}`)
    }

    const dalleData = await dalleResponse.json()
    const imageUrl = dalleData.data?.[0]?.url

    if (!imageUrl) {
      throw new Error('No image generated from DALL-E')
    }

    // Download the image
    const imageResponse = await fetch(imageUrl)
    const imageBlob = await imageResponse.blob()
    const imageBuffer = await imageBlob.arrayBuffer()

    // Upload to Supabase Storage
    const fileName = `cards/${card_id}/${Date.now()}.png`
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('card-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: false
      })

    if (uploadError) {
      throw new Error(`Storage upload error: ${uploadError.message}`)
    }

    // Get the public URL
    const { data: urlData } = supabaseClient.storage
      .from('card-images')
      .getPublicUrl(fileName)

    const publicUrl = urlData.publicUrl

    // Update the card with the generated image URL
    const { error: updateError } = await supabaseClient
      .from('cards')
      .update({ image_url: publicUrl })
      .eq('id', card_id)

    if (updateError) {
      throw new Error(`Failed to update card: ${updateError.message}`)
    }

    // Track usage (DALL-E 3 uses ~1 token per image)
    await supabaseClient
      .from('usage_tracking')
      .insert({
        user_id: user.id,
        service_type: 'image_generation',
        tokens_used: 1
      })

    return new Response(
      JSON.stringify({ image_url: publicUrl }),
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