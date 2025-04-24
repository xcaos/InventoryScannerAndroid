/**
 * ManualInputModal Component
 * 
 * A modal dialog that allows users to manually enter article/barcode numbers
 * when the scanner cannot read a barcode properly. This enhances the app's
 * usability by providing an alternative input method for damaged or poorly
 * printed barcodes.
 */
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

/**
 * Props for the ManualInputModal component
 */
interface ManualInputModalProps {
  visible: boolean;            // Controls the visibility of the modal
  onClose: () => void;         // Callback function when the modal is closed/cancelled
  onSubmit: (articleNumber: string) => void; // Callback function when an article number is submitted
}

/**
 * Modal component that provides a form for manual barcode/article number entry
 */
const ManualInputModal: React.FC<ManualInputModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  // State to track the user input for article number
  const [articleNumber, setArticleNumber] = useState('');

  /**
   * Handles the submission of the article number
   * Validates that input is not empty before calling the onSubmit callback
   */
  const handleSubmit = () => {
    if (articleNumber.trim()) {
      onSubmit(articleNumber.trim());
      setArticleNumber(''); // Reset the input field after submission
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose} // Handle Android back button
    >
      {/* KeyboardAvoidingView ensures the keyboard doesn't cover the input field */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Text style={styles.title}>Enter Article Number</Text>
          <TextInput
            style={styles.input}
            value={articleNumber}
            onChangeText={setArticleNumber}
            placeholder="Enter article number"
            keyboardType="numeric" // Display numeric keyboard for article numbers
            autoFocus              // Automatically focus the input when modal appears
            returnKeyType="done"   // Show "done" button on keyboard
            onSubmitEditing={handleSubmit} // Allow submission via keyboard "done" button
          />
          <View style={styles.buttonContainer}>
            {/* Cancel button to dismiss the modal */}
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            {/* Submit button to process the entered article number */}
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

/**
 * Styles for the ManualInputModal component
 */
const styles = StyleSheet.create({
  // Semi-transparent background for the modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark semi-transparent overlay
  },
  // Container for the actual modal content
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 400, // Limit maximum width on larger screens
  },
  // Modal title styling
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  // Text input field styling
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  // Container for the action buttons
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // Base button styling
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  // Cancel button specific styling (red color)
  cancelButton: {
    backgroundColor: '#ff6b6b',
  },
  // Submit button specific styling (blue color)
  submitButton: {
    backgroundColor: '#2196F3',
  },
  // Text inside buttons
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ManualInputModal; 