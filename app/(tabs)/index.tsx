import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import AddBalanceModal from '../../components/modals/AddBalanceModal';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../services/api/authService';
import { BalanceResponse, getBalance } from '../../services/api/balanceService';

export default function DashboardScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const { user, token, logout } = useAuth();
  
  const [balanceData, setBalanceData] = useState<BalanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddBalanceModalVisible, setIsAddBalanceModalVisible] = useState(false);
  
  // Check if user is super admin
  const isSuperAdmin = user?.role === 'superadmin';
  
  useEffect(() => {
    fetchBalanceData();
  }, []);
  
  const fetchBalanceData = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const data = await getBalance(token);
      setBalanceData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load balance');
      console.error('Balance fetch error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const formatCurrency = (amount: number) => {
    return `Rs ${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
  };
  
  const navigateToBalance = () => {
    router.push('/(tabs)/balance');
  };
  
  const handleAddIncome = () => {
    if (isSuperAdmin) {
      setIsAddBalanceModalVisible(true);
    } else {
      // For non-admin users, show a different screen or alert
      Alert.alert('Permission Denied', 'Only super admins can add balance directly.');
    }
  };

  const handleLogout = async () => {
    try {
      if (token) {
        await logoutUser(token);
      }
      logout();
      router.replace('/login');
    } catch (err) {
      console.error('Logout error:', err);
      // Even if API call fails, still logout locally
      logout();
      router.replace('/login');
    }
  };
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.welcomeText, { color: colors.muted }]}>Welcome back,</Text>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'User'}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: colors.card, marginRight: 10 }]}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Ionicons name="person-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: colors.card }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[styles.balanceCard, { backgroundColor: colors.tint }]}
        onPress={navigateToBalance}
        activeOpacity={0.9}
      >
        <Text style={styles.balanceLabel}>Total Balance</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.balanceAmount}>
            {balanceData ? formatCurrency(balanceData.balance) : 'Rs 0.00'}
          </Text>
        )}
        <View style={styles.balanceDetails}>
          <View key="income-item" style={styles.balanceItem}>
            <View style={styles.balanceIconContainer}>
              <Ionicons name="arrow-down" size={16} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.balanceItemLabel}>Income</Text>
              <Text style={styles.balanceItemValue}>
                {/* Will be replaced with real data from API */}
                Rs 0.00
              </Text>
            </View>
          </View>
          <View key="expense-item" style={styles.balanceItem}>
            <View style={[styles.balanceIconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <Ionicons name="arrow-up" size={16} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.balanceItemLabel}>Expenses</Text>
              <Text style={styles.balanceItemValue}>
                {/* Will be replaced with real data from API */}
                Rs 0.00
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
      
      <View style={styles.quickActions}>
        <TouchableOpacity 
          key="add-income-button"
          style={[styles.actionButton, { backgroundColor: colors.card }]}
          onPress={handleAddIncome}
        >
          <View style={[styles.actionIcon, { backgroundColor: colors.tint + '20' }]}>
            <Ionicons name="add-outline" size={24} color={colors.tint} />
          </View>
          <Text style={[styles.actionText, { color: colors.text }]}>Add Income</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          key="add-expense-button"
          style={[styles.actionButton, { backgroundColor: colors.card }]}>
          <View style={[styles.actionIcon, { backgroundColor: colors.error + '20' }]}>
            <Ionicons name="remove-outline" size={24} color={colors.error} />
          </View>
          <Text style={[styles.actionText, { color: colors.text }]}>Add Expense</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          key="create-invoice-button"
          style={[styles.actionButton, { backgroundColor: colors.card }]}>
          <View style={[styles.actionIcon, { backgroundColor: colors.info + '20' }]}>
            <Ionicons name="document-text-outline" size={24} color={colors.info} />
          </View>
          <Text style={[styles.actionText, { color: colors.text }]}>Create Invoice</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
        <TouchableOpacity>
          <Text style={[styles.seeAllText, { color: colors.tint }]}>See All</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.transactionsList}>
        {/* This will be replaced with real transaction data from API */}
        <View style={[styles.emptyTransactions, { backgroundColor: colors.card }]}>
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            No recent transactions
          </Text>
        </View>
      </View>
      
      {/* Add Balance Modal */}
      <AddBalanceModal
        key="dashboard-add-modal"
        visible={isAddBalanceModalVisible}
        onClose={() => setIsAddBalanceModalVisible(false)}
        onSuccess={fetchBalanceData}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  welcomeText: {
    fontSize: 14,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 16,
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  balanceItemLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  balanceItemValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    width: '30%',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
  },
  transactionsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyTransactions: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  transactionCategory: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
});
