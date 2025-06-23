import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { DeckGalleryScreen } from '../screens/deck/DeckGalleryScreen';
import { ReadingHomeScreen } from '../screens/reading/ReadingHomeScreen';
import { JournalHomeScreen } from '../screens/journal/JournalHomeScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#6b7280',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            // You can replace this with proper icons later
            <HomeIcon color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Decks"
        component={DeckGalleryScreen}
        options={{
          tabBarLabel: 'Decks',
          tabBarIcon: ({ color, size }) => (
            <DeckIcon color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Reading"
        component={ReadingHomeScreen}
        options={{
          tabBarLabel: 'Reading',
          tabBarIcon: ({ color, size }) => (
            <ReadingIcon color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Journal"
        component={JournalHomeScreen}
        options={{
          tabBarLabel: 'Journal',
          tabBarIcon: ({ color, size }) => (
            <JournalIcon color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <SettingsIcon color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Temporary icon components - replace with proper icons later

const HomeIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: size / 2 }} />
);

const DeckIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 4 }} />
);

const ReadingIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 0 }} />
);

const JournalIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 2 }} />
);

const SettingsIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 6 }} />
);