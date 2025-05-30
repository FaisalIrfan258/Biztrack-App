import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Animated, Image, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { Colors } from '../constants/Colors';

export default function SplashScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const opacity = new Animated.Value(0);
  const scale = new Animated.Value(0.8);
  
  useEffect(() => {
    // Animate logo appearance
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 10,
        friction: 2,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Navigate to login screen after a delay
    const timer = setTimeout(() => {
      // Navigate to the auth route
      router.replace({
        pathname: '/(auth)/login'
      });
    }, 2500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Image 
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135706.png' }} 
          style={styles.logo} 
          tintColor="#FFFFFF"
        />
        <Text style={[styles.appName, { color: colors.text }]}>BizTrack</Text>
        <Text style={[styles.tagline, { color: colors.muted }]}>
          Smart Financial Tracking for Your Business
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2563EB', // Primary blue color
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    color: '#FFFFFF',
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    color: 'rgba(255, 255, 255, 0.8)',
  },
}); 