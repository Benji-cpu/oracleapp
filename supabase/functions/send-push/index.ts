import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PushMessage {
  to: string[]
  title: string
  body: string
  data?: any
  sound?: string
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

    const { user_id, title, body, data } = await req.json()

    if (!user_id || !title || !body) {
      return new Response(
        JSON.stringify({ error: 'user_id, title, and body are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get user's push tokens
    const { data: tokens, error: tokensError } = await supabaseClient
      .from('push_tokens')
      .select('token, platform')
      .eq('user_id', user_id)

    if (tokensError) {
      throw new Error(`Failed to fetch push tokens: ${tokensError.message}`)
    }

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No push tokens found for user' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Save notification to database
    await supabaseClient
      .from('notifications')
      .insert({
        user_id,
        title,
        body,
        read: false
      })

    // Prepare messages for Expo Push API
    const messages: PushMessage[] = tokens.map(tokenData => ({
      to: [tokenData.token],
      title,
      body,
      data: data || {},
      sound: 'default'
    }))

    // Send push notifications via Expo Push API
    const pushResults = []
    
    for (const message of messages) {
      try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        })

        const result = await response.json()
        pushResults.push(result)

        // If token is invalid, remove it from database
        if (result.data && result.data[0] && result.data[0].status === 'error') {
          const errorDetails = result.data[0].details
          if (errorDetails && errorDetails.error === 'DeviceNotRegistered') {
            await supabaseClient
              .from('push_tokens')
              .delete()
              .eq('token', message.to[0])
          }
        }
      } catch (error) {
        console.error('Failed to send push notification:', error)
        pushResults.push({ error: error.message })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent_to: tokens.length,
        results: pushResults
      }),
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