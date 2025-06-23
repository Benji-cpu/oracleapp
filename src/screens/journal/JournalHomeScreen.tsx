import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Text, View, YStack, XStack, ScrollView } from '@tamagui/core';
import { useJournalStore } from '../../stores/journalStore';
import { useReadingStore } from '../../stores/readingStore';
import { useAuthStore } from '../../stores/authStore';
import { JournalEntryScreen } from './JournalEntryScreen';
import type { JournalEntry, Reading } from '../../types';

const MOOD_COLORS: Record<string, string> = {
  grateful: '$yellow9',
  peaceful: '$green9',
  inspired: '$purple9',
  confused: '$gray9',
  hopeful: '$blue9',
  reflective: '$indigo9',
  anxious: '$orange9',
  excited: '$pink9',
};

const MOOD_EMOJIS: Record<string, string> = {
  grateful: '🙏',
  peaceful: '☮️',
  inspired: '✨',
  confused: '🤔',
  hopeful: '🌟',
  reflective: '💭',
  anxious: '😰',
  excited: '🎉',
};

export const JournalHomeScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { entries, fetchAllJournalEntries } = useJournalStore();
  const { readings } = useReadingStore();
  const [currentView, setCurrentView] = useState<'home' | 'create' | 'edit'>('home');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [selectedReading, setSelectedReading] = useState<Reading | null>(null);

  useEffect(() => {
    fetchAllJournalEntries();
  }, []);

  if (currentView === 'create') {
    return (
      <JournalEntryScreen
        reading={selectedReading || undefined}
        onCancel={() => setCurrentView('home')}
        onSuccess={() => {
          setCurrentView('home');
          fetchAllJournalEntries();
        }}
      />
    );
  }

  if (currentView === 'edit' && selectedEntry) {
    return (
      <JournalEntryScreen
        entry={selectedEntry}
        onCancel={() => setCurrentView('home')}
        onSuccess={() => {
          setCurrentView('home');
          fetchAllJournalEntries();
        }}
      />
    );
  }

  // Group entries by date
  const entriesByDate = entries.reduce((acc, entry) => {
    const date = new Date(entry.created_at).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, JournalEntry[]>);

  return (
    <ScrollView style={styles.container}>
      <YStack space="$4" padding="$4">
        <Text fontSize="$7" fontWeight="bold">
          Your Journal
        </Text>
        <Text color="$gray10">
          Record your insights and spiritual journey
        </Text>

        <Button
          size="$4"
          backgroundColor="$green9"
          color="white"
          onPress={() => setCurrentView('create')}
        >
          ✏️ New Journal Entry
        </Button>

        {/* Recent Readings without Journal Entries */}
        {readings.length > 0 && (
          <YStack space="$3">
            <Text fontSize="$5" fontWeight="600">
              Recent Readings
            </Text>
            <Text fontSize="$3" color="$gray10">
              Tap a reading to create a journal entry
            </Text>
            
            {readings.slice(0, 3).map((reading) => {
              const hasEntry = entries.some(entry => entry.reading_id === reading.id);
              if (hasEntry) return null;
              
              return (
                <Button
                  key={reading.id}
                  size="$4"
                  variant="outlined"
                  justifyContent="flex-start"
                  onPress={() => {
                    setSelectedReading(reading);
                    setCurrentView('create');
                  }}
                >
                  <YStack alignItems="flex-start">
                    <Text fontWeight="600">
                      {reading.spread_type} reading
                    </Text>
                    <Text fontSize="$3" color="$gray10">
                      {new Date(reading.created_at).toLocaleDateString()}
                      {reading.intention && ` • "${reading.intention}"`}
                    </Text>
                  </YStack>
                </Button>
              );
            })}
          </YStack>
        )}

        {/* Journal Entries */}
        <YStack space="$3">
          <Text fontSize="$5" fontWeight="600">
            Journal Entries
          </Text>
          
          {entries.length === 0 ? (
            <YStack
              backgroundColor="$gray2"
              padding="$6"
              borderRadius="$4"
              alignItems="center"
              space="$3"
            >
              <Text fontSize="$5" fontWeight="600" color="$gray11">
                No journal entries yet
              </Text>
              <Text fontSize="$3" color="$gray9" textAlign="center">
                Start journaling to track your spiritual insights and growth
              </Text>
            </YStack>
          ) : (
            <YStack space="$4">
              {Object.entries(entriesByDate).map(([date, dayEntries]) => (
                <YStack key={date} space="$2">
                  <Text fontSize="$4" fontWeight="600" color="$purple11">
                    {date}
                  </Text>
                  
                  {dayEntries.map((entry) => (
                    <YStack
                      key={entry.id}
                      backgroundColor="$gray2"
                      padding="$4"
                      borderRadius="$4"
                      space="$3"
                    >
                      <XStack justifyContent="space-between" alignItems="flex-start">
                        <YStack flex={1} space="$2">
                          {entry.mood && (
                            <XStack alignItems="center" space="$2">
                              <Text fontSize="$4">
                                {MOOD_EMOJIS[entry.mood] || '💭'}
                              </Text>
                              <Text
                                fontSize="$3"
                                fontWeight="600"
                                color={MOOD_COLORS[entry.mood] || '$gray11'}
                              >
                                {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                              </Text>
                            </XStack>
                          )}
                          
                          <Text fontSize="$4" numberOfLines={3}>
                            {entry.content}
                          </Text>
                          
                          {entry.tags && entry.tags.length > 0 && (
                            <XStack space="$2" flexWrap="wrap">
                              {entry.tags.slice(0, 3).map((tag, index) => (
                                <View
                                  key={index}
                                  backgroundColor="$blue3"
                                  paddingHorizontal="$2"
                                  paddingVertical="$1"
                                  borderRadius="$2"
                                >
                                  <Text fontSize="$2" color="$blue11">
                                    {tag}
                                  </Text>
                                </View>
                              ))}
                              {entry.tags.length > 3 && (
                                <Text fontSize="$2" color="$gray9">
                                  +{entry.tags.length - 3} more
                                </Text>
                              )}
                            </XStack>
                          )}
                        </YStack>
                        
                        <Button
                          size="$2"
                          variant="outlined"
                          onPress={() => {
                            setSelectedEntry(entry);
                            setCurrentView('edit');
                          }}
                        >
                          Edit
                        </Button>
                      </XStack>
                    </YStack>
                  ))}
                </YStack>
              ))}
            </YStack>
          )}
        </YStack>

        {/* Journaling Benefits */}
        <YStack
          backgroundColor="$blue2"
          padding="$4"
          borderRadius="$4"
          space="$2"
        >
          <Text fontSize="$4" fontWeight="600" color="$blue11">
            🌱 Benefits of Journaling
          </Text>
          <Text fontSize="$3" color="$gray10">
            • Process and integrate your reading insights
          </Text>
          <Text fontSize="$3" color="$gray10">
            • Track patterns and growth over time
          </Text>
          <Text fontSize="$3" color="$gray10">
            • Deepen your spiritual practice
          </Text>
          <Text fontSize="$3" color="$gray10">
            • Create a personal wisdom library
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