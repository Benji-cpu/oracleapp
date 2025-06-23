# Oracle Card Creator - End-to-End Testing Plan

## Pre-Testing Setup Checklist

### 1. Database Setup
- [ ] Run SQL migration in Supabase dashboard (`supabase/migrations/001_initial_schema.sql`)
- [ ] Verify all tables created correctly
- [ ] Test RLS policies are working
- [ ] Confirm user signup triggers work

### 2. Storage Setup
- [ ] Create `card-images` bucket in Supabase Storage
- [ ] Set bucket to public access
- [ ] Configure storage policies
- [ ] Test file upload permissions

### 3. Edge Functions Deployment
- [ ] Deploy all 6 Edge Functions to Supabase
- [ ] Set environment variables:
  - `GEMINI_API_KEY`
  - `OPENAI_API_KEY`
  - `APPLE_SHARED_SECRET`
  - `GOOGLE_SERVICE_ACCOUNT_KEY`
  - `GOOGLE_PACKAGE_NAME`
- [ ] Test function invocations

### 4. External API Keys
- [ ] Verify Gemini API key is active
- [ ] Verify OpenAI API key has credits
- [ ] Test API connectivity

## Testing Scenarios

### 1. User Authentication Flow
```bash
# Test user registration
✓ Create new account with email/password
✓ Verify profile created in database
✓ Test login with correct credentials
✓ Test login with incorrect credentials
✓ Test password reset flow
✓ Test session persistence
```

### 2. Deck Management
```bash
# Test deck CRUD operations
✓ Create first deck (should work for free tier)
✓ Try to create second deck as free user (should be blocked)
✓ Edit deck name and description
✓ Delete deck
✓ Verify deck sync to Supabase
```

### 3. Card Creation & AI Integration
```bash
# Test card creation with AI
✓ Create card with basic title
✓ Generate AI meaning (test Gemini integration)
✓ Generate AI image (test DALL-E integration)
✓ Verify image stored in Supabase Storage
✓ Test with invalid/empty inputs
✓ Test AI usage limits for free tier
```

### 4. Reading Engine
```bash
# Test reading functionality
✓ Start reading with different spread types
✓ Draw cards from deck
✓ Complete reading
✓ Generate AI interpretation
✓ Save reading to database
✓ View reading history
```

### 5. Journal System
```bash
# Test journal functionality
✓ Create journal entry linked to reading
✓ Create standalone journal entry
✓ Add mood and tags
✓ Edit existing entry
✓ View journal timeline
✓ Verify offline functionality
```

### 6. Subscription & IAP
```bash
# Test subscription flow (sandbox mode)
✓ View subscription plans
✓ Initiate purchase (sandbox)
✓ Test receipt validation
✓ Verify tier upgrade in database
✓ Test increased limits
✓ Test restore purchases
```

### 7. Push Notifications
```bash
# Test notification system
✓ Register for push notifications
✓ Save push token to database
✓ Send test notification via Edge Function
✓ Handle notification tap
✓ Test different notification types
```

### 8. Offline Functionality
```bash
# Test offline-first architecture
✓ Create content while offline
✓ Verify local storage (WatermelonDB)
✓ Test sync when back online
✓ Handle sync conflicts
✓ Verify data integrity
```

## Critical Test Cases

### 1. AI Generation Limits
```typescript
// Test free tier limits
- Generate 10 meanings (should work)
- Try 11th meaning (should fail)
- Generate 2 images (should work)
- Try 3rd image (should fail)
- Generate 5 interpretations (should work)
- Try 6th interpretation (should fail)
```

### 2. Subscription Upgrade
```typescript
// Test tier upgrade benefits
- Upgrade to Premium
- Verify increased limits apply immediately
- Test premium-only features
- Verify HD image quality
```

### 3. Error Handling
```typescript
// Test graceful error handling
- Network connection loss
- API key invalid/expired
- Database connection issues
- Invalid user input
- Payment failures
```

### 4. Data Consistency
```typescript
// Test data sync and consistency
- Create content on Device A
- Verify sync to server
- Login on Device B
- Verify content appears
- Edit on Device B
- Verify sync back to Device A
```

## Performance Testing

### 1. App Launch Time
- [ ] Cold start < 3 seconds
- [ ] Warm start < 1 second
- [ ] Initial data load < 2 seconds

### 2. AI Generation Speed
- [ ] Meaning generation < 10 seconds
- [ ] Image generation < 30 seconds
- [ ] Interpretation generation < 15 seconds

### 3. Offline Performance
- [ ] Local operations < 500ms
- [ ] Sync time proportional to changes
- [ ] No UI blocking during sync

## Automated Testing Commands

### Install Testing Dependencies
```bash
npm install --save-dev @testing-library/react-native @testing-library/jest-native jest-expo detox
```

### Run Tests
```bash
# Unit tests
npm run test

# Component tests
npm run test:components

# E2E tests (requires setup)
npm run test:e2e
```

## Manual Testing Checklist

### Daily Testing Routine
- [ ] User can sign up/login
- [ ] Can create and edit decks
- [ ] AI features work end-to-end
- [ ] Reading flow completes successfully
- [ ] Journal entries save correctly
- [ ] Sync works between devices
- [ ] No critical errors in logs

### Weekly Testing Routine
- [ ] Full subscription flow
- [ ] Push notification delivery
- [ ] Performance benchmarks
- [ ] Error rate monitoring
- [ ] User feedback review

### Pre-Release Testing
- [ ] Complete end-to-end user journey
- [ ] Cross-platform compatibility (iOS/Android)
- [ ] Different device sizes and orientations
- [ ] Network conditions (3G, WiFi, offline)
- [ ] Battery usage optimization
- [ ] Memory usage profiling

## Monitoring & Metrics

### Success Metrics
- Crash-free sessions > 99.5%
- API response times < 2s P95
- User retention Day 1 > 70%
- AI generation success rate > 95%
- Sync conflict rate < 1%

### Error Tracking
- Sentry error monitoring
- PostHog funnel analysis
- Supabase Edge Function logs
- API usage tracking
- User feedback collection

## Launch Readiness

### ✅ All Tests Pass
- [ ] Unit tests: 100% pass rate
- [ ] Integration tests: 100% pass rate
- [ ] E2E scenarios: All critical paths work
- [ ] Performance benchmarks: Meet targets
- [ ] Security review: No critical vulnerabilities

### ✅ Infrastructure Ready
- [ ] Database schema deployed
- [ ] Edge Functions deployed
- [ ] Storage configured
- [ ] API keys active
- [ ] Monitoring setup

### ✅ External Integrations
- [ ] App Store/Play Store configured
- [ ] Subscription products created
- [ ] Push notification certificates
- [ ] Analytics tracking verified

The Oracle Card Creator app is now feature-complete with a full backend infrastructure, real AI integrations, subscription management, push notifications, and analytics. All core functionality has been implemented according to the PRD requirements.