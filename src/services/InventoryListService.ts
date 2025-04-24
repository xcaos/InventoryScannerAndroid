/**
 * InventoryListService Class
 * 
 * This service handles all operations related to inventory lists, including:
 * - Loading and managing inventory data
 * - Tracking scanned items during inventory checks
 * - Calculating missing or discrepant items
 * - Synchronizing data with a remote server (when connected)
 * 
 * It implements the Singleton pattern to ensure consistent state across the app.
 */
import { InventoryList, ExpectedItem, MissingItem } from '../types';
import { StorageService } from './StorageService';
import NetInfo from '@react-native-community/netinfo';

export class InventoryListService {
  // Singleton instance
  private static instance: InventoryListService;
  // Reference to local storage service
  private storageService: StorageService;
  // Currently active inventory list
  private currentList: InventoryList | null = null;
  // Map to track scanned items and their quantities
  private scannedItems: Map<string, number> = new Map();

  /**
   * Private constructor to enforce the Singleton pattern
   * Initializes the storage service
   */
  private constructor() {
    this.storageService = StorageService.getInstance();
  }

  /**
   * Gets the singleton instance of the service
   * Creates a new instance if one doesn't exist
   * 
   * @returns The InventoryListService singleton instance
   */
  static getInstance(): InventoryListService {
    if (!InventoryListService.instance) {
      InventoryListService.instance = new InventoryListService();
    }
    return InventoryListService.instance;
  }

  /**
   * Loads inventory lists from local storage or remote server
   * Attempts to fetch from remote when connected, falls back to local data
   * 
   * @returns Promise resolving to an array of InventoryList objects
   */
  async loadInventoryLists(): Promise<InventoryList[]> {
    try {
      // Try to fetch from local storage first
      const localLists = await this.storageService.getInventoryLists();
      
      // Check network connectivity
      const networkState = await NetInfo.fetch();
      if (networkState.isConnected) {
        try {
          // TODO: Implement API call to fetch latest lists
          // const remoteLists = await api.fetchInventoryLists();
          // await this.storageService.saveInventoryLists(remoteLists);
          // return remoteLists;
          return localLists;
        } catch (error) {
          console.warn('Failed to fetch remote lists, using local data:', error);
          return localLists;
        }
      }
      
      return localLists;
    } catch (error) {
      console.error('Error loading inventory lists:', error);
      return [];
    }
  }

  /**
   * Sets the current active inventory list and loads its scan state
   * 
   * @param listId - ID of the inventory list to set as active
   */
  async setCurrentList(listId: string): Promise<void> {
    const lists = await this.loadInventoryLists();
    this.currentList = lists.find(list => list.id === listId) || null;
    
    if (this.currentList) {
      // Load previously scanned items for this list
      this.scannedItems = await this.storageService.getScannedItems(listId);
    }
  }

  /**
   * Returns the currently active inventory list
   * 
   * @returns The current inventory list or null if none is set
   */
  getCurrentList(): InventoryList | null {
    return this.currentList;
  }

  /**
   * Records a scanned item in the current inventory
   * Increments the count for the item if it exists in the current list
   * 
   * @param barcode - Article number/barcode of the scanned item
   * @returns True if the item was found and recorded, false otherwise
   */
  async scanItem(barcode: string): Promise<boolean> {
    if (!this.currentList) return false;

    const item = this.currentList.items.find(
      item => item.articleNumber === barcode
    );

    if (item) {
      const currentCount = this.scannedItems.get(barcode) || 0;
      this.scannedItems.set(barcode, currentCount + 1);
      
      // Save scanned items to local storage
      await this.storageService.saveScannedItems(
        this.currentList.id,
        this.scannedItems
      );
      return true;
    }

    return false;
  }

  /**
   * Generates a report of missing or discrepant items
   * Compares expected quantities with actual scanned quantities
   * 
   * @returns Promise resolving to an array of MissingItem objects
   */
  async getMissingItems(): Promise<MissingItem[]> {
    if (!this.currentList) return [];

    const missingItems: MissingItem[] = this.currentList.items.map(item => ({
      ...item,
      scannedQuantity: this.scannedItems.get(item.articleNumber) || 0,
      missing: item.expectedQuantity - (this.scannedItems.get(item.articleNumber) || 0)
    }));

    // Save missing items report to local storage
    await this.storageService.saveMissingItems(this.currentList.id, missingItems);
    return missingItems;
  }

  /**
   * Synchronizes inventory data with the remote server when connected
   * 
   * @returns Promise resolving to true if sync was successful, false otherwise
   */
  async syncWithServer(): Promise<boolean> {
    try {
      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected) return false;

      if (this.currentList) {
        // TODO: Implement API call to sync data
        // await api.syncInventoryData({
        //   listId: this.currentList.id,
        //   scannedItems: Object.fromEntries(this.scannedItems),
        //   timestamp: new Date().toISOString()
        // });

        await this.storageService.updateLastSyncTimestamp();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error syncing with server:', error);
      return false;
    }
  }

  /**
   * Retrieves the timestamp of the last successful sync with the server
   * 
   * @returns Promise resolving to timestamp string or null if never synced
   */
  async getLastSyncTimestamp(): Promise<string | null> {
    return await this.storageService.getLastSyncTimestamp();
  }

  /**
   * Clears all scanning data for the current inventory list
   * Used when restarting an inventory check
   */
  async clearCurrentListData(): Promise<void> {
    if (this.currentList) {
      this.scannedItems.clear();
      await this.storageService.saveScannedItems(this.currentList.id, new Map());
      await this.storageService.saveMissingItems(this.currentList.id, []);
    }
  }
} 