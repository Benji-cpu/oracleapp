# 🚀 Oracle Card Creator - Launch Checklist

## Pre-Launch Setup Required

Before we can launch the app, these backend services need to be configured:

### 1. ⚡ Supabase Database Setup (5 minutes)
```bash
# 1. Go to: https://supabase.com/dashboard/project/clwluvdlgsrfldvivqhy
# 2. Navigate to SQL Editor
# 3. Copy and paste the content from: supabase/migrations/001_initial_schema.sql
# 4. Click "Run" to create all tables and policies
```

### 2. 🤖 API Keys Setup (10 minutes)
```bash
# Get these API keys:
# 1. Google Gemini API key: https://makersuite.google.com/app/apikey
# 2. OpenAI API key: https://platform.openai.com/api-keys

# Add to Supabase Edge Functions environment:
# Go to: Project Settings > Edge Functions > Environment Variables
# Add:
# - GEMINI_API_KEY: your_gemini_key
# - OPENAI_API_KEY: your_openai_key
```

### 3. 📁 Storage Setup (2 minutes)
```bash
# 1. Go to: Storage section in Supabase dashboard
# 2. Create new bucket: "card-images"
# 3. Set to Public access
# 4. Run the storage policies from SETUP_STORAGE.md
```

### 4. ⚙️ Deploy Edge Functions (5 minutes)
```bash
# In your terminal:
npx supabase login
npx supabase link --project-ref clwluvdlgsrfldvivqhy
npx supabase functions deploy generate-meaning
npx supabase functions deploy generate-image
npx supabase functions deploy interpret-reading
npx supabase functions deploy send-push
npx supabase functions deploy validate-receipt
npx supabase functions deploy sync-delta
```

## 🎯 Quick Launch (Development)

If you want to test the app immediately with basic functionality:

### Option A: Launch with Simulated Backend
```bash
# This will work immediately but won't have real AI features
npm start
# or
npx expo start
```

### Option B: Launch with Minimal Backend (Recommended)
```bash
# 1. Set up database (step 1 above) - Required for user accounts
# 2. Skip AI keys for now - app will show "AI feature coming soon"
# 3. Launch the app:
npm start
```

## 🏗️ Full Production Launch

For the complete experience with all AI features:

### 1. Complete All Setup Steps Above
- Database schema deployed ✅
- API keys configured ✅  
- Storage bucket created ✅
- Edge Functions deployed ✅

### 2. Install Missing Dependencies
```bash
cd "/Users/benhemson-struthers/Documents/Code/Oracle App V2/oracle-card-creator"
npm install react-native-iap expo-store-review @sentry/react-native posthog-react-native
```

### 3. Update Environment Variables
```bash
# Create .env file with:
EXPO_PUBLIC_SUPABASE_URL=https://clwluvdlgsrfldvivqhy.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Launch Development Server
```bash
npx expo start --clear
```

## 🚨 Quick Start (Right Now!)

Want to see the app running immediately? Here's the fastest path:

1. **Deploy Database Schema** (Required - 3 minutes):
   - Go to Supabase SQL Editor
   - Run the migration file
   - This enables user accounts and basic functionality

2. **Launch App**:
   ```bash
   cd "/Users/benhemson-struthers/Documents/Code/Oracle App V2/oracle-card-creator"
   npx expo start
   ```

3. **Test Core Features**:
   - ✅ User registration/login
   - ✅ Deck creation
   - ✅ Card creation (basic)
   - ✅ Reading engine
   - ✅ Journal system
   - ⏳ AI features (will show "coming soon" until API keys added)

## 🎯 What Works Right Now

Even without the full backend setup, you can test:

- **Complete UI/UX flow**
- **Navigation between screens** 
- **User authentication** (with database)
- **Deck and card management**
- **Reading engine with all spread types**
- **Journal system with mood tracking**
- **Offline functionality**

## 🔥 Full AI Features Available After Setup

Once you complete the API key configuration:

- **Real AI-generated card meanings** (Gemini)
- **Beautiful AI-generated card images** (DALL-E 3)
- **Personalized reading interpretations**
- **Smart usage limits by subscription tier**
- **Professional image storage**

## 📱 Ready for App Stores

After full setup, the app is ready for:
- **TestFlight/Internal Testing** (iOS)
- **Google Play Internal Testing** (Android)
- **Production App Store submission**

---

## 🚀 LAUNCH DECISION

**Choose your launch speed:**

1. **🟢 INSTANT (Right Now)**: Launch with database only → Basic app works
2. **🟡 QUICK (15 minutes)**: Add API keys → Full AI features work  
3. **🔵 COMPLETE (30 minutes)**: Full production setup → Store-ready

What would you like to do? I can help you with any of these paths!