import AsyncStorage from '@react-native-async-storage/async-storage';
import { InventoryList, ExpectedItem, MissingItem } from '../types';

const STORAGE_KEYS = {
  INVENTORY_LISTS: 'inventory_lists',
  SCANNED_ITEMS: 'scanned_items',
  MISSING_ITEMS: 'missing_items',
  LAST_SYNC: 'last_sync',
};

export class StorageService {
  private static instance: StorageService;

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async saveInventoryLists(lists: InventoryList[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.INVENTORY_LISTS, JSON.stringify(lists));
    } catch (error) {
      console.error('Error saving inventory lists:', error);
      throw error;
    }
  }

  async getInventoryLists(): Promise<InventoryList[]> {
    try {
      const lists = await AsyncStorage.getItem(STORAGE_KEYS.INVENTORY_LISTS);
      return lists ? JSON.parse(lists) : [];
    } catch (error) {
      console.error('Error getting inventory lists:', error);
      return [];
    }
  }

  async saveScannedItems(listId: string, items: Map<string, number>): Promise<void> {
    try {
      const key = `${STORAGE_KEYS.SCANNED_ITEMS}_${listId}`;
      await AsyncStorage.setItem(key, JSON.stringify(Object.fromEntries(items)));
    } catch (error) {
      console.error('Error saving scanned items:', error);
      throw error;
    }
  }

  async getScannedItems(listId: string): Promise<Map<string, number>> {
    try {
      const key = `${STORAGE_KEYS.SCANNED_ITEMS}_${listId}`;
      const items = await AsyncStorage.getItem(key);
      return items ? new Map(Object.entries(JSON.parse(items))) : new Map();
    } catch (error) {
      console.error('Error getting scanned items:', error);
      return new Map();
    }
  }

  async saveMissingItems(listId: string, items: MissingItem[]): Promise<void> {
    try {
      const key = `${STORAGE_KEYS.MISSING_ITEMS}_${listId}`;
      await AsyncStorage.setItem(key, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving missing items:', error);
      throw error;
    }
  }

  async getMissingItems(listId: string): Promise<MissingItem[]> {
    try {
      const key = `${STORAGE_KEYS.MISSING_ITEMS}_${listId}`;
      const items = await AsyncStorage.getItem(key);
      return items ? JSON.parse(items) : [];
    } catch (error) {
      console.error('Error getting missing items:', error);
      return [];
    }
  }

  async updateLastSyncTimestamp(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (error) {
      console.error('Error updating last sync timestamp:', error);
      throw error;
    }
  }

  async getLastSyncTimestamp(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    } catch (error) {
      console.error('Error getting last sync timestamp:', error);
      return null;
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
} 