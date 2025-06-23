import React, { useEffect } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { Button, Text, View, YStack, XStack, ScrollView } from '@tamagui/core';
import { useAuthStore } from '../stores/authStore';
import { useDeckStore } from '../stores/deckStore';
import { SUBSCRIPTION_LIMITS } from '../constants';

export const HomeScreen: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const { decks, fetchDecks, loading } = useDeckStore();

  useEffect(() => {
    fetchDecks();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      Alert.alert('Sign Out Failed', error.message);
    }
  };

  const userLimits = SUBSCRIPTION_LIMITS[user?.subscription_tier || 'free'];

  return (
    <ScrollView style={styles.container}>
      <YStack space="$4" padding="$4">
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center">
          <YStack>
            <Text fontSize="$6" fontWeight="bold">
              Welcome back!
            </Text>
            <Text color="$gray10">
              {user?.username || user?.email}
            </Text>
          </YStack>
          <Button
            size="$3"
            variant="outlined"
            onPress={handleSignOut}
          >
            Sign Out
          </Button>
        </XStack>

        {/* Quick Stats */}
        <YStack
          backgroundColor="$blue2"
          padding="$4"
          borderRadius="$4"
          space="$2"
        >
          <Text fontSize="$5" fontWeight="bold">
            Your Oracle Journey
          </Text>
          <XStack justifyContent="space-between">
            <YStack alignItems="center">
              <Text fontSize="$6" fontWeight="bold" color="$blue11">
                {decks.length}
              </Text>
              <Text fontSize="$3" color="$gray10">
                Decks
              </Text>
            </YStack>
            <YStack alignItems="center">
              <Text fontSize="$6" fontWeight="bold" color="$blue11">
                {userLimits.maxDecks === -1 ? '∞' : userLimits.maxDecks}
              </Text>
              <Text fontSize="$3" color="$gray10">
                Limit
              </Text>
            </YStack>
            <YStack alignItems="center">
              <Text fontSize="$4" fontWeight="bold" color="$purple11">
                {user?.subscription_tier?.toUpperCase()}
              </Text>
              <Text fontSize="$3" color="$gray10">
                Tier
              </Text>
            </YStack>
          </XStack>
        </YStack>

        {/* Quick Actions */}
        <YStack space="$3">
          <Text fontSize="$5" fontWeight="bold">
            Quick Actions
          </Text>
          
          <Button
            size="$4"
            backgroundColor="$green9"
            color="white"
            disabled={userLimits.maxDecks !== -1 && decks.length >= userLimits.maxDecks}
          >
            Create New Deck
          </Button>

          <XStack space="$3">
            <Button
              flex={1}
              size="$4"
              variant="outlined"
              disabled={decks.length === 0}
            >
              Start Reading
            </Button>
            <Button
              flex={1}
              size="$4"
              variant="outlined"
            >
              View Journal
            </Button>
          </XStack>
        </YStack>

        {/* Recent Decks */}
        <YStack space="$3">
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$5" fontWeight="bold">
              Your Decks
            </Text>
            <Text color="$blue10" fontSize="$3">
              View All
            </Text>
          </XStack>

          {loading ? (
            <Text color="$gray10" textAlign="center">
              Loading decks...
            </Text>
          ) : decks.length === 0 ? (
            <YStack
              backgroundColor="$gray2"
              padding="$4"
              borderRadius="$4"
              alignItems="center"
              space="$2"
            >
              <Text fontSize="$4" color="$gray10">
                No decks yet
              </Text>
              <Text fontSize="$3" color="$gray9" textAlign="center">
                Create your first oracle deck to begin your spiritual journey
              </Text>
            </YStack>
          ) : (
            <YStack space="$2">
              {decks.slice(0, 3).map((deck) => (
                <XStack
                  key={deck.id}
                  backgroundColor="$gray2"
                  padding="$3"
                  borderRadius="$3"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <YStack>
                    <Text fontSize="$4" fontWeight="600">
                      {deck.name}
                    </Text>
                    <Text fontSize="$3" color="$gray10">
                      {deck.card_count} cards
                    </Text>
                  </YStack>
                  <Button size="$2" variant="outlined">
                    Open
                  </Button>
                </XStack>
              ))}
            </YStack>
          )}
        </YStack>

        {/* Upgrade Prompt for Free Users */}
        {user?.subscription_tier === 'free' && (
          <YStack
            backgroundColor="$purple2"
            padding="$4"
            borderRadius="$4"
            space="$2"
          >
            <Text fontSize="$4" fontWeight="bold" color="$purple11">
              Unlock Premium Features
            </Text>
            <Text fontSize="$3" color="$gray10">
              Create up to 50 decks, unlimited AI generations, and export your creations
            </Text>
            <Button
              size="$3"
              backgroundColor="$purple9"
              color="white"
            >
              Upgrade Now
            </Button>
          </YStack>
        )}
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