import React from 'react';
import { StyleSheet, Alert } from 'react-native';
import { Text, View, YStack, XStack, Button, ScrollView } from '@tamagui/core';
import { useAuthStore } from '../../stores/authStore';

export const SettingsScreen: React.FC = () => {
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <YStack space="$4" padding="$4">
        <Text fontSize="$7" fontWeight="bold">
          Settings
        </Text>

        {/* Profile Section */}
        <YStack
          backgroundColor="$gray2"
          padding="$4"
          borderRadius="$4"
          space="$3"
        >
          <Text fontSize="$5" fontWeight="600">
            Profile
          </Text>
          <YStack space="$2">
            <XStack justifyContent="space-between">
              <Text color="$gray10">Email</Text>
              <Text>{user?.email}</Text>
            </XStack>
            {user?.username && (
              <XStack justifyContent="space-between">
                <Text color="$gray10">Username</Text>
                <Text>{user.username}</Text>
              </XStack>
            )}
            <XStack justifyContent="space-between">
              <Text color="$gray10">Subscription</Text>
              <Text fontWeight="600" color="$purple11">
                {user?.subscription_tier?.toUpperCase()}
              </Text>
            </XStack>
          </YStack>
        </YStack>

        {/* Subscription Section */}
        {user?.subscription_tier === 'free' && (
          <YStack
            backgroundColor="$purple2"
            padding="$4"
            borderRadius="$4"
            space="$3"
          >
            <Text fontSize="$5" fontWeight="600" color="$purple11">
              Upgrade to Premium
            </Text>
            <Text fontSize="$3" color="$gray10">
              Unlock unlimited decks, advanced AI features, and export capabilities
            </Text>
            <Button
              size="$3"
              backgroundColor="$purple9"
              color="white"
              alignSelf="flex-start"
            >
              View Plans
            </Button>
          </YStack>
        )}

        {/* App Settings */}
        <YStack
          backgroundColor="$gray2"
          padding="$4"
          borderRadius="$4"
          space="$3"
        >
          <Text fontSize="$5" fontWeight="600">
            App Settings
          </Text>
          <YStack space="$3">
            <Button
              size="$3"
              variant="outlined"
              justifyContent="flex-start"
            >
              Notifications
            </Button>
            <Button
              size="$3"
              variant="outlined"
              justifyContent="flex-start"
            >
              Privacy & Data
            </Button>
            <Button
              size="$3"
              variant="outlined"
              justifyContent="flex-start"
            >
              Help & Support
            </Button>
          </YStack>
        </YStack>

        {/* Actions */}
        <YStack space="$3">
          <Button
            size="$4"
            backgroundColor="$red9"
            color="white"
            onPress={handleSignOut}
          >
            Sign Out
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