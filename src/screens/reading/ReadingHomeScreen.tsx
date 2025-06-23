import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, View, YStack, ScrollView } from '@tamagui/core';

export const ReadingHomeScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <YStack space="$4" padding="$4">
        <Text fontSize="$7" fontWeight="bold">
          Oracle Readings
        </Text>
        <Text color="$gray10">
          Connect with your inner wisdom through guided card readings
        </Text>

        {/* Placeholder content */}
        <YStack
          backgroundColor="$gray2"
          padding="$6"
          borderRadius="$4"
          alignItems="center"
          space="$3"
        >
          <Text fontSize="$5" fontWeight="600" color="$gray11">
            Reading feature coming soon
          </Text>
          <Text fontSize="$3" color="$gray9" textAlign="center">
            Choose from various spreads and receive AI-powered interpretations
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