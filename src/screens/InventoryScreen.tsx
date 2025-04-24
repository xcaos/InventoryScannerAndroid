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

interface ScannedItems {
  [key: string]: number;
}

const InventoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [expectedItems, setExpectedItems] = useState<ExpectedItem[]>([]);
  const [scannedItems, setScannedItems] = useState<ScannedItems>({});
  const [isScannerVisible, setScannerVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ExpectedItem | null>(null);

  useEffect(() => {
    loadExpectedItems();
  }, []);

  const loadExpectedItems = async () => {
    try {
      const items = await InventoryListService.getInstance().getExpectedItems();
      setExpectedItems(items);
    } catch (error) {
      Alert.alert('Error', 'Failed to load inventory items');
    }
  };

  const handleBarcodeScan = async (barcode: string) => {
    try {
      const item = await InventoryListService.getInstance().findItemByArticleNumber(barcode);
      if (item) {
        setScannedItems(prev => ({
          ...prev,
          [item.articleNumber]: (prev[item.articleNumber] || 0) + 1
        }));
        setSelectedItem(item);
      } else {
        Alert.alert('Not Found', 'This item is not in the expected inventory');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process scanned item');
    }
  };

  const handleFinishInventory = async () => {
    try {
      const missingItems = await InventoryListService.getInstance().getMissingItems(scannedItems);
      navigation.navigate('MissingItems' as never, { missingItems } as never);
    } catch (error) {
      Alert.alert('Error', 'Failed to process inventory results');
    }
  };

  const renderItem = ({ item }: { item: ExpectedItem }) => {
    const scannedCount = scannedItems[item.articleNumber] || 0;
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

      <FlatList
        data={expectedItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.articleNumber}
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => setScannerVisible(true)}
        android_ripple={{ color: 'rgba(255,255,255,0.3)' }}
      >
        <Text style={styles.scanButtonText}>Scan Barcode</Text>
      </TouchableOpacity>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#2196F3',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  finishButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  listContainer: {
    padding: 15,
  },
  itemContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: 'row',
    elevation: 3,
  },
  itemComplete: {
    backgroundColor: '#E8F5E9',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 15,
  },
  itemArticleNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  quantityContainer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quantityText: {
    fontSize: 14,
    color: '#666666',
  },
  scanButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    margin: 15,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default InventoryScreen; 