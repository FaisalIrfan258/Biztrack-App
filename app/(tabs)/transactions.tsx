import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme
} from 'react-native';
import AddTransactionModal from '../../components/AddTransactionModal';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { Transaction, getTransactions } from '../../services/api/transactionService';

export default function TransactionsScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const { token } = useAuth();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  
  useEffect(() => {
    fetchTransactions();
  }, []);
  
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!token) {
        setError('Authentication token not found');
        return;
      }
      
      const response = await getTransactions(token);
      
      if (response.success && response.transactions) {
        // Sort by date (newest first)
        const sortedTransactions = [...response.transactions].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setTransactions(sortedTransactions);
      } else {
        setError('Failed to load transactions');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
      console.error('Transactions fetch error:', err);
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
      return format(date, 'MMM dd, yyyy');
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
  
  const showTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailsVisible(true);
  };
  
  const TransactionDetailsModal = () => {
    if (!selectedTransaction) return null;
    
    return (
      <Modal
        visible={detailsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Transaction Details</Text>
              <TouchableOpacity onPress={() => setDetailsVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.muted }]}>Amount</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {formatCurrency(selectedTransaction.amount)}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.muted }]}>Date</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {formatDate(selectedTransaction.date)}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.muted }]}>Category</Text>
                <View style={styles.categoryTag}>
                  <View 
                    style={[
                      styles.categoryDot, 
                      { backgroundColor: getCategoryColor(selectedTransaction.category) }
                    ]} 
                  />
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {selectedTransaction.category}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.muted }]}>Purpose</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {selectedTransaction.purpose}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.muted }]}>Paid By</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {selectedTransaction.paidBy}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.muted }]}>Status</Text>
                <View 
                  style={[
                    styles.statusTag, 
                    { 
                      backgroundColor: selectedTransaction.returned 
                        ? colors.success + '20' 
                        : colors.warning + '20' 
                    }
                  ]}
                >
                  <Text 
                    style={[
                      styles.statusText, 
                      { 
                        color: selectedTransaction.returned 
                          ? colors.success 
                          : colors.warning 
                      }
                    ]}
                  >
                    {selectedTransaction.returned ? 'Returned' : 'Not Returned'}
                  </Text>
                </View>
              </View>
              
              {selectedTransaction.returned && selectedTransaction.returnedDate && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.muted }]}>Returned Date</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {formatDate(selectedTransaction.returnedDate)}
                  </Text>
                </View>
              )}
              
              {selectedTransaction.receipt && (
                <View style={styles.receiptContainer}>
                  <Text style={[styles.detailLabel, { color: colors.muted, marginBottom: 8 }]}>Receipt</Text>
                  <Image 
                    source={{ uri: selectedTransaction.receipt }} 
                    style={styles.receiptImage}
                    resizeMode="contain"
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
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
          onPress={fetchTransactions}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Transactions</Text>
        <TouchableOpacity onPress={fetchTransactions}>
          <Ionicons name="refresh" size={20} color={colors.tint} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.transactionId}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.transactionItem, { backgroundColor: colors.card }]}
            onPress={() => showTransactionDetails(item)}
          >
            <View 
              style={[
                styles.categoryIcon, 
                { backgroundColor: getCategoryColor(item.category) + '20' }
              ]}
            >
              <Ionicons 
                name={getCategoryIcon(item.category)} 
                size={24} 
                color={getCategoryColor(item.category)} 
              />
            </View>
            <View style={styles.transactionDetails}>
              <Text style={[styles.transactionPurpose, { color: colors.text }]} numberOfLines={1}>
                {item.purpose}
              </Text>
              <View style={styles.transactionMeta}>
                <Text style={[styles.transactionCategory, { color: colors.muted }]}>
                  {item.category}
                </Text>
                <Text style={[styles.transactionDate, { color: colors.muted }]}>
                  {formatDate(item.date)}
                </Text>
              </View>
            </View>
            <View style={styles.transactionAmount}>
              <Text 
                style={[
                  styles.amountText, 
                  { color: colors.text }
                ]}
              >
                {formatCurrency(item.amount)}
              </Text>
              {item.returned && (
                <View style={[styles.returnedTag, { backgroundColor: colors.success + '20' }]}>
                  <Text style={[styles.returnedText, { color: colors.success }]}>Returned</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              No transactions available
            </Text>
          </View>
        }
        contentContainerStyle={styles.transactionsList}
      />
      
      {/* Add Transaction Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.tint }]}
        onPress={() => setAddModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      
      {/* Transaction Details Modal */}
      <TransactionDetailsModal />
      
      {/* Add Transaction Modal */}
      <AddTransactionModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSuccess={fetchTransactions}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionPurpose: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionCategory: {
    fontSize: 13,
    marginRight: 8,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
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
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusTag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  receiptContainer: {
    marginTop: 16,
  },
  receiptImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
}); 