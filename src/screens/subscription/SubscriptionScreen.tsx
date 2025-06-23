import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { Button, Text, View, YStack, XStack, ScrollView } from '@tamagui/core';
import { useAuthStore } from '../../stores/authStore';
import { subscriptionService, SubscriptionPlan } from '../../services/subscriptionService';

interface SubscriptionScreenProps {
  onClose: () => void;
}

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ onClose }) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    loadPlans();
    
    // Initialize subscription service
    subscriptionService.initialize();
    
    return () => {
      subscriptionService.cleanup();
    };
  }, []);

  const loadPlans = async () => {
    try {
      const availablePlans = await subscriptionService.getSubscriptionPlans();
      setPlans(availablePlans);
    } catch (error) {
      console.error('Failed to load plans:', error);
      Alert.alert('Error', 'Failed to load subscription plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (plan: SubscriptionPlan) => {
    setPurchasing(plan.id);
    try {
      await subscriptionService.purchaseSubscription(plan.id);
    } catch (error: any) {
      console.error('Purchase failed:', error);
      if (error.code !== 'E_USER_CANCELLED') {
        Alert.alert('Purchase Failed', 'Unable to complete purchase. Please try again.');
      }
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestore = async () => {
    try {
      await subscriptionService.restorePurchases();
    } catch (error) {
      Alert.alert('Restore Failed', 'Unable to restore purchases. Please try again.');
    }
  };

  const getCurrentTierBenefits = () => {
    const tier = user?.subscription_tier || 'free';
    
    switch (tier) {
      case 'free':
        return [
          '1 deck',
          '10 AI meanings per day',
          '2 AI images per day',
          '5 AI interpretations per day',
          'Basic spreads',
          'Standard image quality'
        ];
      case 'premium':
        return [
          '50 decks',
          '100 AI meanings per day',
          '20 AI images per day',
          '50 AI interpretations per day',
          'HD image quality',
          'Advanced spreads',
          'Export features'
        ];
      case 'pro':
        return [
          'Unlimited decks',
          '500 AI meanings per day',
          '100 AI images per day',
          '200 AI interpretations per day',
          'Ultra HD image quality',
          'All spreads & features',
          'Priority support',
          'Advanced analytics'
        ];
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <YStack space="$4" padding="$4" alignItems="center">
          <Text fontSize="$6">Loading subscription plans...</Text>
        </YStack>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <YStack space="$4" padding="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <YStack>
            <Text fontSize="$7" fontWeight="bold">
              Upgrade Your Experience
            </Text>
            <Text fontSize="$4" color="$gray10">
              Unlock powerful AI features
            </Text>
          </YStack>
          <Button
            size="$3"
            variant="outlined"
            onPress={onClose}
          >
            Close
          </Button>
        </XStack>

        {/* Current Plan */}
        <YStack
          backgroundColor="$blue2"
          padding="$4"
          borderRadius="$4"
          space="$3"
        >
          <Text fontSize="$5" fontWeight="600" color="$blue11">
            Current Plan: {user?.subscription_tier?.toUpperCase() || 'FREE'}
          </Text>
          <YStack space="$2">
            {getCurrentTierBenefits().map((benefit, index) => (
              <Text key={index} fontSize="$3" color="$gray10">
                ✓ {benefit}
              </Text>
            ))}
          </YStack>
        </YStack>

        {/* Subscription Plans */}
        <YStack space="$3">
          <Text fontSize="$6" fontWeight="600">
            Choose Your Plan
          </Text>
          
          {plans.map((plan) => (
            <YStack
              key={plan.id}
              backgroundColor={plan.popular ? "$purple2" : "$gray1"}
              borderColor={plan.popular ? "$purple8" : "$gray6"}
              borderWidth={plan.popular ? 2 : 1}
              borderRadius="$4"
              padding="$4"
              space="$3"
              position="relative"
            >
              {plan.popular && (
                <View
                  position="absolute"
                  top="$-2"
                  right="$4"
                  backgroundColor="$purple9"
                  paddingHorizontal="$3"
                  paddingVertical="$1"
                  borderRadius="$2"
                >
                  <Text fontSize="$2" fontWeight="600" color="white">
                    MOST POPULAR
                  </Text>
                </View>
              )}

              <XStack justifyContent="space-between" alignItems="flex-start">
                <YStack flex={1} space="$2">
                  <Text fontSize="$5" fontWeight="600">
                    {plan.title}
                  </Text>
                  <Text fontSize="$3" color="$gray10">
                    {plan.description}
                  </Text>
                  <Text fontSize="$6" fontWeight="bold" color={plan.popular ? "$purple11" : "$gray12"}>
                    {plan.price}
                    <Text fontSize="$3" color="$gray10">
                      /{plan.period}
                    </Text>
                  </Text>
                </YStack>
              </XStack>

              <YStack space="$2">
                {plan.features.map((feature, index) => (
                  <Text key={index} fontSize="$3" color="$gray10">
                    ✓ {feature}
                  </Text>
                ))}
              </YStack>

              <Button
                size="$4"
                backgroundColor={plan.popular ? "$purple9" : "$blue9"}
                color="white"
                onPress={() => handlePurchase(plan)}
                disabled={purchasing === plan.id}
              >
                {purchasing === plan.id ? 'Processing...' : `Subscribe to ${plan.title}`}
              </Button>
            </YStack>
          ))}
        </YStack>

        {/* Restore Purchases */}
        <YStack space="$3" alignItems="center" paddingVertical="$4">
          <Button
            size="$3"
            variant="outlined"
            onPress={handleRestore}
          >
            Restore Purchases
          </Button>
          
          <Text fontSize="$2" color="$gray9" textAlign="center">
            Already purchased? Tap "Restore Purchases" to restore your subscription.
          </Text>
        </YStack>

        {/* Features Comparison */}
        <YStack
          backgroundColor="$green2"
          padding="$4"
          borderRadius="$4"
          space="$3"
        >
          <Text fontSize="$5" fontWeight="600" color="$green11">
            Why Upgrade?
          </Text>
          
          <YStack space="$2">
            <Text fontSize="$3" color="$gray10">
              🎨 <Text fontWeight="600">AI-Generated Art:</Text> Create stunning, unique oracle card images with DALL-E 3
            </Text>
            <Text fontSize="$3" color="$gray10">
              ✨ <Text fontWeight="600">Meaningful Interpretations:</Text> Get profound insights powered by advanced AI
            </Text>
            <Text fontSize="$3" color="$gray10">
              📚 <Text fontWeight="600">Unlimited Creativity:</Text> Build multiple decks for different purposes
            </Text>
            <Text fontSize="$3" color="$gray10">
              📱 <Text fontWeight="600">Offline Access:</Text> Your content works anywhere, anytime
            </Text>
            <Text fontSize="$3" color="$gray10">
              🔒 <Text fontWeight="600">Privacy First:</Text> Your personal readings stay private and secure
            </Text>
          </YStack>
        </YStack>

        {/* Terms */}
        <YStack space="$2" paddingVertical="$4">
          <Text fontSize="$2" color="$gray9" textAlign="center">
            Subscriptions auto-renew unless cancelled 24 hours before the current period ends.
          </Text>
          <Text fontSize="$2" color="$gray9" textAlign="center">
            Manage subscriptions in your device settings.
          </Text>
        </YStack>
      </YStack>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});