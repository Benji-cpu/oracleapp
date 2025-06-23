import React, { useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { Button, Input, Text, View, YStack, XStack, ScrollView } from '@tamagui/core';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDeckStore } from '../../stores/deckStore';
import { useAuthStore } from '../../stores/authStore';
import { SUBSCRIPTION_LIMITS } from '../../constants';

const deckCreateSchema = z.object({
  name: z.string().min(1, 'Deck name is required').max(50, 'Name must be 50 characters or less'),
  description: z.string().max(200, 'Description must be 200 characters or less').optional(),
});

type DeckCreateFormData = z.infer<typeof deckCreateSchema>;

interface DeckCreateScreenProps {
  onCancel: () => void;
  onSuccess: (deckId: string) => void;
}

export const DeckCreateScreen: React.FC<DeckCreateScreenProps> = ({ onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const { createDeck, decks } = useDeckStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DeckCreateFormData>({
    resolver: zodResolver(deckCreateSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const userLimits = SUBSCRIPTION_LIMITS[user?.subscription_tier || 'free'];
  const canCreateDeck = userLimits.maxDecks === -1 || decks.length < userLimits.maxDecks;

  const onSubmit = async (data: DeckCreateFormData) => {
    if (!canCreateDeck) {
      Alert.alert('Deck Limit Reached', 'Upgrade to Premium to create more decks');
      return;
    }

    setLoading(true);
    try {
      const newDeck = await createDeck({
        user_id: user!.id,
        name: data.name,
        description: data.description || '',
        card_count: 0,
      });
      
      Alert.alert('Success', 'Deck created successfully!');
      onSuccess(newDeck.id);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create deck');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <YStack space="$4" padding="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$7" fontWeight="bold">
            Create New Deck
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
            Deck Limit
          </Text>
          <Text fontSize="$3" color="$gray10">
            {decks.length} of {userLimits.maxDecks === -1 ? '∞' : userLimits.maxDecks} decks used
          </Text>
          {!canCreateDeck && (
            <Text fontSize="$3" color="$red10">
              Upgrade to Premium to create more decks
            </Text>
          )}
        </YStack>

        <YStack space="$3">
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <YStack space="$2">
                <Text fontSize="$4" fontWeight="600">
                  Deck Name *
                </Text>
                <Input
                  placeholder="Enter deck name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  size="$4"
                  borderColor={errors.name ? '$red8' : '$gray8'}
                />
                {errors.name && (
                  <Text color="$red10" fontSize="$3">
                    {errors.name.message}
                  </Text>
                )}
              </YStack>
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <YStack space="$2">
                <Text fontSize="$4" fontWeight="600">
                  Description
                </Text>
                <Input
                  placeholder="Describe your deck's theme and purpose"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  size="$4"
                  multiline
                  numberOfLines={4}
                  borderColor={errors.description ? '$red8' : '$gray8'}
                />
                {errors.description && (
                  <Text color="$red10" fontSize="$3">
                    {errors.description.message}
                  </Text>
                )}
                <Text fontSize="$2" color="$gray9">
                  {value?.length || 0}/200 characters
                </Text>
              </YStack>
            )}
          />
        </YStack>

        <YStack space="$3">
          <Button
            size="$4"
            backgroundColor="$green9"
            color="white"
            onPress={handleSubmit(onSubmit)}
            disabled={loading || !canCreateDeck}
          >
            {loading ? 'Creating...' : 'Create Deck'}
          </Button>

          {!canCreateDeck && (
            <Button
              size="$4"
              backgroundColor="$purple9"
              color="white"
              onPress={() => {
                // Navigate to upgrade screen
                Alert.alert('Upgrade Required', 'Premium subscription needed for unlimited decks');
              }}
            >
              Upgrade to Premium
            </Button>
          )}
        </YStack>

        <YStack
          backgroundColor="$gray2"
          padding="$4"
          borderRadius="$4"
          space="$2"
        >
          <Text fontSize="$4" fontWeight="600">
            Getting Started
          </Text>
          <Text fontSize="$3" color="$gray10">
            After creating your deck, you can:
          </Text>
          <YStack space="$1" marginLeft="$2">
            <Text fontSize="$3" color="$gray10">
              • Add cards with AI-generated artwork
            </Text>
            <Text fontSize="$3" color="$gray10">
              • Write meaningful card descriptions
            </Text>
            <Text fontSize="$3" color="$gray10">
              • Use your deck for readings
            </Text>
            <Text fontSize="$3" color="$gray10">
              • Export and share your creation
            </Text>
          </YStack>
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