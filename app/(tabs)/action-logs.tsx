import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { ActionLogItem, getActionLogs } from '../../services/api/actionLogService';

export default function ActionLogsScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const { token } = useAuth();
  
  const [logs, setLogs] = useState<ActionLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchActionLogs();
  }, []);
  
  const fetchActionLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!token) {
        setError('Authentication token not found');
        return;
      }
      
      const response = await getActionLogs(token);
      
      if (response.success && response.actionLogs) {
        setLogs(response.actionLogs);
      } else {
        setError('Failed to load action logs');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load action logs');
      console.error('Action logs fetch error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy-MM-dd HH:mm');
    } catch (err) {
      return dateString;
    }
  };
  
  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
        return 'log-in-outline';
      case 'logout':
        return 'log-out-outline';
      case 'create':
        return 'add-circle-outline';
      case 'update':
        return 'create-outline';
      case 'delete':
        return 'trash-outline';
      case 'balance':
      case 'balance-adjust':
      case 'balance-set':
        return 'cash-outline';
      case 'password-change':
        return 'lock-closed-outline';
      default:
        return 'ellipsis-horizontal-outline';
    }
  };
  
  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
        return colors.success;
      case 'logout':
        return colors.info;
      case 'create':
        return colors.success;
      case 'update':
        return colors.warning;
      case 'delete':
        return colors.error;
      case 'balance':
      case 'balance-adjust':
      case 'balance-set':
        return colors.tint;
      case 'password-change':
        return colors.warning;
      default:
        return colors.text;
    }
  };
  
  // Format action for display
  const formatAction = (action: string) => {
    return action
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Get action details as a string
  const getActionDetails = (item: ActionLogItem): string => {
    if (!item.details) return 'No details available';
    
    switch (item.action.toLowerCase()) {
      case 'login':
        return `User logged in successfully`;
      case 'logout':
        return `User logged out`;
      case 'password-change':
        return `Password changed successfully`;
      case 'balance-adjust':
        if (item.previousState && item.newState) {
          const previous = parseFloat(item.previousState.toString());
          const current = parseFloat(item.newState.toString());
          const diff = current - previous;
          return `${diff > 0 ? 'Added' : 'Subtracted'} Rs ${Math.abs(diff).toLocaleString()} ${
            item.details.reason ? `(${item.details.reason})` : ''
          }`;
        }
        return item.details.reason || 'Balance adjusted';
      case 'balance-set':
        if (item.newState) {
          return `Set balance to Rs ${parseFloat(item.newState.toString()).toLocaleString()} ${
            item.details.reason ? `(${item.details.reason})` : ''
          }`;
        }
        return item.details.reason || 'Balance set';
      default:
        // Try to extract meaningful info from details
        if (typeof item.details === 'object') {
          const detailsStr = Object.entries(item.details)
            .filter(([key]) => key !== 'name' && key !== 'email' && key !== 'role')
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          return detailsStr || 'No specific details';
        }
        return String(item.details) || 'No details available';
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
          onPress={fetchActionLogs}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>System Activity</Text>
        <TouchableOpacity onPress={fetchActionLogs}>
          <Ionicons name="refresh" size={20} color={colors.tint} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={logs}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={[styles.logItem, { backgroundColor: colors.card }]}>
            <View style={styles.logIconContainer}>
              <View style={[styles.logIcon, { backgroundColor: getActionColor(item.action) + '20' }]}>
                <Ionicons name={getActionIcon(item.action)} size={20} color={getActionColor(item.action)} />
              </View>
            </View>
            <View style={styles.logContent}>
              <View style={styles.logHeader}>
                <Text style={[styles.logAction, { color: colors.text }]}>
                  {formatAction(item.action)}
                </Text>
                <Text style={[styles.logTime, { color: colors.muted }]}>
                  {formatDate(item.timestamp)}
                </Text>
              </View>
              <Text style={[styles.logUser, { color: colors.text }]}>
                {item.userId?.name || 'Unknown User'}
              </Text>
              <Text style={[styles.logDetails, { color: colors.muted }]}>
                {getActionDetails(item)}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              No action logs available
            </Text>
          </View>
        }
        contentContainerStyle={styles.logsList}
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
  logsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  logItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  logIconContainer: {
    marginRight: 12,
  },
  logIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logContent: {
    flex: 1,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logAction: {
    fontSize: 16,
    fontWeight: '600',
  },
  logTime: {
    fontSize: 12,
  },
  logUser: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  logDetails: {
    fontSize: 14,
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
}); 