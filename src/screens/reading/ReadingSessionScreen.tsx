import React, { useState, useEffect } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { Button, Text, View, YStack, XStack, ScrollView } from '@tamagui/core';
import { useCardStore } from '../../stores/cardStore';
import { useReadingStore } from '../../stores/readingStore';
import { useAuthStore } from '../../stores/authStore';
import { SPREAD_TYPES, ANIMATIONS } from '../../constants';
import type { Card, CardPosition } from '../../types';

interface ReadingSessionScreenProps {
  deckId: string;
  spreadType: string;
  intention?: string;
  onComplete: (cardPositions: CardPosition[], interpretation?: string) => void;
  onCancel: () => void;
}

export const ReadingSessionScreen: React.FC<ReadingSessionScreenProps> = ({
  deckId,
  spreadType,
  intention,
  onComplete,
  onCancel,
}) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [drawnCards, setDrawnCards] = useState<CardPosition[]>([]);
  const [currentStep, setCurrentStep] = useState<'shuffle' | 'draw' | 'reveal' | 'interpret'>('shuffle');
  const [isShuffling, setIsShuffling] = useState(false);
  const [revealedPositions, setRevealedPositions] = useState<number[]>([]);
  const [aiInterpretation, setAiInterpretation] = useState<string>('');
  const [generatingInterpretation, setGeneratingInterpretation] = useState(false);
  const [readingId, setReadingId] = useState<string | null>(null);
  
  const { fetchCardsByDeck } = useCardStore();
  const { generateInterpretation: generateAIInterpretation, createReading } = useReadingStore();
  const { user } = useAuthStore();
  const spread = SPREAD_TYPES[spreadType as keyof typeof SPREAD_TYPES];

  useEffect(() => {
    const loadCards = async () => {
      await fetchCardsByDeck(deckId);
      // In a real implementation, this would come from the store
      // For now, we'll simulate having cards
      setCards([
        { id: '1', title: 'New Beginnings', meaning: 'Fresh starts and new opportunities await.', keywords: ['new', 'start'], deck_id: deckId, position: 1, created_at: '', updated_at: '', symbols: [], style_template: 'mystical' },
        { id: '2', title: 'Inner Wisdom', meaning: 'Trust your intuition and inner voice.', keywords: ['wisdom', 'intuition'], deck_id: deckId, position: 2, created_at: '', updated_at: '', symbols: [], style_template: 'mystical' },
        { id: '3', title: 'Balance', meaning: 'Seek harmony in all aspects of life.', keywords: ['balance', 'harmony'], deck_id: deckId, position: 3, created_at: '', updated_at: '', symbols: [], style_template: 'mystical' },
        { id: '4', title: 'Transformation', meaning: 'Change is coming, embrace it with open arms.', keywords: ['change', 'growth'], deck_id: deckId, position: 4, created_at: '', updated_at: '', symbols: [], style_template: 'mystical' },
        { id: '5', title: 'Strength', meaning: 'You have the inner strength to overcome challenges.', keywords: ['strength', 'power'], deck_id: deckId, position: 5, created_at: '', updated_at: '', symbols: [], style_template: 'mystical' },
      ]);
    };
    loadCards();
  }, [deckId]);

  const shuffleCards = () => {
    setIsShuffling(true);
    setTimeout(() => {
      // Simulate shuffling and drawing cards
      const shuffled = [...cards].sort(() => Math.random() - 0.5);
      const drawn: CardPosition[] = [];
      
      for (let i = 0; i < spread.positions; i++) {
        if (shuffled[i]) {
          drawn.push({
            card_id: shuffled[i].id,
            position: i,
            position_meaning: spread.layout[i]?.meaning || `Position ${i + 1}`,
          });
        }
      }
      
      setDrawnCards(drawn);
      setIsShuffling(false);
      setCurrentStep('draw');
    }, ANIMATIONS.shuffle);
  };

  const revealCard = (position: number) => {
    setRevealedPositions(prev => [...prev, position]);
    
    if (revealedPositions.length + 1 === spread.positions) {
      setCurrentStep('interpret');
    }
  };

  const generateInterpretation = async () => {
    if (!user) return;
    
    setGeneratingInterpretation(true);
    
    try {
      // Create the reading first if not already created
      let currentReadingId = readingId;
      if (!currentReadingId) {
        const reading = await createReading({
          user_id: user.id,
          deck_id: deckId,
          spread_type: spreadType,
          intention: intention || '',
          card_positions: drawnCards,
        });
        currentReadingId = reading.id;
        setReadingId(currentReadingId);
      }

      // Generate AI interpretation
      const interpretation = await generateAIInterpretation(currentReadingId);
      setAiInterpretation(interpretation);
    } catch (error: any) {
      console.error('Error generating interpretation:', error);
      // Fall back to a generic message
      setAiInterpretation(`Your reading with the ${spread.name} spread reveals important insights about ${intention || 'your current path'}. The cards selected for you hold meaningful guidance for your journey ahead.`);
    } finally {
      setGeneratingInterpretation(false);
    }
  };

  const completeReading = () => {
    onComplete(drawnCards, aiInterpretation);
  };

  const getCardForPosition = (position: number): Card | undefined => {
    const cardPosition = drawnCards.find(cp => cp.position === position);
    return cardPosition ? cards.find(c => c.id === cardPosition.card_id) : undefined;
  };

  return (
    <ScrollView style={styles.container}>
      <YStack space="$4" padding="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <YStack>
            <Text fontSize="$7" fontWeight="bold">
              Oracle Reading
            </Text>
            <Text fontSize="$4" color="$purple11">
              {spread.name}
            </Text>
          </YStack>
          <Button
            size="$3"
            variant="outlined"
            onPress={onCancel}
          >
            Cancel
          </Button>
        </XStack>

        {intention && (
          <YStack
            backgroundColor="$purple2"
            padding="$3"
            borderRadius="$3"
            space="$2"
          >
            <Text fontSize="$4" fontWeight="600" color="$purple11">
              Your Intention
            </Text>
            <Text fontSize="$3" color="$gray10">
              "{intention}"
            </Text>
          </YStack>
        )}

        {/* Shuffle Phase */}
        {currentStep === 'shuffle' && (
          <YStack space="$4" alignItems="center">
            <YStack
              backgroundColor="$blue2"
              padding="$6"
              borderRadius="$4"
              alignItems="center"
              space="$3"
            >
              <Text fontSize="$6" fontWeight="bold" color="$blue11">
                🔮 Prepare Your Cards
              </Text>
              <Text fontSize="$4" textAlign="center" color="$gray10">
                Take a moment to focus on your intention, then shuffle the cards when you're ready.
              </Text>
              <Button
                size="$4"
                backgroundColor="$purple9"
                color="white"
                onPress={shuffleCards}
                disabled={isShuffling || cards.length === 0}
              >
                {isShuffling ? 'Shuffling...' : 'Shuffle Cards'}
              </Button>
            </YStack>
          </YStack>
        )}

        {/* Draw Phase */}
        {currentStep === 'draw' && (
          <YStack space="$4">
            <Text fontSize="$5" fontWeight="600" textAlign="center">
              Your cards have been drawn. Tap each card to reveal it.
            </Text>
            
            <View style={styles.spreadLayout}>
              {spread.layout.map((position, index) => (
                <View
                  key={index}
                  style={[
                    styles.cardPosition,
                    {
                      left: `${position.x * 100}%`,
                      top: `${position.y * 100}%`,
                    },
                  ]}
                >
                  <Button
                    size="$5"
                    backgroundColor={revealedPositions.includes(index) ? '$green9' : '$gray6'}
                    onPress={() => revealCard(index)}
                    disabled={revealedPositions.includes(index)}
                  >
                    {revealedPositions.includes(index) ? '✓' : '?'}
                  </Button>
                  <Text fontSize="$2" textAlign="center" marginTop="$2">
                    {position.meaning}
                  </Text>
                </View>
              ))}
            </View>
          </YStack>
        )}

        {/* Revealed Cards */}
        {revealedPositions.length > 0 && (
          <YStack space="$3">
            <Text fontSize="$5" fontWeight="600">
              Revealed Cards
            </Text>
            {revealedPositions.map((position) => {
              const card = getCardForPosition(position);
              const positionMeaning = spread.layout[position]?.meaning;
              
              return card ? (
                <YStack
                  key={position}
                  backgroundColor="$gray2"
                  padding="$4"
                  borderRadius="$4"
                  space="$2"
                >
                  <XStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="$4" fontWeight="600" color="$purple11">
                      {positionMeaning}
                    </Text>
                    <Text fontSize="$2" color="$gray9">
                      Position {position + 1}
                    </Text>
                  </XStack>
                  <Text fontSize="$5" fontWeight="bold">
                    {card.title}
                  </Text>
                  <Text fontSize="$3" color="$gray10">
                    {card.meaning}
                  </Text>
                  {card.keywords && card.keywords.length > 0 && (
                    <XStack space="$2" flexWrap="wrap">
                      {card.keywords.map((keyword, idx) => (
                        <View
                          key={idx}
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
                    </XStack>
                  )}
                </YStack>
              ) : null;
            })}
          </YStack>
        )}

        {/* Interpretation Phase */}
        {currentStep === 'interpret' && (
          <YStack space="$4">
            <YStack
              backgroundColor="$purple2"
              padding="$4"
              borderRadius="$4"
              space="$3"
            >
              <Text fontSize="$5" fontWeight="600" color="$purple11">
                AI Interpretation
              </Text>
              
              {!aiInterpretation ? (
                <Button
                  size="$4"
                  backgroundColor="$purple9"
                  color="white"
                  onPress={generateInterpretation}
                  disabled={generatingInterpretation}
                >
                  {generatingInterpretation ? 'Generating Interpretation...' : '✨ Get AI Interpretation'}
                </Button>
              ) : (
                <Text fontSize="$4" color="$gray10">
                  {aiInterpretation}
                </Text>
              )}
            </YStack>

            <YStack space="$3">
              <Button
                size="$4"
                backgroundColor="$green9"
                color="white"
                onPress={completeReading}
              >
                Complete Reading
              </Button>
              
              <Button
                size="$4"
                variant="outlined"
                onPress={() => {
                  // Restart reading
                  setCurrentStep('shuffle');
                  setDrawnCards([]);
                  setRevealedPositions([]);
                  setAiInterpretation('');
                }}
              >
                Draw New Cards
              </Button>
            </YStack>
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
  spreadLayout: {
    height: 300,
    position: 'relative',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    margin: 16,
  },
  cardPosition: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -40 }, { translateY: -60 }],
  },
});