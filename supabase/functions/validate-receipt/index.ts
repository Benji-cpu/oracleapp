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

    const { provider, receipt, product_id } = await req.json()

    if (!provider || !receipt || !product_id) {
      return new Response(
        JSON.stringify({ error: 'provider, receipt, and product_id are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    let validationResult = null
    let tier = 'free'
    let expiresAt = null

    if (provider === 'apple') {
      // Validate Apple App Store receipt
      const appleResponse = await fetch('https://buy.itunes.apple.com/verifyReceipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'receipt-data': receipt,
          'password': Deno.env.get('APPLE_SHARED_SECRET'), // Set this in Supabase
          'exclude-old-transactions': true
        }),
      })

      validationResult = await appleResponse.json()

      if (validationResult.status === 0) {
        // Receipt is valid
        const latestReceiptInfo = validationResult.latest_receipt_info?.[0]
        if (latestReceiptInfo) {
          // Map product IDs to tiers
          const productTierMap: Record<string, string> = {
            'oracle_premium_monthly': 'premium',
            'oracle_premium_yearly': 'premium',
            'oracle_pro_monthly': 'pro',
            'oracle_pro_yearly': 'pro',
          }
          
          tier = productTierMap[latestReceiptInfo.product_id] || 'free'
          expiresAt = new Date(parseInt(latestReceiptInfo.expires_date_ms))
        }
      } else {
        throw new Error(`Apple receipt validation failed: ${validationResult.status}`)
      }

    } else if (provider === 'google') {
      // Validate Google Play Store receipt
      // This requires setting up Google Play Developer API and service account
      const packageName = Deno.env.get('GOOGLE_PACKAGE_NAME')
      const googleCredentials = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY')
      
      if (!googleCredentials) {
        throw new Error('Google service account credentials not configured')
      }

      // For this example, we'll assume the receipt validation logic
      // In a real implementation, you'd use the Google Play Developer API
      // to validate the purchase token
      
      const productTierMap: Record<string, string> = {
        'oracle_premium_monthly': 'premium',
        'oracle_premium_yearly': 'premium',
        'oracle_pro_monthly': 'pro',
        'oracle_pro_yearly': 'pro',
      }
      
      tier = productTierMap[product_id] || 'free'
      
      // For subscriptions, set appropriate expiry
      if (product_id.includes('monthly')) {
        expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      } else if (product_id.includes('yearly')) {
        expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 365 days
      }

    } else {
      throw new Error('Unsupported provider')
    }

    // Save purchase record
    const { data: purchase, error: purchaseError } = await supabaseClient
      .from('purchases')
      .insert({
        user_id: user.id,
        provider,
        receipt,
        tier,
        status: 'active',
        expires_at: expiresAt?.toISOString()
      })
      .select()
      .single()

    if (purchaseError) {
      throw new Error(`Failed to save purchase: ${purchaseError.message}`)
    }

    // Update user's subscription tier
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({ subscription_tier: tier })
      .eq('id', user.id)

    if (profileError) {
      throw new Error(`Failed to update profile: ${profileError.message}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        tier,
        expires_at: expiresAt?.toISOString(),
        purchase_id: purchase.id
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