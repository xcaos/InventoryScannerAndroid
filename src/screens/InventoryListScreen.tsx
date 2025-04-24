import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import InventoryListService, { InventoryList } from '../services/InventoryListService';

const InventoryListScreen: React.FC = () => {
  const navigation = useNavigation();
  const inventoryLists = InventoryListService.getAllLists();

  const handleListSelect = (list: InventoryList) => {
    InventoryListService.setCurrentList(list.id);
    navigation.navigate('Inventory' as never);
  };

  const renderItem = ({ item }: { item: InventoryList }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => handleListSelect(item)}
      android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
    >
      <View>
        <Text style={styles.listName}>{item.name}</Text>
        <Text style={styles.listDescription}>{item.description}</Text>
        <Text style={styles.itemCount}>
          {item.items.length} items to check
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2196F3" barStyle="light-content" />
      <Text style={styles.header}>Select Inventory List</Text>
      <FlatList
        data={inventoryLists}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
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
  listItem: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 3,
  },
  listName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    color: '#000000',
  },
  listDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 10,
  },
  itemCount: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
});

export default InventoryListScreen; 