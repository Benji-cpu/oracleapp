import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Button, Input, Text, View, YStack, XStack } from '@tamagui/core';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../stores/authStore';

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

interface SignUpScreenProps {
  onToggleMode: () => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ onToggleMode }) => {
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    setLoading(true);
    try {
      await signUp(data.email, data.password, data.username);
      Alert.alert(
        'Account Created',
        'Please check your email to confirm your account before signing in.'
      );
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <YStack space="$4" padding="$4">
        <Text fontSize="$8" fontWeight="bold" textAlign="center">
          Create Account
        </Text>
        <Text fontSize="$4" color="$gray10" textAlign="center">
          Join Oracle Card Creator and start your journey
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
            name="username"
            render={({ field: { onChange, onBlur, value } }) => (
              <YStack space="$2">
                <Input
                  placeholder="Username (optional)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="none"
                  autoComplete="username"
                  size="$4"
                  borderColor={errors.username ? '$red8' : '$gray8'}
                />
                {errors.username && (
                  <Text color="$red10" fontSize="$2">
                    {errors.username.message}
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
                  autoComplete="new-password"
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

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <YStack space="$2">
                <Input
                  placeholder="Confirm Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  autoComplete="new-password"
                  size="$4"
                  borderColor={errors.confirmPassword ? '$red8' : '$gray8'}
                />
                {errors.confirmPassword && (
                  <Text color="$red10" fontSize="$2">
                    {errors.confirmPassword.message}
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
          {loading ? 'Creating Account...' : 'Sign Up'}
        </Button>

        <XStack justifyContent="center" space="$2">
          <Text color="$gray10">Already have an account?</Text>
          <Text
            color="$blue10"
            textDecorationLine="underline"
            onPress={onToggleMode}
          >
            Sign In
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