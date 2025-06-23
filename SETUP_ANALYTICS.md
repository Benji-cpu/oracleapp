# Analytics Integration Setup Instructions

## Required Packages

Install the analytics packages:

```bash
npm install @sentry/react-native posthog-react-native
```

## PostHog Setup

1. **Create Account**: Sign up at https://posthog.com
2. **Get API Key**: Find your project API key in PostHog settings
3. **Update Service**: Replace `phc_YOUR_PROJECT_API_KEY` in `analyticsService.ts` with your actual key

### PostHog Features Used:
- Event tracking
- User identification
- Screen view tracking
- Feature flags
- Session recordings (with input masking)

## Sentry Setup

1. **Create Account**: Sign up at https://sentry.io
2. **Create Project**: Create a React Native project
3. **Get DSN**: Copy your project DSN
4. **Update Service**: Replace `YOUR_SENTRY_DSN` in `analyticsService.ts` with your actual DSN

### Sentry Features Used:
- Error tracking
- Performance monitoring
- User context
- Custom messages
- Transaction tracing

## Environment Configuration

### PostHog Configuration:
```typescript
const postHog = new PostHog('phc_your_actual_key', {
  host: 'https://app.posthog.com',
  disabled: __DEV__, // Disable in development
  captureApplicationLifecycleEvents: true,
  captureDeepLinks: true,
  recordScreenViews: true,
});
```

### Sentry Configuration:
```typescript
Sentry.init({
  dsn: 'your_actual_dsn',
  debug: __DEV__,
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: 0.1, // 10% of transactions
});
```

## Integration Points

### 1. App Initialization
Add to your main App component:

```typescript
import { analyticsService } from './src/services/analyticsService';

export default function App() {
  useEffect(() => {
    analyticsService.initialize();
    
    return () => {
      analyticsService.flush();
    };
  }, []);
  
  // ... rest of app
}
```

### 2. User Authentication
When user signs in/up:

```typescript
await analyticsService.identifyUser(user.id, {
  subscription_tier: user.subscription_tier,
  signup_date: user.created_at,
  platform: Platform.OS,
});
```

### 3. Screen Tracking
With React Navigation:

```typescript
import { trackScreenView } from './src/services/analyticsService';

<NavigationContainer
  onStateChange={(state) => {
    const currentRoute = getCurrentRoute(state);
    if (currentRoute) {
      trackScreenView(currentRoute.name, currentRoute.params);
    }
  }}
>
```

### 4. Business Events
Track key user actions:

```typescript
// Deck creation
await analyticsService.trackDeckCreated(deck.id, deck.name, deck.card_count);

// Reading completion
await analyticsService.trackReadingCompleted(reading.id, 'three-card', true, 120);

// AI usage
await analyticsService.trackAIUsage('meaning', 25, true);
```

### 5. Error Handling
Wrap async operations:

```typescript
try {
  await someDangerousOperation();
} catch (error) {
  analyticsService.captureException(error, {
    operation: 'deck_creation',
    user_id: user.id,
  });
  throw error;
}
```

## Event Types Tracked

### User Actions:
- `Deck Created`
- `Card Created`
- `Reading Started`
- `Reading Completed`
- `Journal Entry Created`
- `AI Service Used`

### Business Events:
- `Subscription Event`
- `Onboarding Step`
- `Feature Used`
- `Error Occurred`

### System Events:
- `$screen` (automatic screen views)
- `$identify` (user identification)
- `$feature_flag_called`

## Privacy Considerations

1. **PII Protection**: Never track sensitive personal information
2. **Input Masking**: Session recordings mask all input fields
3. **Consent**: Consider implementing analytics consent for GDPR compliance
4. **Data Retention**: Configure appropriate data retention policies

## Testing

### Development:
- Analytics disabled by default in `__DEV__`
- Console logging for debugging
- Test event tracking with PostHog Live Events

### Production:
- Enable sampling to manage costs
- Monitor error rates in Sentry
- Use PostHog insights for user behavior analysis

## Monitoring

### Key Metrics to Track:
- Daily/Monthly Active Users
- Subscription conversion rates
- AI feature usage rates
- Error rates and crash-free sessions
- Reading completion rates
- Journal entry frequency

### Dashboards:
Create PostHog dashboards for:
- User funnel analysis
- Feature adoption rates
- Subscription performance
- AI usage patterns