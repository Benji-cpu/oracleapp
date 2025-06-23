import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { Button, Input, Text, View, YStack, XStack, ScrollView } from '@tamagui/core';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCardStore } from '../../stores/cardStore';
import { useAuthStore } from '../../stores/authStore';
import { SUBSCRIPTION_LIMITS, CARD_TEMPLATES } from '../../constants';
import type { Deck, Card } from '../../types';

const cardCreateSchema = z.object({
  title: z.string().min(1, 'Card title is required').max(50, 'Title must be 50 characters or less'),
  meaning: z.string().max(500, 'Meaning must be 500 characters or less').optional(),
  keywords: z.string().optional(),
  styleTemplate: z.string().optional(),
});

type CardCreateFormData = z.infer<typeof cardCreateSchema>;

interface CardStudioScreenProps {
  deck: Deck;
  card?: Card;
  onCancel: () => void;
  onSuccess: () => void;
}

export const CardStudioScreen: React.FC<CardStudioScreenProps> = ({
  deck,
  card,
  onCancel,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatingMeaning, setGeneratingMeaning] = useState(false);
  const { user } = useAuthStore();
  const { createCard, updateCard } = useCardStore();

  const isEditing = !!card;
  const userLimits = SUBSCRIPTION_LIMITS[user?.subscription_tier || 'free'];

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CardCreateFormData>({
    resolver: zodResolver(cardCreateSchema),
    defaultValues: {
      title: card?.title || '',
      meaning: card?.meaning || '',
      keywords: card?.keywords?.join(', ') || '',
      styleTemplate: card?.style_template || 'mystical',
    },
  });

  const watchedTitle = watch('title');
  const watchedKeywords = watch('keywords');

  const onSubmit = async (data: CardCreateFormData) => {
    setLoading(true);
    try {
      const cardData = {
        deck_id: deck.id,
        title: data.title,
        meaning: data.meaning || '',
        keywords: data.keywords ? data.keywords.split(',').map(k => k.trim()) : [],
        style_template: data.styleTemplate || 'mystical',
        symbols: [],
        position: card?.position || deck.card_count + 1,
      };

      if (isEditing) {
        await updateCard(card.id, cardData);
        Alert.alert('Success', 'Card updated successfully!');
      } else {
        await createCard(cardData);
        Alert.alert('Success', 'Card created successfully!');
      }
      
      onSuccess();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save card');
    } finally {
      setLoading(false);
    }
  };

  const generateAIMeaning = async () => {
    if (!watchedTitle) {
      Alert.alert('Error', 'Please enter a card title first');
      return;
    }

    setGeneratingMeaning(true);
    try {
      // Simulate AI generation for now
      const meanings = [
        'This card represents new beginnings and fresh starts. It encourages you to embrace change and trust in your journey.',
        'A symbol of inner wisdom and intuition. Listen to your heart and trust the guidance that comes from within.',
        'This card speaks of balance and harmony. Seek to find equilibrium in all aspects of your life.',
        'Transformation and growth are highlighted. Embrace the changes that will lead to your highest good.',
        'A reminder of your inner strength and resilience. You have the power to overcome any challenge.',
      ];
      
      const randomMeaning = meanings[Math.floor(Math.random() * meanings.length)];
      setValue('meaning', randomMeaning);
      
      Alert.alert('Success', 'AI meaning generated!');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to generate meaning. Please try again.');
    } finally {
      setGeneratingMeaning(false);
    }
  };

  const generateAIImage = async () => {
    if (!watchedTitle) {
      Alert.alert('Error', 'Please enter a card title first');
      return;
    }

    setGeneratingImage(true);
    try {
      // Simulate AI image generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      Alert.alert('Success', 'AI image generated! (Feature coming soon)');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to generate image. Please try again.');
    } finally {
      setGeneratingImage(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <YStack space="$4" padding="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$7" fontWeight="bold">
            {isEditing ? 'Edit Card' : 'Create Card'}
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
          backgroundColor="$blue2"
          padding="$3"
          borderRadius="$3"
          space="$2"
        >
          <Text fontSize="$4" fontWeight="600">
            Deck: {deck.name}
          </Text>
          <Text fontSize="$3" color="$gray10">
            {deck.card_count} cards • {user?.subscription_tier?.toUpperCase()} tier
          </Text>
        </YStack>

        {/* Card Preview */}
        <YStack
          backgroundColor="$gray1"
          padding="$4"
          borderRadius="$4"
          alignItems="center"
          space="$3"
        >
          <Text fontSize="$4" fontWeight="600">
            Card Preview
          </Text>
          <View
            style={[
              styles.cardPreview,
              { backgroundColor: CARD_TEMPLATES.mystical.backgroundColor },
            ]}
          >
            <Text
              fontSize="$5"
              fontWeight="bold"
              color={CARD_TEMPLATES.mystical.textColor}
              textAlign="center"
            >
              {watchedTitle || 'Card Title'}
            </Text>
          </View>
        </YStack>

        <YStack space="$3">
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <YStack space="$2">
                <Text fontSize="$4" fontWeight="600">
                  Card Title *
                </Text>
                <Input
                  placeholder="Enter card title"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  size="$4"
                  borderColor={errors.title ? '$red8' : '$gray8'}
                />
                {errors.title && (
                  <Text color="$red10" fontSize="$3">
                    {errors.title.message}
                  </Text>
                )}
              </YStack>
            )}
          />

          <Controller
            control={control}
            name="keywords"
            render={({ field: { onChange, onBlur, value } }) => (
              <YStack space="$2">
                <Text fontSize="$4" fontWeight="600">
                  Keywords
                </Text>
                <Input
                  placeholder="wisdom, guidance, intuition (comma separated)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  size="$4"
                  borderColor={errors.keywords ? '$red8' : '$gray8'}
                />
                <Text fontSize="$2" color="$gray9">
                  Keywords help with AI generation and searching
                </Text>
              </YStack>
            )}
          />

          <Controller
            control={control}
            name="meaning"
            render={({ field: { onChange, onBlur, value } }) => (
              <YStack space="$2">
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="$4" fontWeight="600">
                    Card Meaning
                  </Text>
                  <Button
                    size="$2"
                    backgroundColor="$purple8"
                    color="white"
                    onPress={generateAIMeaning}
                    disabled={generatingMeaning || !userLimits.maxAIGenerations}
                  >
                    {generatingMeaning ? 'Generating...' : '✨ AI Generate'}
                  </Button>
                </XStack>
                <Input
                  placeholder="Describe the card's spiritual meaning and guidance"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  size="$4"
                  multiline
                  numberOfLines={6}
                  borderColor={errors.meaning ? '$red8' : '$gray8'}
                />
                {errors.meaning && (
                  <Text color="$red10" fontSize="$3">
                    {errors.meaning.message}
                  </Text>
                )}
                <Text fontSize="$2" color="$gray9">
                  {value?.length || 0}/500 characters
                </Text>
              </YStack>
            )}
          />

          <Controller
            control={control}
            name="styleTemplate"
            render={({ field: { onChange, value } }) => (
              <YStack space="$2">
                <Text fontSize="$4" fontWeight="600">
                  Visual Style
                </Text>
                <YStack space="$2">
                  {Object.entries(CARD_TEMPLATES).map(([key, template]) => (
                    <Button
                      key={key}
                      size="$3"
                      variant={value === key ? 'solid' : 'outlined'}
                      onPress={() => onChange(key)}
                      backgroundColor={value === key ? '$blue9' : 'transparent'}
                    >
                      {template.name}
                    </Button>
                  ))}
                </YStack>
              </YStack>
            )}
          />
        </YStack>

        {/* AI Features */}
        <YStack
          backgroundColor="$purple2"
          padding="$4"
          borderRadius="$4"
          space="$3"
        >
          <Text fontSize="$4" fontWeight="600" color="$purple11">
            AI-Powered Features
          </Text>
          <XStack space="$3">
            <Button
              flex={1}
              size="$3"
              backgroundColor="$purple8"
              color="white"
              onPress={generateAIImage}
              disabled={generatingImage || !userLimits.maxAIGenerations}
            >
              {generatingImage ? 'Generating...' : '🎨 AI Art'}
            </Button>
            <Button
              flex={1}
              size="$3"
              backgroundColor="$purple8"
              color="white"
              onPress={generateAIMeaning}
              disabled={generatingMeaning || !userLimits.maxAIGenerations}
            >
              {generatingMeaning ? 'Generating...' : '✨ AI Meaning'}
            </Button>
          </XStack>
          {!userLimits.maxAIGenerations && (
            <Text fontSize="$2" color="$gray9" textAlign="center">
              Upgrade to Premium for AI features
            </Text>
          )}
        </YStack>

        <YStack space="$3">
          <Button
            size="$4"
            backgroundColor="$green9"
            color="white"
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditing ? 'Update Card' : 'Create Card'}
          </Button>
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
  cardPreview: {
    width: 200,
    height: 280,
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
});