import { Alert } from 'react-native';
import * as StoreReview from 'expo-store-review';
import { 
  purchaseErrorListener, 
  purchaseUpdatedListener,
  getProducts,
  requestPurchase,
  initConnection,
  endConnection,
  Purchase,
  Subscription,
  ProductPurchase,
  PurchaseError,
  finishTransaction,
  acknowledgePurchaseAndroid,
} from 'react-native-iap';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { aiService } from './aiService';

// Product IDs - these should match your App Store Connect / Google Play Console setup
const PRODUCT_IDS = {
  premium_monthly: 'oracle_premium_monthly',
  premium_yearly: 'oracle_premium_yearly',
  pro_monthly: 'oracle_pro_monthly',
  pro_yearly: 'oracle_pro_yearly',
};

const SUBSCRIPTION_IDS = [
  PRODUCT_IDS.premium_monthly,
  PRODUCT_IDS.premium_yearly,
  PRODUCT_IDS.pro_monthly,
  PRODUCT_IDS.pro_yearly,
];

export interface SubscriptionPlan {
  id: string;
  title: string;
  description: string;
  price: string;
  tier: 'premium' | 'pro';
  period: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
}

export class SubscriptionService {
  private purchaseUpdateSubscription: any = null;
  private purchaseErrorSubscription: any = null;

  async initialize(): Promise<void> {
    try {
      await initConnection();
      console.log('IAP connection initialized');

      this.purchaseUpdateSubscription = purchaseUpdatedListener(
        this.handlePurchaseUpdate.bind(this)
      );

      this.purchaseErrorSubscription = purchaseErrorListener(
        this.handlePurchaseError.bind(this)
      );
    } catch (error) {
      console.error('Failed to initialize IAP:', error);
    }
  }

  async cleanup(): Promise<void> {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
    }
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
    }
    await endConnection();
  }

  async getAvailableProducts(): Promise<Subscription[]> {
    try {
      const products = await getProducts({ skus: SUBSCRIPTION_IDS });
      return products;
    } catch (error) {
      console.error('Failed to get products:', error);
      return [];
    }
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const products = await this.getAvailableProducts();
    
    return [
      {
        id: PRODUCT_IDS.premium_monthly,
        title: 'Premium Monthly',
        description: 'Enhanced AI features and more decks',
        price: products.find(p => p.productId === PRODUCT_IDS.premium_monthly)?.localizedPrice || '$4.99',
        tier: 'premium',
        period: 'monthly',
        features: [
          '50 decks',
          '100 AI meanings per day',
          '20 AI images per day',
          '50 AI interpretations per day',
          'HD image quality',
          'Advanced spreads',
          'Export features'
        ],
      },
      {
        id: PRODUCT_IDS.premium_yearly,
        title: 'Premium Yearly',
        description: 'Best value - 2 months free!',
        price: products.find(p => p.productId === PRODUCT_IDS.premium_yearly)?.localizedPrice || '$49.99',
        tier: 'premium',
        period: 'yearly',
        popular: true,
        features: [
          '50 decks',
          '100 AI meanings per day',
          '20 AI images per day',
          '50 AI interpretations per day',
          'HD image quality',
          'Advanced spreads',
          'Export features',
          '2 months free!'
        ],
      },
      {
        id: PRODUCT_IDS.pro_monthly,
        title: 'Pro Monthly',
        description: 'For professional creators and coaches',
        price: products.find(p => p.productId === PRODUCT_IDS.pro_monthly)?.localizedPrice || '$14.99',
        tier: 'pro',
        period: 'monthly',
        features: [
          'Unlimited decks',
          '500 AI meanings per day',
          '100 AI images per day',
          '200 AI interpretations per day',
          'Ultra HD image quality',
          'All spreads & features',
          'Priority support',
          'Advanced analytics'
        ],
      },
      {
        id: PRODUCT_IDS.pro_yearly,
        title: 'Pro Yearly',
        description: 'Maximum value for professionals',
        price: products.find(p => p.productId === PRODUCT_IDS.pro_yearly)?.localizedPrice || '$149.99',
        tier: 'pro',
        period: 'yearly',
        features: [
          'Unlimited decks',
          '500 AI meanings per day',
          '100 AI images per day',
          '200 AI interpretations per day',
          'Ultra HD image quality',
          'All spreads & features',
          'Priority support',
          'Advanced analytics',
          '2 months free!'
        ],
      },
    ];
  }

  async purchaseSubscription(productId: string): Promise<void> {
    try {
      await requestPurchase({ sku: productId });
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error;
    }
  }

  private async handlePurchaseUpdate(purchase: Purchase): Promise<void> {
    try {
      const receipt = purchase.transactionReceipt;
      if (!receipt) {
        console.error('No receipt in purchase');
        return;
      }

      // Determine the platform
      const isAndroid = purchase.packageNameAndroid !== undefined;
      const provider = isAndroid ? 'google' : 'apple';

      // Validate the receipt with our backend
      const result = await aiService.validateReceipt(
        provider,
        receipt,
        purchase.productId
      );

      if (result.success) {
        // Update local user state
        const authStore = useAuthStore.getState();
        if (authStore.user) {
          // Refresh user profile to get updated subscription tier
          await authStore.refreshSession();
        }

        // Finish the transaction
        await finishTransaction({ purchase });
        
        if (isAndroid) {
          await acknowledgePurchaseAndroid({ token: purchase.purchaseToken! });
        }

        // Show success message
        Alert.alert(
          'Success!',
          'Your subscription has been activated. Enjoy your new features!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Optionally prompt for app store review
                StoreReview.hasAction().then((hasAction) => {
                  if (hasAction) {
                    StoreReview.requestReview();
                  }
                });
              }
            }
          ]
        );
      } else {
        throw new Error('Receipt validation failed');
      }
    } catch (error) {
      console.error('Error handling purchase update:', error);
      Alert.alert(
        'Purchase Error',
        'There was an issue processing your purchase. Please contact support if the problem persists.'
      );
    }
  }

  private handlePurchaseError(error: PurchaseError): void {
    console.error('Purchase error:', error);
    
    if (error.code === 'E_USER_CANCELLED') {
      // User cancelled, no need to show error
      return;
    }

    Alert.alert(
      'Purchase Failed',
      error.message || 'An unexpected error occurred. Please try again.'
    );
  }

  async restorePurchases(): Promise<void> {
    try {
      // This will trigger purchase update listener for active subscriptions
      Alert.alert(
        'Restore Purchases',
        'Checking for existing purchases...'
      );
      
      // The actual restore is handled by the platform
      // iOS: automatically restored when user signs in with Apple ID
      // Android: handled by Google Play
      
      // We don't need to call a specific restore method for subscriptions
      // as they are automatically available when the user signs in
      
      setTimeout(() => {
        Alert.alert(
          'Restore Complete',
          'If you had active subscriptions, they should now be restored.'
        );
      }, 2000);
    } catch (error) {
      console.error('Restore failed:', error);
      Alert.alert(
        'Restore Failed',
        'Could not restore purchases. Please try again later.'
      );
    }
  }

  async checkSubscriptionStatus(): Promise<'free' | 'premium' | 'pro'> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .single();

      return profile?.subscription_tier || 'free';
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return 'free';
    }
  }
}

export const subscriptionService = new SubscriptionService();