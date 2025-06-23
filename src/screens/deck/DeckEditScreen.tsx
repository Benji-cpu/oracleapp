import React, { useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { Button, Input, Text, View, YStack, XStack, ScrollView } from '@tamagui/core';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDeckStore } from '../../stores/deckStore';
import { CardListScreen } from '../card/CardListScreen';
import type { Deck } from '../../types';

const deckEditSchema = z.object({
  name: z.string().min(1, 'Deck name is required').max(50, 'Name must be 50 characters or less'),
  description: z.string().max(200, 'Description must be 200 characters or less').optional(),
});

type DeckEditFormData = z.infer<typeof deckEditSchema>;

interface DeckEditScreenProps {
  deck: Deck;
  onCancel: () => void;
  onSuccess: () => void;
  onDelete: () => void;
}

export const DeckEditScreen: React.FC<DeckEditScreenProps> = ({ 
  deck, 
  onCancel, 
  onSuccess, 
  onDelete 
}) => {
  const [loading, setLoading] = useState(false);
  const [showCardManagement, setShowCardManagement] = useState(false);
  const { updateDeck, deleteDeck } = useDeckStore();

  if (showCardManagement) {
    return (
      <CardListScreen
        deck={deck}
        onBack={() => setShowCardManagement(false)}
      />
    );
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DeckEditFormData>({
    resolver: zodResolver(deckEditSchema),
    defaultValues: {
      name: deck.name,
      description: deck.description || '',
    },
  });

  const onSubmit = async (data: DeckEditFormData) => {
    setLoading(true);
    try {
      await updateDeck(deck.id, {
        name: data.name,
        description: data.description || '',
      });
      
      Alert.alert('Success', 'Deck updated successfully!');
      onSuccess();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update deck');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Deck',
      `Are you sure you want to delete "${deck.name}"? This action cannot be undone and will delete all cards in this deck.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDeck(deck.id);
              Alert.alert('Success', 'Deck deleted successfully');
              onDelete();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete deck');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <YStack space="$4" padding="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$7" fontWeight="bold">
            Edit Deck
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
            Deck Info
          </Text>
          <Text fontSize="$3" color="$gray10">
            {deck.card_count} cards • Created {new Date(deck.created_at).toLocaleDateString()}
          </Text>
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
            backgroundColor="$blue9"
            color="white"
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Deck'}
          </Button>

          <Button
            size="$4"
            variant="outlined"
            onPress={() => setShowCardManagement(true)}
          >
            Manage Cards ({deck.card_count})
          </Button>
        </YStack>

        <YStack
          backgroundColor="$red2"
          padding="$4"
          borderRadius="$4"
          space="$3"
        >
          <Text fontSize="$4" fontWeight="600" color="$red11">
            Danger Zone
          </Text>
          <Text fontSize="$3" color="$gray10">
            Deleting a deck is permanent and cannot be undone. All cards will be lost.
          </Text>
          <Button
            size="$3"
            backgroundColor="$red9"
            color="white"
            onPress={handleDelete}
            alignSelf="flex-start"
          >
            Delete Deck
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
});