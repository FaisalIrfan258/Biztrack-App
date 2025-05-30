import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPasswordScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const { forgotPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setError(null);
    setSuccess(false);
    setIsLoading(true);
    
    try {
      const result = await forgotPassword(email);
      
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Failed to process request. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const navigateToLogin = () => {
    router.back();
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
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={navigateToLogin}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
          <View style={[styles.logoBackground, { backgroundColor: colors.tint }]}>
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135706.png' }} 
              style={styles.logo}
              tintColor="#FFFFFF"
            />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Forgot Password</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Enter your email address to receive a password reset link
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
                Password reset link has been sent to your email address.
              </Text>
            </View>
          )}
          
          <Input
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Ionicons name="mail-outline" size={20} color={colors.muted} />}
          />
          
          <Button 
            title="Send Reset Link" 
            onPress={handleForgotPassword}
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
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 100,
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
    paddingHorizontal: 20,
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