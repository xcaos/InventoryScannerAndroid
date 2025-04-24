import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MissingItem } from '../services/InventoryListService';

interface MissingItemsScreenProps {
  route: {
    params: {
      missingItems: MissingItem[];
    };
  };
}

const MissingItemsScreen: React.FC<MissingItemsScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { missingItems } = route.params;

  const renderItem = ({ item }: { item: MissingItem }) => (
    <View style={styles.itemContainer}>
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
          <Text style={styles.quantityText}>Scanned: {item.scannedQuantity}</Text>
          <Text style={styles.missingText}>Missing: {item.missing}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2196F3" barStyle="light-content" />
      <Text style={styles.header}>Missing Items</Text>
      {missingItems.length > 0 ? (
        <FlatList
          data={missingItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.articleNumber}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No missing items found!</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => navigation.navigate('InventoryList' as never)}
        android_ripple={{ color: 'rgba(255,255,255,0.3)' }}
      >
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 20,
    color: '#2196F3',
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
  },
  quantityText: {
    fontSize: 14,
    color: '#666666',
  },
  missingText: {
    fontSize: 14,
    color: '#FF5252',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666666',
  },
  doneButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    margin: 15,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MissingItemsScreen; 