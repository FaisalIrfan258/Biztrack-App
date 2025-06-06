import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { getTransactionById } from '../../services/api/transactionService';
import { Transaction } from '../../services/api/transactionService';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';

const TransactionDetail = () => {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!id || !user?.token) return;
      
      try {
        setLoading(true);
        const response = await getTransactionById(user.token, id as string);
        if (response.success && response.transaction) {
          setTransaction(response.transaction);
        } else {
          setError('Failed to load transaction details');
        }
      } catch (err) {
        console.error('Error fetching transaction:', err);
        setError('An error occurred while fetching transaction details');
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id, user?.token]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.centered}>
        <Text>Transaction not found</Text>
      </View>
    );
  }

  const formattedDate = format(new Date(transaction.date), 'PPP');
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(transaction.amount);

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Transaction Details',
          headerBackTitle: 'Back',
        }}
      />

      {/* Transaction Card */}
      <View style={styles.card}>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>{formattedAmount}</Text>
          <View style={[
            styles.statusBadge,
            transaction.returned ? styles.returnedBadge : styles.activeBadge
          ]}>
            <Text style={styles.statusText}>
              {transaction.returned ? 'Returned' : 'Active'}
            </Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <MaterialIcons name="category" size={20} color="#666" />
          <Text style={styles.detailText}>{transaction.category}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <MaterialIcons name="description" size={20} color="#666" />
          <Text style={styles.detailText}>{transaction.purpose}</Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="person" size={20} color="#666" />
          <Text style={styles.detailText}>Paid by: {transaction.paidBy}</Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="date-range" size={20} color="#666" />
          <Text style={styles.detailText}>{formattedDate}</Text>
        </View>

        {transaction.returned && transaction.returnedDate && (
          <View style={styles.detailRow}>
            <MaterialIcons name="assignment-return" size={20} color="#666" />
            <Text style={styles.detailText}>
              Returned on: {format(new Date(transaction.returnedDate), 'PPP')}
            </Text>
          </View>
        )}

        {transaction.receipt && (
          <View style={styles.receiptContainer}>
            <Text style={styles.sectionTitle}>Receipt</Text>
            <Image 
              source={{ uri: transaction.receipt }} 
              style={styles.receiptImage}
              resizeMode="contain"
            />
          </View>
        )}
      </View>

      {/* Edit History */}
      {transaction.editHistory && transaction.editHistory.length > 0 && (
        <View style={styles.historyContainer}>
          <Text style={styles.sectionTitle}>Edit History</Text>
          {transaction.editHistory.map((edit, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.historyText}>
                Edited by {edit.userId} on {format(new Date(edit.timestamp), 'PPPp')}
              </Text>
              {/* You can add more details about what was changed */}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  activeBadge: {
    backgroundColor: '#e3f2fd',
  },
  returnedBadge: {
    backgroundColor: '#e8f5e9',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
    color: '#333',
  },
  receiptContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  receiptImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginTop: 8,
  },
  historyContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyText: {
    fontSize: 14,
    color: '#666',
  },
});

export default TransactionDetail;
