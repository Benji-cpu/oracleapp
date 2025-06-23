import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Text, View, YStack, XStack, ScrollView } from '@tamagui/core';
import { useCardStore } from '../../stores/cardStore';
import { useAuthStore } from '../../stores/authStore';
import { SUBSCRIPTION_LIMITS } from '../../constants';
import { CardStudioScreen } from './CardStudioScreen';
import type { Deck, Card } from '../../types';

interface CardListScreenProps {
  deck: Deck;
  onBack: () => void;
}

export const CardListScreen: React.FC<CardListScreenProps> = ({ deck, onBack }) => {
  const { user } = useAuthStore();
  const { cards, fetchCardsByDeck, loading } = useCardStore();
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  useEffect(() => {
    fetchCardsByDeck(deck.id);
  }, [deck.id]);

  const userLimits = SUBSCRIPTION_LIMITS[user?.subscription_tier || 'free'];

  if (currentView === 'create') {
    return (
      <CardStudioScreen
        deck={deck}
        onCancel={() => setCurrentView('list')}
        onSuccess={() => {
          setCurrentView('list');
          fetchCardsByDeck(deck.id);
        }}
      />
    );
  }

  if (currentView === 'edit' && selectedCard) {
    return (
      <CardStudioScreen
        deck={deck}
        card={selectedCard}
        onCancel={() => setCurrentView('list')}
        onSuccess={() => {
          setCurrentView('list');
          fetchCardsByDeck(deck.id);
        }}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <YStack space="$4" padding="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <YStack space="$1">
            <Text fontSize="$7" fontWeight="bold">
              {deck.name}
            </Text>
            <Text color="$gray10">
              {cards.length} cards
            </Text>
          </YStack>
          <Button
            size="$3"
            variant="outlined"
            onPress={onBack}
          >
            Back
          </Button>
        </XStack>

        <YStack
          backgroundColor="$blue2"
          padding="$3"
          borderRadius="$3"
          space="$2"
        >
          <Text fontSize="$4" fontWeight="600">
            Card Management
          </Text>
          <Text fontSize="$3" color="$gray10">
            Create, edit, and organize your oracle cards
          </Text>
        </YStack>

        <Button
          size="$4"
          backgroundColor="$green9"
          color="white"
          onPress={() => setCurrentView('create')}
        >
          Add New Card
        </Button>

        {loading ? (
          <Text color="$gray10" textAlign="center">
            Loading cards...
          </Text>
        ) : cards.length === 0 ? (
          <YStack
            backgroundColor="$gray2"
            padding="$6"
            borderRadius="$4"
            alignItems="center"
            space="$3"
          >
            <Text fontSize="$5" fontWeight="600" color="$gray11">
              No cards yet
            </Text>
            <Text fontSize="$3" color="$gray9" textAlign="center">
              Start building your deck by creating your first oracle card
            </Text>
          </YStack>
        ) : (
          <YStack space="$3">
            <Text fontSize="$5" fontWeight="600">
              Cards in Deck
            </Text>
            
            {cards.map((card) => (
              <YStack
                key={card.id}
                backgroundColor="$gray2"
                padding="$4"
                borderRadius="$4"
                space="$3"
              >
                <XStack justifyContent="space-between" alignItems="flex-start">
                  <YStack flex={1} space="$2">
                    <Text fontSize="$5" fontWeight="600">
                      {card.title}
                    </Text>
                    {card.meaning && (
                      <Text fontSize="$3" color="$gray10" numberOfLines={2}>
                        {card.meaning}
                      </Text>
                    )}
                    {card.keywords && card.keywords.length > 0 && (
                      <XStack space="$2" flexWrap="wrap">
                        {card.keywords.slice(0, 3).map((keyword, index) => (
                          <View
                            key={index}
                            backgroundColor="$blue3"
                            paddingHorizontal="$2"
                            paddingVertical="$1"
                            borderRadius="$2"
                          >
                            <Text fontSize="$2" color="$blue11">
                              {keyword}
                            </Text>
                          </View>
                        ))}
                        {card.keywords.length > 3 && (
                          <Text fontSize="$2" color="$gray9">
                            +{card.keywords.length - 3} more
                          </Text>
                        )}
                      </XStack>
                    )}
                  </YStack>
                  
                  <YStack space="$2" alignItems="flex-end">
                    <Text fontSize="$2" color="$gray9">
                      Position {card.position}
                    </Text>
                    <Button
                      size="$2"
                      variant="outlined"
                      onPress={() => {
                        setSelectedCard(card);
                        setCurrentView('edit');
                      }}
                    >
                      Edit
                    </Button>
                  </YStack>
                </XStack>
              </YStack>
            ))}
          </YStack>
        )}

        {/* AI Features Info */}
        <YStack
          backgroundColor="$purple2"
          padding="$4"
          borderRadius="$4"
          space="$2"
        >
          <Text fontSize="$4" fontWeight="600" color="$purple11">
            AI-Powered Card Creation
          </Text>
          <Text fontSize="$3" color="$gray10">
            • Generate meaningful card descriptions with AI
          </Text>
          <Text fontSize="$3" color="$gray10">
            • Create stunning artwork based on your concepts
          </Text>
          <Text fontSize="$3" color="$gray10">
            • Get inspired with keyword suggestions
          </Text>
          {user?.subscription_tier === 'free' && (
            <Button
              size="$3"
              backgroundColor="$purple9"
              color="white"
              alignSelf="flex-start"
            >
              Upgrade for Full AI Access
            </Button>
          )}
        </YStack>

        {/* Quick Tips */}
        <YStack
          backgroundColor="$yellow2"
          padding="$4"
          borderRadius="$4"
          space="$2"
        >
          <Text fontSize="$4" fontWeight="600" color="$yellow11">
            💡 Card Creation Tips
          </Text>
          <Text fontSize="$3" color="$gray10">
            • Choose meaningful titles that resonate with spiritual concepts
          </Text>
          <Text fontSize="$3" color="$gray10">
            • Use keywords to help AI generate better content
          </Text>
          <Text fontSize="$3" color="$gray10">
            • Write meanings that offer guidance and insight
          </Text>
          <Text fontSize="$3" color="$gray10">
            • Consistent visual style creates a cohesive deck
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