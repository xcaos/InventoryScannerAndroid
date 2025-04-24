import { InventoryList, ExpectedItem, MissingItem } from '../types';
import { StorageService } from './StorageService';
import NetInfo from '@react-native-community/netinfo';

export class InventoryListService {
  private static instance: InventoryListService;
  private storageService: StorageService;
  private currentList: InventoryList | null = null;
  private scannedItems: Map<string, number> = new Map();

  private constructor() {
    this.storageService = StorageService.getInstance();
  }

  static getInstance(): InventoryListService {
    if (!InventoryListService.instance) {
      InventoryListService.instance = new InventoryListService();
    }
    return InventoryListService.instance;
  }

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

  async setCurrentList(listId: string): Promise<void> {
    const lists = await this.loadInventoryLists();
    this.currentList = lists.find(list => list.id === listId) || null;
    
    if (this.currentList) {
      // Load previously scanned items for this list
      this.scannedItems = await this.storageService.getScannedItems(listId);
    }
  }

  getCurrentList(): InventoryList | null {
    return this.currentList;
  }

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

  async getLastSyncTimestamp(): Promise<string | null> {
    return await this.storageService.getLastSyncTimestamp();
  }

  async clearCurrentListData(): Promise<void> {
    if (this.currentList) {
      this.scannedItems.clear();
      await this.storageService.saveScannedItems(this.currentList.id, new Map());
      await this.storageService.saveMissingItems(this.currentList.id, []);
    }
  }
} 