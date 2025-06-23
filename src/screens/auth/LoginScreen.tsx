import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Button, Input, Text, View, YStack, XStack } from '@tamagui/core';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../stores/authStore';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginScreenProps {
  onToggleMode: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onToggleMode }) => {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      await signIn(data.email, data.password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <YStack space="$4" padding="$4">
        <Text fontSize="$8" fontWeight="bold" textAlign="center">
          Welcome Back
        </Text>
        <Text fontSize="$4" color="$gray10" textAlign="center">
          Sign in to your Oracle Card Creator account
        </Text>

        <YStack space="$3">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <YStack space="$2">
                <Input
                  placeholder="Email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  size="$4"
                  borderColor={errors.email ? '$red8' : '$gray8'}
                />
                {errors.email && (
                  <Text color="$red10" fontSize="$2">
                    {errors.email.message}
                  </Text>
                )}
              </YStack>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <YStack space="$2">
                <Input
                  placeholder="Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  autoComplete="password"
                  size="$4"
                  borderColor={errors.password ? '$red8' : '$gray8'}
                />
                {errors.password && (
                  <Text color="$red10" fontSize="$2">
                    {errors.password.message}
                  </Text>
                )}
              </YStack>
            )}
          />
        </YStack>

        <Button
          size="$4"
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
          backgroundColor="$blue9"
          color="white"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>

        <XStack justifyContent="center" space="$2">
          <Text color="$gray10">Don't have an account?</Text>
          <Text
            color="$blue10"
            textDecorationLine="underline"
            onPress={onToggleMode}
          >
            Sign Up
          </Text>
        </XStack>
      </YStack>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
});