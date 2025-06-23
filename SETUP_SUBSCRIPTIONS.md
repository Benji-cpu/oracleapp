# Subscription Management Setup Instructions

## Required Packages

Add these packages to your project:

```bash
npm install react-native-iap expo-store-review
```

## App Store Connect Setup (iOS)

1. **Create In-App Purchases**:
   - Go to App Store Connect → Your App → Features → In-App Purchases
   - Create 4 Auto-Renewable Subscriptions:
     - `oracle_premium_monthly` - Premium Monthly ($4.99/month)
     - `oracle_premium_yearly` - Premium Yearly ($49.99/year)
     - `oracle_pro_monthly` - Pro Monthly ($14.99/month)
     - `oracle_pro_yearly` - Pro Yearly ($149.99/year)

2. **Subscription Groups**:
   - Create two subscription groups:
     - "Premium" (for monthly/yearly premium)
     - "Pro" (for monthly/yearly pro)

3. **Shared Secret**:
   - Generate a shared secret in App Store Connect
   - Add it to your Supabase Edge Function environment as `APPLE_SHARED_SECRET`

## Google Play Console Setup (Android)

1. **Create Subscriptions**:
   - Go to Google Play Console → Your App → Monetization → Products → Subscriptions
   - Create the same 4 subscriptions with matching product IDs

2. **Service Account**:
   - Create a service account in Google Cloud Console
   - Grant "Viewer" access to Google Play Developer API
   - Download the JSON key file
   - Add the JSON content to Supabase as `GOOGLE_SERVICE_ACCOUNT_KEY`

## Product Configuration

Update the product IDs in `subscriptionService.ts` if needed:

```typescript
const PRODUCT_IDS = {
  premium_monthly: 'oracle_premium_monthly',
  premium_yearly: 'oracle_premium_yearly', 
  pro_monthly: 'oracle_pro_monthly',
  pro_yearly: 'oracle_pro_yearly',
};
```

## Testing

### iOS Testing:
1. Create test accounts in App Store Connect
2. Use Sandbox environment for testing
3. Test purchase, cancellation, and restore flows

### Android Testing:
1. Create test tracks in Google Play Console
2. Add test accounts to license testing
3. Test with internal app sharing

## Integration Steps

1. **Initialize Service**: Call `subscriptionService.initialize()` in your app startup
2. **Add Subscription Screen**: Import and use `SubscriptionScreen` component
3. **Check Status**: Use `subscriptionService.checkSubscriptionStatus()` to verify user tier
4. **Handle Purchases**: The service automatically handles purchase validation via Edge Functions

## Environment Variables

Ensure these are set in your Supabase Edge Functions:

- `APPLE_SHARED_SECRET` - From App Store Connect
- `GOOGLE_SERVICE_ACCOUNT_KEY` - Service account JSON
- `GOOGLE_PACKAGE_NAME` - Your Android package name

## Features by Tier

### Free Tier:
- 1 deck
- 10 AI meanings/day
- 2 AI images/day
- 5 AI interpretations/day

### Premium Tier:
- 50 decks
- 100 AI meanings/day
- 20 AI images/day
- 50 AI interpretations/day
- HD image quality
- Export features

### Pro Tier:
- Unlimited decks
- 500 AI meanings/day
- 100 AI images/day
- 200 AI interpretations/day
- Ultra HD image quality
- Priority support
- Advanced analytics