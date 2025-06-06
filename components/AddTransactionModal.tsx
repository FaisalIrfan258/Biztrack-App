import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme
} from 'react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { createTransaction } from '../services/api/transactionService';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const paidByOptions = ['Ahmed', 'Faisal', 'Wasey', 'Company', 'Others'] as const;
type PaidByOption = typeof paidByOptions[number];

const categoryOptions = ['Food', 'Transport', 'Utilities', 'Rent', 'Supplies', 'Salary', 'Other'];

export default function AddTransactionModal({
  visible,
  onClose,
  onSuccess
}: AddTransactionModalProps) {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const { token } = useAuth();
  
  // Form state
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [category, setCategory] = useState('');
  const [paidBy, setPaidBy] = useState<PaidByOption>('Ahmed');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showPaidByDropdown, setShowPaidByDropdown] = useState(false);
  
  const resetForm = () => {
    setAmount('');
    setPurpose('');
    setCategory('');
    setPaidBy('Ahmed');
    setDate(new Date());
    setReceiptImage(null);
    setError(null);
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Permission to access media library is required!');
        return null;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets?.[0]?.uri) {
        const selectedAsset = result.assets[0];
        setReceiptImage(selectedAsset.uri);
        return selectedAsset;
      }
    } catch (err) {
      console.error('Error picking image:', err);
      setError('Failed to select image');
    }
    return null;
  };
  
  const handleSubmit = async () => {
    try {
      setError(null);
      
      // Validate form
      if (!amount || isNaN(parseFloat(amount))) {
        setError('Please enter a valid amount');
        return;
      }
      
      if (!purpose) {
        setError('Please enter a purpose');
        return;
      }
      
      if (!category) {
        setError('Please select a category');
        return;
      }
      
      if (!token) {
        setError('Authentication token not found');
        return;
      }
      
      setLoading(true);
      
      // Prepare receipt file if selected
      let receiptAsset = null;
      if (receiptImage) {
        // Get the file info from the image URI
        const fileName = receiptImage.split('/').pop() || `receipt_${Date.now()}.jpg`;
        const fileType = 'image/jpeg';
        
        receiptAsset = {
          uri: receiptImage,
          name: fileName,
          type: fileType,
        };
      }
      
      // Create transaction
      const response = await createTransaction(
        token,
        {
          amount: parseFloat(amount),
          date: date.toISOString(),
          category,
          purpose,
          paidBy,
        },
        receiptAsset ? [receiptAsset] : undefined
      );
      
      if (response.success) {
        resetForm();
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Failed to create transaction');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create transaction');
      console.error('Create transaction error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Transaction</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.formContainer}>
            {/* Amount Input */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Amount*</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.currencySymbol, { color: colors.muted }]}>Rs</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="0.00"
                  placeholderTextColor={colors.muted}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>
            </View>
            
            {/* Purpose Input */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Purpose*</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
                placeholder="Enter purpose"
                placeholderTextColor={colors.muted}
                value={purpose}
                onChangeText={setPurpose}
              />
            </View>
            
            {/* Category Dropdown */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Category*</Text>
              <TouchableOpacity
                style={[styles.dropdown, { backgroundColor: colors.background }]}
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <Text style={[styles.dropdownText, { color: category ? colors.text : colors.muted }]}>
                  {category || 'Select category'}
                </Text>
                <Ionicons
                  name={showCategoryDropdown ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.muted}
                />
              </TouchableOpacity>
              
              {showCategoryDropdown && (
                <View style={[styles.dropdownOptions, { backgroundColor: colors.background }]}>
                  {categoryOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={styles.dropdownOption}
                      onPress={() => {
                        setCategory(option);
                        setShowCategoryDropdown(false);
                      }}
                    >
                      <Text style={[styles.dropdownOptionText, { color: colors.text }]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            
            {/* Paid By Dropdown */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Paid By*</Text>
              <TouchableOpacity
                style={[styles.dropdown, { backgroundColor: colors.background }]}
                onPress={() => setShowPaidByDropdown(!showPaidByDropdown)}
              >
                <Text style={[styles.dropdownText, { color: colors.text }]}>
                  {paidBy}
                </Text>
                <Ionicons
                  name={showPaidByDropdown ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.muted}
                />
              </TouchableOpacity>
              
              {showPaidByDropdown && (
                <View style={[styles.dropdownOptions, { backgroundColor: colors.background }]}>
                  {paidByOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={styles.dropdownOption}
                      onPress={() => {
                        setPaidBy(option);
                        setShowPaidByDropdown(false);
                      }}
                    >
                      <Text style={[styles.dropdownOptionText, { color: colors.text }]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            
            {/* Date Picker */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Date</Text>
              <TouchableOpacity
                style={[styles.datePicker, { backgroundColor: colors.background }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[styles.dateText, { color: colors.text }]}>
                  {format(date, 'MMMM dd, yyyy')}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={colors.muted} />
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>
            
            {/* Receipt Image */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Receipt (Optional)</Text>
              <TouchableOpacity
                style={[styles.imagePickerButton, { backgroundColor: colors.background }]}
                onPress={pickImage}
              >
                {receiptImage ? (
                  <Image source={{ uri: receiptImage }} style={styles.receiptPreview} />
                ) : (
                  <View style={styles.imagePickerContent}>
                    <Ionicons name="camera-outline" size={24} color={colors.muted} />
                    <Text style={[styles.imagePickerText, { color: colors.muted }]}>
                      Upload Receipt
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              
              {receiptImage && (
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => setReceiptImage(null)}
                >
                  <Text style={[styles.removeImageText, { color: colors.error }]}>
                    Remove Image
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            {/* Error Message */}
            {error && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {error}
              </Text>
            )}
            
            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.tint }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Add Transaction</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
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
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 16,
    marginRight: 4,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  textInput: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  dropdown: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
  },
  dropdownOptions: {
    marginTop: 4,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000,
  },
  dropdownOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  dropdownOptionText: {
    fontSize: 16,
  },
  datePicker: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
  },
  imagePickerButton: {
    height: 120,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imagePickerContent: {
    alignItems: 'center',
  },
  imagePickerText: {
    marginTop: 8,
    fontSize: 14,
  },
  receiptPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    padding: 4,
  },
  removeImageText: {
    fontSize: 14,
  },
  errorText: {
    marginBottom: 16,
    fontSize: 14,
  },
  submitButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 