import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import AddBalanceModal from '../../components/modals/AddBalanceModal';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { BalanceHistoryItem, BalanceResponse, getBalance, getBalanceHistory } from '../../services/api/balanceService';

export default function BalanceScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const { token, user } = useAuth();
  
  const [balance, setBalance] = useState<BalanceResponse | null>(null);
  const [history, setHistory] = useState<BalanceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  
  // Check if user is super admin
  const isSuperAdmin = user?.role === 'superadmin';
  
  useEffect(() => {
    fetchBalanceData();
  }, []);
  
  const fetchBalanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!token) {
        setError('Authentication token not found');
        return;
      }
      
      // Fetch current balance
      const balanceData = await getBalance(token);
      setBalance(balanceData);
      
      // Fetch balance history
      const historyData = await getBalanceHistory(token);
      setHistory(historyData.history);
    } catch (err: any) {
      setError(err.message || 'Failed to load balance data');
      console.error('Balance fetch error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const formatCurrency = (amount: number) => {
    return `Rs ${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy-MM-dd HH:mm');
    } catch (err) {
      return dateString;
    }
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
          onPress={fetchBalanceData}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.balanceCard, { backgroundColor: colors.tint }]}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>
          {balance ? formatCurrency(balance.balance) : 'Rs 0.00'}
        </Text>
        <Text style={styles.lastUpdated}>
          Last updated: {balance ? formatDate(balance.lastUpdated) : 'N/A'}
        </Text>
        
        {/* Admin actions */}
        {isSuperAdmin && (
          <View style={styles.adminActions}>
            <TouchableOpacity 
              key="add-adjust-button"
              style={[styles.adminButton, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
              onPress={() => setIsAddModalVisible(true)}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.adminButtonText}>Add/Adjust</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              key="set-balance-button"
              style={[styles.adminButton, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
              onPress={() => setIsEditModalVisible(true)}
            >
              <Ionicons name="pencil" size={18} color="#FFFFFF" />
              <Text style={styles.adminButtonText}>Set Balance</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <View style={styles.historyHeader}>
        <Text style={[styles.historyTitle, { color: colors.text }]}>Balance History</Text>
        <TouchableOpacity onPress={fetchBalanceData}>
          <Ionicons name="refresh" size={20} color={colors.tint} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={history}
        keyExtractor={(item) => item.transactionId}
        renderItem={({ item }) => (
          <View style={[styles.historyItem, { backgroundColor: colors.card }]}>
            <View style={styles.historyItemHeader}>
              <Text style={[styles.historyItemReason, { color: colors.text }]}>{item.reason}</Text>
              <Text style={[styles.historyItemDate, { color: colors.muted }]}>
                {formatDate(item.timestamp)}
              </Text>
            </View>
            <View style={styles.historyItemDetails}>
              <View key="previous-balance" style={styles.balanceChange}>
                <Text style={[styles.balanceChangeLabel, { color: colors.muted }]}>Previous:</Text>
                <Text style={[styles.balanceChangeValue, { color: colors.text }]}>
                  {formatCurrency(item.previousBalance)}
                </Text>
              </View>
              <View key="new-balance" style={styles.balanceChange}>
                <Text style={[styles.balanceChangeLabel, { color: colors.muted }]}>New:</Text>
                <Text style={[styles.balanceChangeValue, { color: colors.text }]}>
                  {formatCurrency(item.newBalance)}
                </Text>
              </View>
              <View key="balance-change" style={styles.balanceChange}>
                <Text style={[styles.balanceChangeLabel, { color: colors.muted }]}>Change:</Text>
                <Text 
                  style={[
                    styles.balanceChangeValue, 
                    { 
                      color: item.newBalance > item.previousBalance 
                        ? colors.success 
                        : item.newBalance < item.previousBalance 
                          ? colors.error 
                          : colors.text 
                    }
                  ]}
                >
                  {item.newBalance > item.previousBalance ? '+' : ''}
                  {formatCurrency(item.newBalance - item.previousBalance)}
                </Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              No balance history available
            </Text>
          </View>
        }
        contentContainerStyle={styles.historyList}
      />
      
      {/* Add/Adjust Balance Modal */}
      <AddBalanceModal
        key="add-modal"
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSuccess={fetchBalanceData}
      />
      
      {/* Set Balance Modal */}
      <AddBalanceModal
        key="edit-modal"
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onSuccess={fetchBalanceData}
        isEdit
        currentBalance={balance?.balance || 0}
      />
    </View>
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
  balanceCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 8,
  },
  lastUpdated: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 8,
  },
  adminActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 6,
  },
  adminButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  historyList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  historyItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyItemReason: {
    fontSize: 16,
    fontWeight: '600',
  },
  historyItemDate: {
    fontSize: 12,
  },
  historyItemDetails: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
    padding: 12,
  },
  balanceChange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  balanceChangeLabel: {
    fontSize: 14,
  },
  balanceChangeValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
}); 