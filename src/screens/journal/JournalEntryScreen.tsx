import React, { useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { Button, Input, Text, View, YStack, XStack, ScrollView } from '@tamagui/core';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useJournalStore } from '../../stores/journalStore';
import type { Reading, JournalEntry } from '../../types';

const journalEntrySchema = z.object({
  content: z.string().min(1, 'Please write something in your journal'),
  mood: z.string().optional(),
  tags: z.string().optional(),
});

type JournalEntryFormData = z.infer<typeof journalEntrySchema>;

interface JournalEntryScreenProps {
  reading?: Reading;
  entry?: JournalEntry;
  onCancel: () => void;
  onSuccess: () => void;
}

const MOOD_OPTIONS = [
  { value: 'grateful', label: '🙏 Grateful', color: '$yellow9' },
  { value: 'peaceful', label: '☮️ Peaceful', color: '$green9' },
  { value: 'inspired', label: '✨ Inspired', color: '$purple9' },
  { value: 'confused', label: '🤔 Confused', color: '$gray9' },
  { value: 'hopeful', label: '🌟 Hopeful', color: '$blue9' },
  { value: 'reflective', label: '💭 Reflective', color: '$indigo9' },
  { value: 'anxious', label: '😰 Anxious', color: '$orange9' },
  { value: 'excited', label: '🎉 Excited', color: '$pink9' },
];

export const JournalEntryScreen: React.FC<JournalEntryScreenProps> = ({
  reading,
  entry,
  onCancel,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const { createJournalEntry, updateJournalEntry } = useJournalStore();

  const isEditing = !!entry;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JournalEntryFormData>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      content: entry?.content || '',
      mood: entry?.mood || '',
      tags: entry?.tags?.join(', ') || '',
    },
  });

  const watchedMood = watch('mood');

  const onSubmit = async (data: JournalEntryFormData) => {
    if (!reading && !entry) {
      Alert.alert('Error', 'Missing reading or entry data');
      return;
    }

    setLoading(true);
    try {
      const entryData = {
        reading_id: reading?.id || entry!.reading_id,
        content: data.content,
        mood: data.mood || '',
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        photo_urls: [],
      };

      if (isEditing) {
        await updateJournalEntry(entry!.id, entryData);
        Alert.alert('Success', 'Journal entry updated successfully!');
      } else {
        await createJournalEntry(entryData);
        Alert.alert('Success', 'Journal entry saved successfully!');
      }
      
      onSuccess();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save journal entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <YStack space="$4" padding="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <YStack>
            <Text fontSize="$7" fontWeight="bold">
              {isEditing ? 'Edit Entry' : 'Journal Entry'}
            </Text>
            <Text fontSize="$3" color="$gray10">
              {new Date().toLocaleDateString()}
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

        {reading && (
          <YStack
            backgroundColor="$purple2"
            padding="$3"
            borderRadius="$3"
            space="$2"
          >
            <Text fontSize="$4" fontWeight="600" color="$purple11">
              Reading Reflection
            </Text>
            <Text fontSize="$3" color="$gray10">
              {reading.spread_type} spread • {reading.card_positions.length} cards
            </Text>
            {reading.intention && (
              <Text fontSize="$3" color="$gray9">
                Intention: "{reading.intention}"
              </Text>
            )}
          </YStack>
        )}

        <YStack space="$3">
          {/* Mood Selection */}
          <YStack space="$3">
            <Text fontSize="$5" fontWeight="600">
              How are you feeling?
            </Text>
            <YStack space="$2">
              <XStack space="$2" flexWrap="wrap">
                {MOOD_OPTIONS.map((mood) => (
                  <Button
                    key={mood.value}
                    size="$3"
                    variant={watchedMood === mood.value ? 'solid' : 'outlined'}
                    backgroundColor={watchedMood === mood.value ? mood.color : 'transparent'}
                    onPress={() => setValue('mood', mood.value)}
                    marginBottom="$2"
                  >
                    {mood.label}
                  </Button>
                ))}
              </XStack>
              <Button
                size="$2"
                variant="ghost"
                onPress={() => setValue('mood', '')}
                alignSelf="flex-start"
              >
                Clear selection
              </Button>
            </YStack>
          </YStack>

          {/* Journal Content */}
          <Controller
            control={control}
            name="content"
            render={({ field: { onChange, onBlur, value } }) => (
              <YStack space="$2">
                <Text fontSize="$5" fontWeight="600">
                  Your thoughts *
                </Text>
                <Input
                  placeholder="What insights did you gain from this reading? How do the cards resonate with your current situation?"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  size="$4"
                  multiline
                  numberOfLines={8}
                  borderColor={errors.content ? '$red8' : '$gray8'}
                  minHeight={200}
                />
                {errors.content && (
                  <Text color="$red10" fontSize="$3">
                    {errors.content.message}
                  </Text>
                )}
                <Text fontSize="$2" color="$gray9">
                  {value?.length || 0} characters
                </Text>
              </YStack>
            )}
          />

          {/* Tags */}
          <Controller
            control={control}
            name="tags"
            render={({ field: { onChange, onBlur, value } }) => (
              <YStack space="$2">
                <Text fontSize="$4" fontWeight="600">
                  Tags (optional)
                </Text>
                <Input
                  placeholder="love, guidance, career, healing (comma separated)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  size="$4"
                />
                <Text fontSize="$2" color="$gray9">
                  Add tags to help organize and find your entries later
                </Text>
              </YStack>
            )}
          />
        </YStack>

        <Button
          size="$4"
          backgroundColor="$green9"
          color="white"
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? 'Saving...' : isEditing ? 'Update Entry' : 'Save Entry'}
        </Button>

        {/* Journaling Tips */}
        <YStack
          backgroundColor="$blue2"
          padding="$4"
          borderRadius="$4"
          space="$2"
        >
          <Text fontSize="$4" fontWeight="600" color="$blue11">
            📝 Journaling Tips
          </Text>
          <Text fontSize="$3" color="$gray10">
            • Write freely without judgment
          </Text>
          <Text fontSize="$3" color="$gray10">
            • Note any emotions or physical sensations
          </Text>
          <Text fontSize="$3" color="$gray10">
            • Consider how the message applies to your life
          </Text>
          <Text fontSize="$3" color="$gray10">
            • Look for patterns across multiple readings
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