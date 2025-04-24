/**
 * BarcodeScanner Component
 * 
 * This component provides a camera-based barcode scanning interface with a 
 * manual input fallback option. It uses the device camera to detect and decode
 * barcodes in real-time, while also giving users the ability to manually enter
 * article numbers for items with damaged or unreadable barcodes.
 */
import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Camera, useCameraDevices, useFrameProcessor } from 'react-native-vision-camera';
import { scanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';
import { runOnJS } from 'react-native-reanimated';
import ManualInputModal from './ManualInputModal';

/**
 * Props interface for the BarcodeScanner component
 */
interface BarcodeScannerProps {
  onBarcodeScanned: (barcode: string) => void; // Callback when a barcode is successfully scanned or entered manually
  onClose: () => void;                        // Callback to close/dismiss the scanner
}

/**
 * Camera-based barcode scanner with manual input option
 */
const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onBarcodeScanned, onClose }) => {
  // State to track camera permission status
  const [hasPermission, setHasPermission] = useState(false);
  // State to control the visibility of the manual input modal
  const [showManualInput, setShowManualInput] = useState(false);
  // Get available camera devices using Vision Camera hooks
  const devices = useCameraDevices();
  // Use the back camera for barcode scanning
  const device = devices.back;

  // Request camera permission when component mounts
  React.useEffect(() => {
    checkPermission();
  }, []);

  /**
   * Requests camera permission from the user
   */
  const checkPermission = async () => {
    const status = await Camera.requestCameraPermission();
    setHasPermission(status === 'authorized');
  };

  /**
   * Frame processor to analyze camera frames for barcodes
   * Uses the vision-camera-code-scanner plugin to detect barcodes in real-time
   */
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    // Scan the current frame for any barcodes
    const detectedBarcodes = scanBarcodes(frame, [BarcodeFormat.ALL_FORMATS]);
    // If a barcode is detected, invoke the callback with the barcode value
    if (detectedBarcodes.length > 0 && detectedBarcodes[0].displayValue) {
      runOnJS(onBarcodeScanned)(detectedBarcodes[0].displayValue);
    }
  }, []);

  /**
   * Handles manual input of article numbers when the barcode can't be scanned
   * @param articleNumber - The manually entered article number
   */
  const handleManualInput = (articleNumber: string) => {
    onBarcodeScanned(articleNumber);
  };

  // Render message if camera permission is not granted
  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No camera permission</Text>
      </View>
    );
  }

  // Render loading state while camera is initializing
  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera component for barcode scanning */}
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={5} // Process 5 frames per second to balance performance and accuracy
      />
      
      {/* Overlay with scan area indicator */}
      <View style={styles.overlay}>
        <View style={styles.scanArea} />
      </View>
      
      {/* Controls for closing the scanner and accessing manual input */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.manualButton}
          onPress={() => setShowManualInput(true)}
        >
          <Text style={styles.buttonText}>Manual Input</Text>
        </TouchableOpacity>
      </View>

      {/* Manual input modal for entering article numbers when barcodes can't be scanned */}
      <ManualInputModal
        visible={showManualInput}
        onClose={() => setShowManualInput(false)}
        onSubmit={handleManualInput}
      />
    </View>
  );
};

// Get device width for calculating scan area size
const { width } = Dimensions.get('window');
// Define the scan area as 70% of the screen width
const scanAreaSize = width * 0.7;

/**
 * Styles for the BarcodeScanner component
 */
const styles = StyleSheet.create({
  // Main container for the scanner
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  // Text styling for messages (loading, no permission)
  text: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  // Semi-transparent overlay on top of the camera
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Visible square highlighting the optimal scanning area
  scanArea: {
    width: scanAreaSize,
    height: scanAreaSize,
    borderWidth: 2,
    borderColor: '#FFF',
    backgroundColor: 'transparent',
  },
  // Container for action buttons
  buttonContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    flexDirection: 'row',
  },
  // Close button styling
  closeButton: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 5,
    marginRight: 10,
  },
  // Manual input button styling
  manualButton: {
    padding: 10,
    backgroundColor: 'rgba(33,150,243,0.8)',
    borderRadius: 5,
  },
  // Text styling for buttons
  buttonText: {
    color: '#FFF',
    fontSize: 16,
  },
});

export default BarcodeScanner; 