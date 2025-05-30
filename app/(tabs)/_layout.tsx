import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { TokenValidator } from '../../utils/tokenValidator';

export default function TabLayout() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const { validateToken } = useAuth();
  
  // Validate token when tabs are first loaded
  useEffect(() => {
    validateToken();
  }, []);

  return (
    <TokenValidator>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.tint,
          tabBarInactiveTintColor: colors.tabIconDefault,
          tabBarStyle: { 
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="transactions"
          options={{
            title: 'Transactions',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="swap-horizontal-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            title: 'Reports',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bar-chart-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="action-logs"
          options={{
            title: 'Action Logs',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
        {/* Hidden screens that don't appear in tab bar */}
        <Tabs.Screen
          name="balance"
          options={{
            title: 'Balance',
            tabBarButton: () => null, // Hide from tab bar
            headerLeft: ({ tintColor }) => (
              <Ionicons 
                name="arrow-back" 
                size={24} 
                color={tintColor} 
                style={{ marginLeft: 16 }}
                onPress={() => {
                  const { router } = require('expo-router');
                  router.back();
                }}
              />
            ),
          }}
        />
      </Tabs>
    </TokenValidator>
  );
}
