# Edge Functions Setup Instructions

## Environment Variables Required

Set these environment variables in your Supabase project:

1. `GEMINI_API_KEY` - Google Gemini API key for AI text generation
2. `OPENAI_API_KEY` - OpenAI API key for DALL-E image generation
3. `APPLE_SHARED_SECRET` - Apple App Store shared secret for receipt validation
4. `GOOGLE_SERVICE_ACCOUNT_KEY` - Google Play service account JSON key
5. `GOOGLE_PACKAGE_NAME` - Your app's Android package name

## Deploy Edge Functions

Run these commands to deploy all Edge Functions to Supabase:

```bash
# Login to Supabase (if not already logged in)
npx supabase login

# Link to your project
npx supabase link --project-ref clwluvdlgsrfldvivqhy

# Deploy all functions
npx supabase functions deploy generate-meaning
npx supabase functions deploy generate-image
npx supabase functions deploy interpret-reading
npx supabase functions deploy send-push
npx supabase functions deploy validate-receipt
npx supabase functions deploy sync-delta
```

## Function Endpoints

After deployment, your functions will be available at:

- `https://clwluvdlgsrfldvivqhy.supabase.co/functions/v1/generate-meaning`
- `https://clwluvdlgsrfldvivqhy.supabase.co/functions/v1/generate-image`
- `https://clwluvdlgsrfldvivqhy.supabase.co/functions/v1/interpret-reading`
- `https://clwluvdlgsrfldvivqhy.supabase.co/functions/v1/send-push`
- `https://clwluvdlgsrfldvivqhy.supabase.co/functions/v1/validate-receipt`
- `https://clwluvdlgsrfldvivqhy.supabase.co/functions/v1/sync-delta`

## Storage Setup

Create a storage bucket for card images:

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `card-images`
3. Set it to public access for generated card images
4. Configure appropriate upload policies

## Usage Limits by Tier

### Free Tier:
- Meaning generation: 10 per day
- Image generation: 2 per day  
- Reading interpretation: 5 per day

### Premium Tier:
- Meaning generation: 100 per day
- Image generation: 20 per day
- Reading interpretation: 50 per day

### Pro Tier:
- Meaning generation: 500 per day
- Image generation: 100 per day
- Reading interpretation: 200 per day