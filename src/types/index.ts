/**
 * Core type definitions for the Inventory Scanner application
 */

/**
 * Represents an inventory list with its metadata and expected items.
 * This serves as the primary data structure for inventory management.
 */
export interface InventoryList {
  id: string;                 // Unique identifier for the inventory list
  name: string;               // Display name of the inventory list
  description: string;        // Detailed description of the inventory's purpose
  items: ExpectedItem[];      // Collection of items expected to be in this inventory
}

/**
 * Represents an item that is expected to be found during inventory scanning.
 * Contains the basic information needed to identify and validate items.
 */
export interface ExpectedItem {
  articleNumber: string;      // Unique product identifier/barcode
  description: string;        // Human-readable description of the item
  expectedQuantity: number;   // How many of this item should be in inventory
  imagePath: string;          // Path to the item's image for visual identification
}

/**
 * Extends ExpectedItem with scan result data to track discrepancies.
 * Used for generating reports and highlighting inventory issues.
 */
export interface MissingItem extends ExpectedItem {
  scannedQuantity: number;    // How many were actually scanned during inventory
  missing: number;            // Calculated difference (expectedQuantity - scannedQuantity)
}

/**
 * Tracks the application's network connectivity state and synchronization status.
 * Used to manage offline/online functionality and data syncing.
 */
export interface NetworkStatus {
  isConnected: boolean;       // Whether the device currently has network connectivity
  lastSyncTimestamp: string | null; // When data was last successfully synced with the server
} 