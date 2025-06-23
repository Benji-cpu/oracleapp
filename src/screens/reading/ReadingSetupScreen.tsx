import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Input, Text, View, YStack, XStack, ScrollView } from '@tamagui/core';
import { useDeckStore } from '../../stores/deckStore';
import { useCardStore } from '../../stores/cardStore';
import { SPREAD_TYPES } from '../../constants';
import type { Deck } from '../../types';

interface ReadingSetupScreenProps {
  onStartReading: (deckId: string, spreadType: string, intention?: string) => void;
  onCancel: () => void;
}

export const ReadingSetupScreen: React.FC<ReadingSetupScreenProps> = ({
  onStartReading,
  onCancel,
}) => {
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [selectedSpread, setSelectedSpread] = useState<string>('single');
  const [intention, setIntention] = useState('');
  const { decks, fetchDecks } = useDeckStore();
  const { fetchCardsByDeck } = useCardStore();

  useEffect(() => {
    fetchDecks();
  }, []);

  const handleStartReading = () => {
    if (!selectedDeck) {
      alert('Please select a deck');
      return;
    }

    if (selectedDeck.card_count === 0) {
      alert('This deck has no cards. Add some cards before starting a reading.');
      return;
    }

    onStartReading(selectedDeck.id, selectedSpread, intention);
  };

  return (
    <ScrollView style={styles.container}>
      <YStack space="$4" padding="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$7" fontWeight="bold">
            Start a Reading
          </Text>
          <Button
            size="$3"
            variant="outlined"
            onPress={onCancel}
          >
            Cancel
          </Button>
        </XStack>

        <YStack
          backgroundColor="$purple2"
          padding="$4"
          borderRadius="$4"
          space="$2"
        >
          <Text fontSize="$4" fontWeight="600" color="$purple11">
            Prepare Your Space
          </Text>
          <Text fontSize="$3" color="$gray10">
            Take a moment to center yourself and set a clear intention for your reading.
          </Text>
        </YStack>

        {/* Deck Selection */}
        <YStack space="$3">
          <Text fontSize="$5" fontWeight="600">
            Choose Your Deck
          </Text>
          {decks.length === 0 ? (
            <YStack
              backgroundColor="$gray2"
              padding="$4"
              borderRadius="$4"
              alignItems="center"
            >
              <Text fontSize="$4" color="$gray10">
                No decks available
              </Text>
              <Text fontSize="$3" color="$gray9">
                Create a deck first to start readings
              </Text>
            </YStack>
          ) : (
            <YStack space="$2">
              {decks.map((deck) => (
                <Button
                  key={deck.id}
                  size="$4"
                  variant={selectedDeck?.id === deck.id ? 'solid' : 'outlined'}
                  backgroundColor={selectedDeck?.id === deck.id ? '$blue9' : 'transparent'}
                  onPress={() => setSelectedDeck(deck)}
                  justifyContent="flex-start"
                >
                  <YStack alignItems="flex-start">
                    <Text fontWeight="600">{deck.name}</Text>
                    <Text fontSize="$2" color="$gray10">
                      {deck.card_count} cards
                    </Text>
                  </YStack>
                </Button>
              ))}
            </YStack>
          )}
        </YStack>

        {/* Spread Selection */}
        <YStack space="$3">
          <Text fontSize="$5" fontWeight="600">
            Choose Your Spread
          </Text>
          <YStack space="$2">
            {Object.entries(SPREAD_TYPES).map(([key, spread]) => (
              <Button
                key={key}
                size="$4"
                variant={selectedSpread === key ? 'solid' : 'outlined'}
                backgroundColor={selectedSpread === key ? '$green9' : 'transparent'}
                onPress={() => setSelectedSpread(key)}
                justifyContent="flex-start"
              >
                <YStack alignItems="flex-start">
                  <Text fontWeight="600">{spread.name}</Text>
                  <Text fontSize="$2" color="$gray10">
                    {spread.description} • {spread.positions} card{spread.positions > 1 ? 's' : ''}
                  </Text>
                </YStack>
              </Button>
            ))}
          </YStack>
        </YStack>

        {/* Intention Setting */}
        <YStack space="$3">
          <Text fontSize="$5" fontWeight="600">
            Set Your Intention (Optional)
          </Text>
          <Input
            placeholder="What guidance are you seeking today?"
            value={intention}
            onChangeText={setIntention}
            size="$4"
            multiline
            numberOfLines={3}
          />
          <Text fontSize="$2" color="$gray9">
            A clear intention helps focus the reading and provides better insights.
          </Text>
        </YStack>

        {/* Spread Preview */}
        {selectedSpread && (
          <YStack
            backgroundColor="$gray1"
            padding="$4"
            borderRadius="$4"
            space="$3"
          >
            <Text fontSize="$4" fontWeight="600">
              {SPREAD_TYPES[selectedSpread as keyof typeof SPREAD_TYPES].name} Preview
            </Text>
            <View style={styles.spreadPreview}>
              {SPREAD_TYPES[selectedSpread as keyof typeof SPREAD_TYPES].layout.map((position, index) => (
                <View
                  key={index}
                  style={[
                    styles.cardSlot,
                    {
                      left: `${position.x * 100}%`,
                      top: `${position.y * 100}%`,
                    },
                  ]}
                >
                  <Text fontSize="$1" textAlign="center" color="$gray9">
                    {position.meaning}
                  </Text>
                </View>
              ))}
            </View>
          </YStack>
        )}

        <Button
          size="$4"
          backgroundColor="$purple9"
          color="white"
          onPress={handleStartReading}
          disabled={!selectedDeck || selectedDeck.card_count === 0}
        >
          Begin Reading
        </Button>

        {/* Reading Tips */}
        <YStack
          backgroundColor="$yellow2"
          padding="$4"
          borderRadius="$4"
          space="$2"
        >
          <Text fontSize="$4" fontWeight="600" color="$yellow11">
            💫 Reading Tips
          </Text>
          <Text fontSize="$3" color="$gray10">
            • Find a quiet, comfortable space
          </Text>
          <Text fontSize="$3" color="$gray10">
            • Take deep breaths and center yourself
          </Text>
          <Text fontSize="$3" color="$gray10">
            • Focus on your question or intention
          </Text>
          <Text fontSize="$3" color="$gray10">
            • Trust your intuition when interpreting the cards
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
  spreadPreview: {
    height: 200,
    position: 'relative',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
  },
  cardSlot: {
    position: 'absolute',
    width: 40,
    height: 60,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -20 }, { translateY: -30 }],
  },
});