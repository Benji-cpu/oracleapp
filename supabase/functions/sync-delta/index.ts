import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYNC_TABLES = [
  'profiles',
  'decks', 
  'cards',
  'readings',
  'journal_entries',
  'notifications'
]

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

    const { pull_since, push_ops = [] } = await req.json()

    // Process push operations first (local changes to sync to server)
    const pushResults = []
    
    for (const op of push_ops) {
      try {
        const { table, operation, data, id } = op
        
        if (!SYNC_TABLES.includes(table)) {
          throw new Error(`Table ${table} not allowed for sync`)
        }

        let result = null

        switch (operation) {
          case 'INSERT':
            const { data: insertData, error: insertError } = await supabaseClient
              .from(table)
              .insert({ ...data, user_id: user.id })
              .select()
              .single()
            
            if (insertError) throw insertError
            result = { success: true, data: insertData }
            break

          case 'UPDATE':
            const { data: updateData, error: updateError } = await supabaseClient
              .from(table)
              .update(data)
              .eq('id', id)
              .eq('user_id', user.id)
              .select()
              .single()
            
            if (updateError) throw updateError
            result = { success: true, data: updateData }
            break

          case 'DELETE':
            const { error: deleteError } = await supabaseClient
              .from(table)
              .delete()
              .eq('id', id)
              .eq('user_id', user.id)
            
            if (deleteError) throw deleteError
            result = { success: true }
            break

          default:
            throw new Error(`Unsupported operation: ${operation}`)
        }

        pushResults.push({ operation: op, result })
      } catch (error) {
        pushResults.push({ operation: op, error: error.message })
      }
    }

    // Process pull operations (server changes to sync to local)
    const pullChanges: any = {}
    
    if (pull_since) {
      const sinceDate = new Date(pull_since).toISOString()
      
      for (const table of SYNC_TABLES) {
        try {
          let query = supabaseClient
            .from(table)
            .select('*')
            .gte('updated_at', sinceDate)

          // For tables that have user_id, filter by current user
          if (['decks', 'readings', 'journal_entries', 'notifications'].includes(table)) {
            query = query.eq('user_id', user.id)
          } else if (table === 'cards') {
            // Cards are filtered by deck ownership
            query = supabaseClient
              .from(table)
              .select(`
                *,
                decks!inner(user_id)
              `)
              .eq('decks.user_id', user.id)
              .gte('updated_at', sinceDate)
          } else if (table === 'profiles') {
            query = query.eq('id', user.id)
          }

          const { data, error } = await query

          if (error) {
            throw error
          }

          if (data && data.length > 0) {
            pullChanges[table] = data
          }
        } catch (error) {
          console.error(`Error syncing table ${table}:`, error)
          pullChanges[`${table}_error`] = error.message
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        push_results: pushResults,
        pull_changes: pullChanges,
        timestamp: new Date().toISOString()
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