import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';

export default function DashboardScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuth();
  
  // Mock data for the dashboard
  const balanceSummary = {
    totalBalance: 24500.75,
    income: 32000,
    expenses: 7499.25
  };
  
  const recentTransactions = [
    { id: '1', title: 'Office Supplies', amount: -350.25, date: '2023-05-28', category: 'Expenses' },
    { id: '2', title: 'Client Payment', amount: 2500, date: '2023-05-26', category: 'Income' },
    { id: '3', title: 'Software Subscription', amount: -89.99, date: '2023-05-25', category: 'Expenses' },
    { id: '4', title: 'Consulting Fee', amount: 1200, date: '2023-05-24', category: 'Income' },
  ];
  
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
  };
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.welcomeText, { color: colors.muted }]}>Welcome back,</Text>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'User'}</Text>
        </View>
        <TouchableOpacity style={[styles.notificationButton, { backgroundColor: colors.card }]}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.balanceCard, { backgroundColor: colors.tint }]}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(balanceSummary.totalBalance)}</Text>
        <View style={styles.balanceDetails}>
          <View style={styles.balanceItem}>
            <View style={styles.balanceIconContainer}>
              <Ionicons name="arrow-down" size={16} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.balanceItemLabel}>Income</Text>
              <Text style={styles.balanceItemValue}>{formatCurrency(balanceSummary.income)}</Text>
            </View>
          </View>
          <View style={styles.balanceItem}>
            <View style={[styles.balanceIconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <Ionicons name="arrow-up" size={16} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.balanceItemLabel}>Expenses</Text>
              <Text style={styles.balanceItemValue}>{formatCurrency(balanceSummary.expenses)}</Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.quickActions}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]}>
          <View style={[styles.actionIcon, { backgroundColor: colors.tint + '20' }]}>
            <Ionicons name="add-outline" size={24} color={colors.tint} />
          </View>
          <Text style={[styles.actionText, { color: colors.text }]}>Add Income</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]}>
          <View style={[styles.actionIcon, { backgroundColor: colors.error + '20' }]}>
            <Ionicons name="remove-outline" size={24} color={colors.error} />
          </View>
          <Text style={[styles.actionText, { color: colors.text }]}>Add Expense</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]}>
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
        {recentTransactions.map((transaction) => (
          <TouchableOpacity 
            key={transaction.id} 
            style={[styles.transactionItem, { backgroundColor: colors.card }]}
          >
            <View style={[
              styles.transactionCategory, 
              { backgroundColor: transaction.amount > 0 ? colors.success + '20' : colors.error + '20' }
            ]}>
              <Ionicons 
                name={transaction.amount > 0 ? 'arrow-down' : 'arrow-up'} 
                size={16} 
                color={transaction.amount > 0 ? colors.success : colors.error} 
              />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={[styles.transactionTitle, { color: colors.text }]}>{transaction.title}</Text>
              <Text style={[styles.transactionDate, { color: colors.muted }]}>{transaction.date}</Text>
            </View>
            <Text 
              style={[
                styles.transactionAmount, 
                { color: transaction.amount > 0 ? colors.success : colors.error }
              ]}
            >
              {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
  notificationButton: {
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
