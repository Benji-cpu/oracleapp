# Database Setup Instructions

## Supabase Database Schema Setup

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/clwluvdlgsrfldvivqhy
2. Navigate to the SQL Editor
3. Run the SQL migration located at: `supabase/migrations/001_initial_schema.sql`

This will create all the necessary tables, indexes, RLS policies, and functions needed for the Oracle Card Creator app.

## Tables Created:
- `profiles` - User profile information
- `decks` - Oracle card decks
- `cards` - Individual cards within decks
- `readings` - Card reading sessions
- `journal_entries` - User journal entries
- `usage_tracking` - API usage tracking
- `push_tokens` - Push notification tokens
- `purchases` - In-app purchase records
- `deck_versions` - Deck version history
- `notifications` - User notifications
- `symbol_library` - Symbolic assets library
- `ai_jobs` - AI processing job queue

## Security:
- Row Level Security (RLS) enabled on all user tables
- Proper foreign key relationships
- Automated triggers for updated_at timestamps
- User signup handler function

## Next Steps:
After running the migration, proceed to create the Edge Functions for AI integration.