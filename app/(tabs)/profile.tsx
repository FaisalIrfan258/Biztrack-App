import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import ChangePasswordModal from '../../components/modals/ChangePasswordModal';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { User, getUserProfile } from '../../services/api/authService';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const { user: authUser, token, logout } = useAuth();
  
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);
  
  useEffect(() => {
    fetchUserProfile();
  }, []);
  
  const fetchUserProfile = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await getUserProfile(token);
      setUserProfile(response.user);
    } catch (err: any) {
      setError(err.message || 'Failed to load user profile');
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMMM dd, yyyy');
    } catch (err) {
      return dateString;
    }
  };
  
  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: logout,
          style: 'destructive',
        },
      ]
    );
  };
  
  const handlePasswordChangeSuccess = () => {
    Alert.alert('Success', 'Your password has been changed successfully.');
  };
  
  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.tint }]}
          onPress={fetchUserProfile}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const displayUser = userProfile || authUser;
  
  if (!displayUser) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>No user data available</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.avatarContainer, { backgroundColor: colors.tint }]}>
          <Text style={styles.avatarText}>
            {displayUser.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{displayUser.name}</Text>
        <Text style={[styles.role, { color: colors.muted }]}>
          {displayUser.role.charAt(0).toUpperCase() + displayUser.role.slice(1)}
        </Text>
      </View>
      
      <View style={styles.infoSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Information</Text>
        
        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.muted }]}>Email</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{displayUser.email}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.muted }]}>Role</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {displayUser.role.charAt(0).toUpperCase() + displayUser.role.slice(1)}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.muted }]}>Member Since</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {formatDate(displayUser.createdAt)}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.actionsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Settings</Text>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.card }]}
          onPress={() => setIsChangePasswordModalVisible(true)}
        >
          <View style={styles.actionContent}>
            <Ionicons name="lock-closed-outline" size={24} color={colors.text} />
            <Text style={[styles.actionText, { color: colors.text }]}>Change Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.muted} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.card }]}
          onPress={handleLogout}
        >
          <View style={styles.actionContent}>
            <Ionicons name="log-out-outline" size={24} color={colors.error} />
            <Text style={[styles.actionText, { color: colors.error }]}>Logout</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.muted} />
        </TouchableOpacity>
      </View>
      
      <ChangePasswordModal
        visible={isChangePasswordModalVisible}
        onClose={() => setIsChangePasswordModalVisible(false)}
        onSuccess={handlePasswordChangeSuccess}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  role: {
    fontSize: 16,
    marginTop: 4,
  },
  infoSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
  },
  infoItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
}); 