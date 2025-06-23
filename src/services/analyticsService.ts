import * as Sentry from '@sentry/react-native';
import PostHog from 'posthog-react-native';
import { Platform } from 'react-native';
import { useAuthStore } from '../stores/authStore';

// Analytics event types
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
}

export interface UserProperties {
  subscription_tier?: string;
  total_decks?: number;
  total_readings?: number;
  signup_date?: string;
  platform?: string;
}

export class AnalyticsService {
  private postHog: PostHog | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    try {
      // Initialize PostHog
      this.postHog = new PostHog(
        'phc_YOUR_PROJECT_API_KEY', // Replace with your actual PostHog API key
        {
          host: 'https://app.posthog.com', // or your self-hosted instance
          disabled: __DEV__, // Disable in development
          captureApplicationLifecycleEvents: true,
          captureDeepLinks: true,
          recordScreenViews: true,
          sessionRecording: {
            maskAllInputs: true,
            androidMaskAllInputs: true,
          },
        }
      );

      // Initialize Sentry
      Sentry.init({
        dsn: 'YOUR_SENTRY_DSN', // Replace with your actual Sentry DSN
        debug: __DEV__,
        environment: __DEV__ ? 'development' : 'production',
        beforeSend: (event) => {
          // Filter out events we don't want to track
          if (__DEV__) {
            console.log('Sentry event:', event);
            return null; // Don't send in development
          }
          return event;
        },
        integrations: [
          new Sentry.ReactNativeTracing({
            tracingOrigins: ['localhost', /^https:\/\/yourapi\.com/],
            routingInstrumentation: Sentry.reactNavigationIntegration(),
          }),
        ],
        tracesSampleRate: 0.1, // 10% of transactions
      });

      this.isInitialized = true;
      console.log('Analytics services initialized');
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  // User Management
  async identifyUser(userId: string, properties?: UserProperties): Promise<void> {
    if (!this.isInitialized) return;

    try {
      // PostHog user identification
      if (this.postHog) {
        await this.postHog.identify(userId, {
          platform: Platform.OS,
          app_version: '1.0.0', // You can get this from your app.json
          ...properties,
        });
      }

      // Sentry user context
      Sentry.setUser({
        id: userId,
        subscription: properties?.subscription_tier,
        platform: Platform.OS,
      });
    } catch (error) {
      console.error('Error identifying user:', error);
    }
  }

  async updateUserProperties(properties: UserProperties): Promise<void> {
    if (!this.isInitialized || !this.postHog) return;

    try {
      const { user } = useAuthStore.getState();
      if (user) {
        await this.postHog.identify(user.id, properties);
      }
    } catch (error) {
      console.error('Error updating user properties:', error);
    }
  }

  // Event Tracking
  async track(event: string, properties?: Record<string, any>): Promise<void> {
    if (!this.isInitialized) return;

    try {
      const { user } = useAuthStore.getState();
      
      const eventProperties = {
        platform: Platform.OS,
        timestamp: new Date().toISOString(),
        user_id: user?.id,
        subscription_tier: user?.subscription_tier,
        ...properties,
      };

      // PostHog tracking
      if (this.postHog) {
        await this.postHog.capture(event, eventProperties);
      }

      // Also log to console in development
      if (__DEV__) {
        console.log('Analytics Event:', event, eventProperties);
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  // Screen Tracking
  async screenView(screenName: string, properties?: Record<string, any>): Promise<void> {
    await this.track('$screen', {
      $screen_name: screenName,
      ...properties,
    });
  }

  // Business Events
  async trackDeckCreated(deckId: string, deckName: string, cardCount: number = 0): Promise<void> {
    await this.track('Deck Created', {
      deck_id: deckId,
      deck_name: deckName,
      card_count: cardCount,
    });
  }

  async trackCardCreated(cardId: string, deckId: string, hasAIMeaning: boolean, hasAIImage: boolean): Promise<void> {
    await this.track('Card Created', {
      card_id: cardId,
      deck_id: deckId,
      has_ai_meaning: hasAIMeaning,
      has_ai_image: hasAIImage,
    });
  }

  async trackReadingStarted(readingId: string, deckId: string, spreadType: string, hasIntention: boolean): Promise<void> {
    await this.track('Reading Started', {
      reading_id: readingId,
      deck_id: deckId,
      spread_type: spreadType,
      has_intention: hasIntention,
    });
  }

  async trackReadingCompleted(readingId: string, spreadType: string, hasAIInterpretation: boolean, duration?: number): Promise<void> {
    await this.track('Reading Completed', {
      reading_id: readingId,
      spread_type: spreadType,
      has_ai_interpretation: hasAIInterpretation,
      duration_seconds: duration,
    });
  }

  async trackJournalEntryCreated(entryId: string, readingId?: string, wordCount?: number, hasMood?: boolean): Promise<void> {
    await this.track('Journal Entry Created', {
      entry_id: entryId,
      reading_id: readingId,
      word_count: wordCount,
      has_mood: hasMood,
    });
  }

  async trackAIUsage(serviceType: 'meaning' | 'image' | 'interpretation', tokensUsed: number, success: boolean): Promise<void> {
    await this.track('AI Service Used', {
      service_type: serviceType,
      tokens_used: tokensUsed,
      success,
    });
  }

  async trackSubscriptionEvent(event: 'started' | 'completed' | 'cancelled' | 'restored', productId?: string, tier?: string): Promise<void> {
    await this.track('Subscription Event', {
      subscription_event: event,
      product_id: productId,
      tier,
    });
  }

  async trackOnboardingStep(step: string, completed: boolean): Promise<void> {
    await this.track('Onboarding Step', {
      step,
      completed,
    });
  }

  async trackFeatureUsage(feature: string, context?: string): Promise<void> {
    await this.track('Feature Used', {
      feature,
      context,
    });
  }

  // Error Tracking
  captureException(error: Error, context?: Record<string, any>): void {
    if (!this.isInitialized) {
      console.error('Untracked error:', error);
      return;
    }

    // Add context to Sentry
    if (context) {
      Sentry.withScope((scope) => {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value);
        });
        Sentry.captureException(error);
      });
    } else {
      Sentry.captureException(error);
    }

    // Also track as PostHog event
    this.track('Error Occurred', {
      error_message: error.message,
      error_stack: error.stack,
      ...context,
    }).catch(console.error);
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>): void {
    if (!this.isInitialized) {
      console.log('Untracked message:', message);
      return;
    }

    Sentry.captureMessage(message, level);
    
    this.track('Message Logged', {
      message,
      level,
      ...context,
    }).catch(console.error);
  }

  // Performance Tracking
  startTransaction(name: string, operation: string = 'navigation'): any {
    if (!this.isInitialized) return null;
    
    return Sentry.startTransaction({
      name,
      op: operation,
    });
  }

  // A/B Testing Support
  async getFeatureFlag(flagKey: string, defaultValue: boolean = false): Promise<boolean> {
    if (!this.isInitialized || !this.postHog) return defaultValue;

    try {
      return await this.postHog.isFeatureEnabled(flagKey);
    } catch (error) {
      console.error('Error getting feature flag:', error);
      return defaultValue;
    }
  }

  // Cleanup
  async flush(): Promise<void> {
    if (!this.isInitialized) return;

    try {
      if (this.postHog) {
        await this.postHog.flush();
      }
      await Sentry.flush(2000); // 2 second timeout
    } catch (error) {
      console.error('Error flushing analytics:', error);
    }
  }

  async reset(): Promise<void> {
    if (!this.isInitialized) return;

    try {
      if (this.postHog) {
        await this.postHog.reset();
      }
      Sentry.configureScope((scope) => scope.clear());
    } catch (error) {
      console.error('Error resetting analytics:', error);
    }
  }
}

// Create singleton instance
export const analyticsService = new AnalyticsService();

// React Navigation screen tracking helper
export const trackScreenView = (routeName: string, routeParams?: any) => {
  analyticsService.screenView(routeName, {
    route_params: routeParams,
  });
};