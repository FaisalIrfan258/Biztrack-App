import { router } from 'expo-router';
import React from 'react';
import { Image, KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/Colors';

export default function ResetPasswordScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  
  const navigateToLogin = () => {
    router.replace('/(auth)/login');
  };
  
  const requestNewResetLink = () => {
    router.replace('/(auth)/forgot-password');
  };
  
  const openWebResetPage = () => {
    // Open the web reset page in browser
    Linking.openURL('https://biztrackbackend.onrender.com/reset-password');
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
            Password reset is available via web browser
          </Text>
        </View>
        
        <View style={styles.formContainer}>
          <View style={[styles.messageContainer, { backgroundColor: colors.info + '20' }]}>
            <Text style={[styles.messageText, { color: colors.info }]}>
              For security reasons, password reset is now handled through our web interface. Please check your email for the reset link or request a new one.
            </Text>
          </View>
          
          <Button 
            title="Request Password Reset" 
            onPress={requestNewResetLink}
            style={styles.submitButton}
          />
          
          <Button 
            title="Open Web Reset Page" 
            onPress={openWebResetPage}
            style={[styles.submitButton, { marginTop: 12 }]}
            variant="outline"
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
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
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