/**
 * InventoryScreen Component
 * 
 * The main inventory scanning screen that allows users to:
 * - View expected inventory items
 * - Scan barcodes using the camera
 * - Enter article numbers manually for unreadable barcodes
 * - Track scanning progress
 * - Generate reports of missing items
 * 
 * This screen serves as the primary interface for conducting inventory checks.
 */
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { InventoryListService, ExpectedItem } from '../services/InventoryListService';
import BarcodeScanner from '../components/BarcodeScanner';

/**
 * Interface to track scanned item quantities by article number
 */
interface ScannedItems {
  [key: string]: number; // Maps article numbers to their scanned quantities
}

/**
 * Main inventory screen component for scanning and tracking inventory items
 */
const InventoryScreen: React.FC = () => {
  const navigation = useNavigation();
  // List of items expected in the inventory
  const [expectedItems, setExpectedItems] = useState<ExpectedItem[]>([]);
  // Record of items that have been scanned and their quantities
  const [scannedItems, setScannedItems] = useState<ScannedItems>({});
  // Controls visibility of the barcode scanner
  const [isScannerVisible, setScannerVisible] = useState(false);
  // Currently selected/viewed item
  const [selectedItem, setSelectedItem] = useState<ExpectedItem | null>(null);

  /**
   * Load expected inventory items when the component mounts
   */
  useEffect(() => {
    loadExpectedItems();
  }, []);

  /**
   * Fetches the list of expected inventory items from the service
   */
  const loadExpectedItems = async () => {
    try {
      const items = await InventoryListService.getInstance().getExpectedItems();
      setExpectedItems(items);
    } catch (error) {
      Alert.alert('Error', 'Failed to load inventory items');
    }
  };

  /**
   * Handles a barcode scan event from the scanner
   * Validates the scanned barcode against expected items and updates counts
   * 
   * @param barcode - The scanned barcode or manually entered article number
   */
  const handleBarcodeScan = async (barcode: string) => {
    try {
      // Look up the item using the barcode/article number
      const item = await InventoryListService.getInstance().findItemByArticleNumber(barcode);
      if (item) {
        // Update the scanned count for this item
        setScannedItems(prev => ({
          ...prev,
          [item.articleNumber]: (prev[item.articleNumber] || 0) + 1
        }));
        // Set as the currently selected item (for UI highlighting)
        setSelectedItem(item);
      } else {
        // If the barcode doesn't match any expected item
        Alert.alert('Not Found', 'This item is not in the expected inventory');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process scanned item');
    }
  };

  /**
   * Completes the inventory process and navigates to the missing items screen
   * Generates a report of items that are missing or have quantity discrepancies
   */
  const handleFinishInventory = async () => {
    try {
      // Get list of missing or discrepant items
      const missingItems = await InventoryListService.getInstance().getMissingItems(scannedItems);
      // Navigate to the missing items report screen
      navigation.navigate('MissingItems' as never, { missingItems } as never);
    } catch (error) {
      Alert.alert('Error', 'Failed to process inventory results');
    }
  };

  /**
   * Renders an individual inventory item in the list
   * Shows the item details and current scanning status
   * 
   * @param item - The inventory item to render
   */
  const renderItem = ({ item }: { item: ExpectedItem }) => {
    // Calculate how many of this item have been scanned
    const scannedCount = scannedItems[item.articleNumber] || 0;
    // Determine if we've scanned the expected quantity
    const isComplete = scannedCount >= item.expectedQuantity;

    return (
      <View style={[styles.itemContainer, isComplete && styles.itemComplete]}>
        <Image 
          source={{ uri: `asset:/images/${item.imagePath}.jpg` }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.itemDetails}>
          <Text style={styles.itemArticleNumber}>Article: {item.articleNumber}</Text>
          <Text style={styles.itemDescription}>{item.description}</Text>
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityText}>Expected: {item.expectedQuantity}</Text>
            <Text style={styles.quantityText}>Scanned: {scannedCount}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2196F3" barStyle="light-content" />
      
      {/* Header with title and finish button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inventory Scanner</Text>
        <TouchableOpacity
          style={styles.finishButton}
          onPress={handleFinishInventory}
          android_ripple={{ color: 'rgba(255,255,255,0.3)' }}
        >
          <Text style={styles.finishButtonText}>Finish</Text>
        </TouchableOpacity>
      </View>

      {/* List of expected inventory items with their status */}
      <FlatList
        data={expectedItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.articleNumber}
        contentContainerStyle={styles.listContainer}
      />

      {/* Button to open the barcode scanner */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => setScannerVisible(true)}
        android_ripple={{ color: 'rgba(255,255,255,0.3)' }}
      >
        <Text style={styles.scanButtonText}>Scan Barcode</Text>
      </TouchableOpacity>

      {/* Modal containing the barcode scanner component */}
      <Modal
        visible={isScannerVisible}
        animationType="slide"
        onRequestClose={() => setScannerVisible(false)}
      >
        <BarcodeScanner
          onBarcodeScan={handleBarcodeScan}
          onClose={() => setScannerVisible(false)}
        />
      </Modal>
    </View>
  );
};

/**
 * Styles for the InventoryScreen component
 */
const styles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  // Header bar styling
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#2196F3',
  },
  // Header title text
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Finish inventory button
  finishButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
  },
  // Finish button text
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  // Container for the FlatList
  listContainer: {
    padding: 15,
  },
  // Individual item card styling
  itemContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: 'row',
    elevation: 3,
  },
  // Special styling for items with completed quantity
  itemComplete: {
    backgroundColor: '#E8F5E9', // Light green background
  },
  // Item image thumbnail
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
  // Container for text details of the item
  itemDetails: {
    flex: 1,
    marginLeft: 15,
  },
  // Article number text
  itemArticleNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  // Item description text
  itemDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  // Container for quantity information
  quantityContainer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // Quantity text styling
  quantityText: {
    fontSize: 14,
    color: '#666666',
  },
  // Scan barcode button at bottom of screen
  scanButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    margin: 15,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  // Scan button text
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default InventoryScreen; 