import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text, View, YStack, Button, ScrollView } from '@tamagui/core';
import { useDeckStore } from '../../stores/deckStore';
import { useAuthStore } from '../../stores/authStore';
import { SUBSCRIPTION_LIMITS } from '../../constants';
import { DeckCreateScreen } from './DeckCreateScreen';
import { DeckEditScreen } from './DeckEditScreen';
import type { Deck } from '../../types';

export const DeckGalleryScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { decks, fetchDecks, loading } = useDeckStore();
  const [currentView, setCurrentView] = useState<'gallery' | 'create' | 'edit'>('gallery');
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);

  useEffect(() => {
    fetchDecks();
  }, []);

  const userLimits = SUBSCRIPTION_LIMITS[user?.subscription_tier || 'free'];
  const canCreateDeck = userLimits.maxDecks === -1 || decks.length < userLimits.maxDecks;

  if (currentView === 'create') {
    return (
      <DeckCreateScreen
        onCancel={() => setCurrentView('gallery')}
        onSuccess={() => {
          setCurrentView('gallery');
          fetchDecks();
        }}
      />
    );
  }

  if (currentView === 'edit' && selectedDeck) {
    return (
      <DeckEditScreen
        deck={selectedDeck}
        onCancel={() => setCurrentView('gallery')}
        onSuccess={() => {
          setCurrentView('gallery');
          fetchDecks();
        }}
        onDelete={() => {
          setCurrentView('gallery');
          fetchDecks();
        }}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <YStack space="$4" padding="$4">
        <YStack space="$2">
          <Text fontSize="$7" fontWeight="bold">
            Your Decks
          </Text>
          <Text color="$gray10">
            {decks.length} of {userLimits.maxDecks === -1 ? '∞' : userLimits.maxDecks} decks
          </Text>
        </YStack>

        <Button
          size="$4"
          backgroundColor="$green9"
          color="white"
          disabled={!canCreateDeck}
          onPress={() => setCurrentView('create')}
        >
          {canCreateDeck ? 'Create New Deck' : 'Deck Limit Reached'}
        </Button>

        {loading ? (
          <Text color="$gray10" textAlign="center">
            Loading decks...
          </Text>
        ) : decks.length === 0 ? (
          <YStack
            backgroundColor="$gray2"
            padding="$6"
            borderRadius="$4"
            alignItems="center"
            space="$3"
          >
            <Text fontSize="$5" fontWeight="600" color="$gray11">
              No decks yet
            </Text>
            <Text fontSize="$3" color="$gray9" textAlign="center">
              Create your first oracle deck to begin your spiritual journey
            </Text>
          </YStack>
        ) : (
          <YStack space="$3">
            {decks.map((deck) => (
              <YStack
                key={deck.id}
                backgroundColor="$gray2"
                padding="$4"
                borderRadius="$4"
                space="$2"
              >
                <Text fontSize="$5" fontWeight="600">
                  {deck.name}
                </Text>
                {deck.description && (
                  <Text fontSize="$3" color="$gray10">
                    {deck.description}
                  </Text>
                )}
                <Text fontSize="$3" color="$gray9">
                  {deck.card_count} cards • Created {new Date(deck.created_at).toLocaleDateString()}
                </Text>
                <Button
                  size="$3"
                  variant="outlined"
                  alignSelf="flex-start"
                  onPress={() => {
                    setSelectedDeck(deck);
                    setCurrentView('edit');
                  }}
                >
                  Edit Deck
                </Button>
              </YStack>
            ))}
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