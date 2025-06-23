import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { View } from '@tamagui/core';
import { LoginScreen } from './LoginScreen';
import { SignUpScreen } from './SignUpScreen';

export const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <View style={styles.container}>
      {isLogin ? (
        <LoginScreen onToggleMode={toggleMode} />
      ) : (
        <SignUpScreen onToggleMode={toggleMode} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});