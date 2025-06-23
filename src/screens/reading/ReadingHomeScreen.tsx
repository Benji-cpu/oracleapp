import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Text, View, YStack, XStack, ScrollView } from '@tamagui/core';
import { useAuthStore } from '../../stores/authStore';
import { useReadingStore } from '../../stores/readingStore';
import { useDeckStore } from '../../stores/deckStore';
import { SPREAD_TYPES } from '../../constants';
import { ReadingSetupScreen } from './ReadingSetupScreen';
import { ReadingSessionScreen } from './ReadingSessionScreen';
import type { CardPosition } from '../../types';

export const ReadingHomeScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { readings, fetchReadings, createReading } = useReadingStore();
  const { decks } = useDeckStore();
  const [currentView, setCurrentView] = useState<'home' | 'setup' | 'session'>('home');
  const [sessionData, setSessionData] = useState<{
    deckId: string;
    spreadType: string;
    intention?: string;
  } | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchReadings(user.id);
    }
  }, [user]);

  const handleStartReading = (deckId: string, spreadType: string, intention?: string) => {
    setSessionData({ deckId, spreadType, intention });
    setCurrentView('session');
  };

  const handleCompleteReading = async (cardPositions: CardPosition[], interpretation?: string) => {
    if (!user?.id || !sessionData) return;

    try {
      await createReading({
        user_id: user.id,
        deck_id: sessionData.deckId,
        spread_type: sessionData.spreadType,
        intention: sessionData.intention,
        card_positions: cardPositions,
        ai_interpretation: interpretation,
      });

      setCurrentView('home');
      setSessionData(null);
      fetchReadings(user.id);
    } catch (error) {
      console.error('Failed to save reading:', error);
    }
  };

  if (currentView === 'setup') {
    return (
      <ReadingSetupScreen
        onStartReading={handleStartReading}
        onCancel={() => setCurrentView('home')}
      />
    );
  }

  if (currentView === 'session' && sessionData) {
    return (
      <ReadingSessionScreen
        deckId={sessionData.deckId}
        spreadType={sessionData.spreadType}
        intention={sessionData.intention}
        onComplete={handleCompleteReading}
        onCancel={() => setCurrentView('home')}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <YStack space="$4" padding="$4">
        <Text fontSize="$7" fontWeight="bold">
          Oracle Readings
        </Text>
        <Text color="$gray10">
          Connect with your inner wisdom through guided card readings
        </Text>

        <Button
          size="$4"
          backgroundColor="$purple9"
          color="white"
          onPress={() => setCurrentView('setup')}
          disabled={decks.length === 0}
        >
          🔮 Start New Reading
        </Button>

        {decks.length === 0 && (
          <YStack
            backgroundColor="$yellow2"
            padding="$3"
            borderRadius="$3"
          >
            <Text fontSize="$3" color="$yellow11">
              Create a deck first to start readings
            </Text>
          </YStack>
        )}

        {/* Spread Types Overview */}
        <YStack space="$3">
          <Text fontSize="$5" fontWeight="600">
            Available Spreads
          </Text>
          <YStack space="$2">
            {Object.entries(SPREAD_TYPES).map(([key, spread]) => (
              <YStack
                key={key}
                backgroundColor="$gray2"
                padding="$3"
                borderRadius="$3"
                space="$2"
              >
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="$4" fontWeight="600">
                    {spread.name}
                  </Text>
                  <Text fontSize="$3" color="$purple11">
                    {spread.positions} card{spread.positions > 1 ? 's' : ''}
                  </Text>
                </XStack>
                <Text fontSize="$3" color="$gray10">
                  {spread.description}
                </Text>
              </YStack>
            ))}
          </YStack>
        </YStack>

        {/* Recent Readings */}
        <YStack space="$3">
          <Text fontSize="$5" fontWeight="600">
            Recent Readings
          </Text>
          
          {readings.length === 0 ? (
            <YStack
              backgroundColor="$gray2"
              padding="$4"
              borderRadius="$4"
              alignItems="center"
              space="$2"
            >
              <Text fontSize="$4" color="$gray11">
                No readings yet
              </Text>
              <Text fontSize="$3" color="$gray9" textAlign="center">
                Start your first reading to begin your spiritual journey
              </Text>
            </YStack>
          ) : (
            <YStack space="$2">
              {readings.slice(0, 5).map((reading) => (
                <YStack
                  key={reading.id}
                  backgroundColor="$purple2"
                  padding="$3"
                  borderRadius="$3"
                  space="$2"
                >
                  <XStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="$4" fontWeight="600" color="$purple11">
                      {SPREAD_TYPES[reading.spread_type as keyof typeof SPREAD_TYPES]?.name || reading.spread_type}
                    </Text>
                    <Text fontSize="$2" color="$gray9">
                      {new Date(reading.created_at).toLocaleDateString()}
                    </Text>
                  </XStack>
                  {reading.intention && (
                    <Text fontSize="$3" color="$gray10" numberOfLines={1}>
                      "{reading.intention}"
                    </Text>
                  )}
                  <Text fontSize="$2" color="$purple10">
                    {reading.card_positions.length} cards drawn
                  </Text>
                </YStack>
              ))}
            </YStack>
          )}
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