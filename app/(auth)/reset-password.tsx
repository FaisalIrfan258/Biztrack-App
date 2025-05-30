import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';

export default function ResetPasswordScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const { resetPassword } = useAuth();
  const { token } = useLocalSearchParams<{ token: string }>();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      setError('Please enter both password fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (!token) {
      setError('Reset token is missing. Please try again or request a new reset link.');
      return;
    }
    
    setError(null);
    setSuccess(false);
    setIsLoading(true);
    
    try {
      const result = await resetPassword(token, password);
      
      if (result.success) {
        setSuccess(true);
        // Clear form after successful reset
        setPassword('');
        setConfirmPassword('');
        
        // Redirect to login after a delay
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 3000);
      } else {
        setError(result.error || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const navigateToLogin = () => {
    router.replace('/(auth)/login');
  };
  
  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <View style={[styles.logoBackground, { backgroundColor: colors.tint }]}>
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135706.png' }} 
              style={styles.logo}
              tintColor="#FFFFFF"
            />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Enter your new password below
          </Text>
        </View>
        
        <View style={styles.formContainer}>
          {error && (
            <View style={[styles.messageContainer, { backgroundColor: colors.error + '20' }]}>
              <Text style={[styles.messageText, { color: colors.error }]}>{error}</Text>
            </View>
          )}
          
          {success && (
            <View style={[styles.messageContainer, { backgroundColor: colors.success + '20' }]}>
              <Text style={[styles.messageText, { color: colors.success }]}>
                Password has been reset successfully! Redirecting to login...
              </Text>
            </View>
          )}
          
          <Input
            label="New Password"
            placeholder="Enter your new password"
            value={password}
            onChangeText={setPassword}
            isPassword
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.muted} />}
          />
          
          <Input
            label="Confirm Password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            isPassword
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.muted} />}
          />
          
          <Button 
            title="Reset Password" 
            onPress={handleResetPassword}
            isLoading={isLoading}
            style={styles.submitButton}
          />
          
          <TouchableOpacity 
            style={styles.loginLinkContainer} 
            onPress={navigateToLogin}
          >
            <Text style={[styles.loginLinkText, { color: colors.muted }]}>
              Remember your password? <Text style={{ color: colors.tint }}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  messageContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  messageText: {
    fontSize: 14,
  },
  submitButton: {
    marginTop: 16,
  },
  loginLinkContainer: {
    alignSelf: 'center',
    marginTop: 24,
  },
  loginLinkText: {
    fontSize: 14,
  },
}); 