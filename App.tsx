import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { TamaguiProvider, createTamagui } from '@tamagui/core';
import { config } from '@tamagui/config/v3';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthScreen } from './src/screens/auth';
import { HomeScreen } from './src/screens/HomeScreen';
import { useAuthStore } from './src/stores/authStore';

// Create Tamagui configuration
const tamaguiConfig = createTamagui(config);

// Create React Query client
const queryClient = new QueryClient();

export default function App() {
  const { user, refreshSession } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await refreshSession();
      } catch (error) {
        console.error('Failed to refresh session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  if (isLoading) {
    return null; // You can add a loading screen here
  }

  return (
    <TamaguiProvider config={tamaguiConfig}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="auto" />
        {user ? <HomeScreen /> : <AuthScreen />}
      </QueryClientProvider>
    </TamaguiProvider>
  );
}
