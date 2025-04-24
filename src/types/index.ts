export interface InventoryList {
  id: string;
  name: string;
  description: string;
  items: ExpectedItem[];
}

export interface ExpectedItem {
  articleNumber: string;
  description: string;
  expectedQuantity: number;
  imagePath: string;
}

export interface MissingItem extends ExpectedItem {
  scannedQuantity: number;
  missing: number;
}

export interface NetworkStatus {
  isConnected: boolean;
  lastSyncTimestamp: string | null;
} 