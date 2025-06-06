import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Link, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import AddTransactionModal from '../../components/AddTransactionModal';
import AddBalanceModal from '../../components/modals/AddBalanceModal';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../services/api/authService';
import { BalanceData, getBalance } from '../../services/api/balanceService';
import { getRecentTransactions, Transaction } from '../../services/api/transactionService';

export default function DashboardScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const { user, token, logout } = useAuth();
  
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddBalanceModalVisible, setIsAddBalanceModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  
  // Check if user is super admin
  const isSuperAdmin = user?.role === 'superadmin';
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!token) {
        setError('Authentication token not found');
        return;
      }
      
      // Fetch balance data
      const balanceResponse = await getBalance(token);
      if (balanceResponse.success && balanceResponse.data) {
        setBalance(balanceResponse.data);
      }
      
      // Fetch recent transactions
      const transactionsResponse = await getRecentTransactions(token, 5);
      if (transactionsResponse.success && transactionsResponse.transactions) {
        setRecentTransactions(transactionsResponse.transactions);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) {
      return 'Rs 0.00';
    }
    return `Rs ${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd');
    } catch (err) {
      return dateString;
    }
  };
  
  const getCategoryIcon = (category: string) => {
    // Map categories to icons
    switch (category.toLowerCase()) {
      case 'food':
        return 'fast-food-outline';
      case 'transport':
        return 'car-outline';
      case 'utilities':
        return 'flash-outline';
      case 'rent':
        return 'home-outline';
      case 'supplies':
        return 'basket-outline';
      case 'salary':
        return 'cash-outline';
      default:
        return 'card-outline'; // Default icon
    }
  };
  
  const getCategoryColor = (category: string) => {
    // Map categories to colors
    switch (category.toLowerCase()) {
      case 'food':
        return '#FF6B6B'; // Red
      case 'transport':
        return '#4ECDC4'; // Teal
      case 'utilities':
        return '#FFD166'; // Yellow
      case 'rent':
        return '#6B5B95'; // Purple
      case 'supplies':
        return '#88D8B0'; // Green
      case 'salary':
        return '#5D9CEC'; // Blue
      default:
        return colors.tint; // Default color
    }
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
  
  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
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
        {balance ? (
          <Text style={styles.balanceAmount}>
            {formatCurrency(balance.amount)}
          </Text>
        ) : error ? (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
        ) : (
          <Text style={[styles.balanceAmount, { color: colors.muted }]}>
            Rs 0.00
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
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Transactions
          </Text>
          <Link href="/(tabs)/transactions" asChild>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: colors.tint }]}>See All</Text>
            </TouchableOpacity>
          </Link>
        </View>
        
        <View style={styles.transactionsList}>
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <TouchableOpacity 
                key={transaction.transactionId}
                style={[styles.transactionItem, { backgroundColor: colors.card }]}
                onPress={() => router.push('/(tabs)/transactions')}
              >
                <View 
                  style={[
                    styles.categoryIcon, 
                    { backgroundColor: getCategoryColor(transaction.category) + '20' }
                  ]}
                >
                  <Ionicons 
                    name={getCategoryIcon(transaction.category)} 
                    size={20} 
                    color={getCategoryColor(transaction.category)} 
                  />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={[styles.transactionPurpose, { color: colors.text }]} numberOfLines={1}>
                    {transaction.purpose}
                  </Text>
                  <Text style={[styles.transactionMeta, { color: colors.muted }]}>
                    {transaction.category} • {formatDate(transaction.date)}
                  </Text>
                </View>
                <View style={styles.transactionAmount}>
                  <Text 
                    style={[
                      styles.amountText, 
                      { color: colors.text }
                    ]}
                  >
                    {formatCurrency(transaction.amount)}
                  </Text>
                  {transaction.returned && (
                    <View style={[styles.returnedTag, { backgroundColor: colors.success + '20' }]}>
                      <Text style={[styles.returnedText, { color: colors.success }]}>Returned</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                No recent transactions
              </Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.quickActions}>
        <TouchableOpacity 
          key="add-income-button"
          style={[styles.actionButton, { backgroundColor: colors.card }]}
          onPress={() => setAddModalVisible(true)}
        >
          <View style={[styles.actionIcon, { backgroundColor: colors.tint + '20' }]}>
            <Ionicons name="add" size={20} color={colors.tint} />
          </View>
          <Text style={[styles.actionText, { color: colors.text }]}>Add Transaction</Text>
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
      
      {/* Add Balance Modal */}
      <AddBalanceModal
        key="dashboard-add-modal"
        visible={isAddBalanceModalVisible}
        onClose={() => setIsAddBalanceModalVisible(false)}
        onSuccess={fetchDashboardData}
      />
      
      {/* Add Transaction Modal */}
      <AddTransactionModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSuccess={fetchDashboardData}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionPurpose: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  transactionMeta: {
    fontSize: 12,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  returnedTag: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  returnedText: {
    fontSize: 10,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
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
  errorText: {
    fontSize: 16,
  },
});
