import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    useColorScheme
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { adjustBalance, setBalance } from '../../services/api/balanceService';

interface AddBalanceModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isEdit?: boolean;
  currentBalance?: number;
}

export default function AddBalanceModal({ 
  visible, 
  onClose, 
  onSuccess, 
  isEdit = false,
  currentBalance = 0
}: AddBalanceModalProps) {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const { token } = useAuth();
  
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdjustment, setIsAdjustment] = useState(false);
  
  // Reset form when modal is opened
  useEffect(() => {
    if (visible) {
      setAmount('');
      setReason('');
      setError(null);
      setIsAdjustment(!isEdit); // Default to adjustment for adding, not for editing
    }
  }, [visible, isEdit]);
  
  const handleSubmit = async () => {
    if (!amount || !reason) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      if (!token) {
        setError('Authentication token not found');
        return;
      }
      
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount)) {
        setError('Please enter a valid amount');
        return;
      }
      
      if (isEdit) {
        // When editing, we're setting the balance to a specific value
        await setBalance(token, parsedAmount, reason);
      } else {
        // When adding, we can either adjust or set
        if (isAdjustment) {
          await adjustBalance(token, parsedAmount, reason);
        } else {
          await setBalance(token, parsedAmount, reason);
        }
      }
      
      // Close modal and refresh data
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update balance');
      console.error('Balance operation error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {isEdit ? 'Edit Balance' : 'Add Balance'}
              </Text>
              
              {isEdit && (
                <View style={styles.currentBalanceContainer}>
                  <Text style={[styles.currentBalanceLabel, { color: colors.muted }]}>
                    Current Balance:
                  </Text>
                  <Text style={[styles.currentBalanceValue, { color: colors.text }]}>
                    Rs {currentBalance.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}
                  </Text>
                </View>
              )}
              
              {!isEdit && (
                <View style={styles.modeSelector}>
                  <TouchableOpacity
                    key="adjust-mode"
                    style={[
                      styles.modeButton,
                      isAdjustment ? styles.modeButtonActive : {},
                      { borderColor: colors.border }
                    ]}
                    onPress={() => setIsAdjustment(true)}
                  >
                    <Text 
                      style={[
                        styles.modeButtonText, 
                        { color: isAdjustment ? colors.tint : colors.text }
                      ]}
                    >
                      Adjust Balance
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    key="set-mode"
                    style={[
                      styles.modeButton,
                      !isAdjustment ? styles.modeButtonActive : {},
                      { borderColor: colors.border }
                    ]}
                    onPress={() => setIsAdjustment(false)}
                  >
                    <Text 
                      style={[
                        styles.modeButtonText, 
                        { color: !isAdjustment ? colors.tint : colors.text }
                      ]}
                    >
                      Set Balance
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  {isAdjustment && !isEdit 
                    ? 'Amount to Add/Subtract (Rs)' 
                    : 'Amount (Rs)'
                  }
                </Text>
                {isAdjustment && !isEdit && (
                  <Text style={[styles.inputHint, { color: colors.muted }]}>
                    Use positive values to add, negative to subtract
                  </Text>
                )}
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: colors.border 
                    }
                  ]}
                  placeholder="Enter amount"
                  placeholderTextColor={colors.muted}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Reason</Text>
                <TextInput
                  style={[
                    styles.input, 
                    styles.reasonInput,
                    { 
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: colors.border,
                      textAlignVertical: 'top'
                    }
                  ]}
                  placeholder="Enter reason for balance change"
                  placeholderTextColor={colors.muted}
                  value={reason}
                  onChangeText={setReason}
                  multiline
                  numberOfLines={3}
                />
              </View>
              
              {error && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {error}
                </Text>
              )}
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  key="cancel-button"
                  style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
                  onPress={onClose}
                  disabled={loading}
                >
                  <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  key="submit-button"
                  style={[
                    styles.button, 
                    styles.submitButton, 
                    { backgroundColor: colors.tint }
                  ]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator key="loading-indicator" size="small" color="#FFFFFF" />
                  ) : (
                    <Text key="submit-text" style={styles.submitButtonText}>
                      {isEdit ? 'Update' : 'Add'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  currentBalanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  currentBalanceLabel: {
    fontSize: 14,
  },
  currentBalanceValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  modeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  modeButtonActive: {
    borderWidth: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  inputHint: {
    fontSize: 12,
    marginBottom: 4,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  reasonInput: {
    height: 80,
    paddingTop: 12,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    marginRight: 8,
    borderWidth: 1,
  },
  submitButton: {
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
}); 