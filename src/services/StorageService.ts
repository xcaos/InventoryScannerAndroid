/**
 * StorageService Class
 * 
 * This service handles all persistent data storage operations using AsyncStorage.
 * It provides methods for saving and retrieving:
 * - Inventory lists
 * - Scanned items and their quantities
 * - Missing items reports
 * - Synchronization timestamps
 * 
 * It implements the Singleton pattern to ensure consistent state across the app.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InventoryList, ExpectedItem, MissingItem } from '../types';

/**
 * Storage key constants to ensure consistent key naming across the app
 */
const STORAGE_KEYS = {
  INVENTORY_LISTS: 'inventory_lists',   // For storing all inventory lists
  SCANNED_ITEMS: 'scanned_items',       // Base key for scanned items (appended with list ID)
  MISSING_ITEMS: 'missing_items',       // Base key for missing items reports (appended with list ID)
  LAST_SYNC: 'last_sync',               // For tracking last server sync timestamp
};

export class StorageService {
  // Singleton instance
  private static instance: StorageService;

  /**
   * Private constructor to enforce the Singleton pattern
   */
  private constructor() {}

  /**
   * Gets the singleton instance of the service
   * Creates a new instance if one doesn't exist
   * 
   * @returns The StorageService singleton instance
   */
  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Saves inventory lists to persistent storage
   * 
   * @param lists - Array of inventory lists to store
   */
  async saveInventoryLists(lists: InventoryList[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.INVENTORY_LISTS, JSON.stringify(lists));
    } catch (error) {
      console.error('Error saving inventory lists:', error);
      throw error;
    }
  }

  /**
   * Retrieves all inventory lists from persistent storage
   * 
   * @returns Promise resolving to array of inventory lists, or empty array if none
   */
  async getInventoryLists(): Promise<InventoryList[]> {
    try {
      const lists = await AsyncStorage.getItem(STORAGE_KEYS.INVENTORY_LISTS);
      return lists ? JSON.parse(lists) : [];
    } catch (error) {
      console.error('Error getting inventory lists:', error);
      return [];
    }
  }

  /**
   * Saves scanned items for a specific inventory list
   * 
   * @param listId - ID of the inventory list the items belong to
   * @param items - Map of article numbers to scan counts
   */
  async saveScannedItems(listId: string, items: Map<string, number>): Promise<void> {
    try {
      const key = `${STORAGE_KEYS.SCANNED_ITEMS}_${listId}`;
      // Convert Map to plain object for JSON serialization
      await AsyncStorage.setItem(key, JSON.stringify(Object.fromEntries(items)));
    } catch (error) {
      console.error('Error saving scanned items:', error);
      throw error;
    }
  }

  /**
   * Retrieves scanned items for a specific inventory list
   * 
   * @param listId - ID of the inventory list to get scanned items for
   * @returns Promise resolving to Map of article numbers to scan counts
   */
  async getScannedItems(listId: string): Promise<Map<string, number>> {
    try {
      const key = `${STORAGE_KEYS.SCANNED_ITEMS}_${listId}`;
      const items = await AsyncStorage.getItem(key);
      // Convert from plain object back to Map
      return items ? new Map(Object.entries(JSON.parse(items))) : new Map();
    } catch (error) {
      console.error('Error getting scanned items:', error);
      return new Map();
    }
  }

  /**
   * Saves missing items report for a specific inventory list
   * 
   * @param listId - ID of the inventory list the missing items belong to
   * @param items - Array of missing items with their quantities
   */
  async saveMissingItems(listId: string, items: MissingItem[]): Promise<void> {
    try {
      const key = `${STORAGE_KEYS.MISSING_ITEMS}_${listId}`;
      await AsyncStorage.setItem(key, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving missing items:', error);
      throw error;
    }
  }

  /**
   * Retrieves missing items report for a specific inventory list
   * 
   * @param listId - ID of the inventory list to get missing items for
   * @returns Promise resolving to array of missing items
   */
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

  /**
   * Updates the timestamp of last successful synchronization with server
   * Stores current date/time as ISO string
   */
  async updateLastSyncTimestamp(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (error) {
      console.error('Error updating last sync timestamp:', error);
      throw error;
    }
  }

  /**
   * Retrieves the timestamp of last successful synchronization
   * 
   * @returns Promise resolving to ISO timestamp string or null if never synced
   */
  async getLastSyncTimestamp(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    } catch (error) {
      console.error('Error getting last sync timestamp:', error);
      return null;
    }
  }

  /**
   * Clears all app data from persistent storage
   * Use with caution - this will delete all saved data
   */
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
} 