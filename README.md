# Inventory Scanner Android.

A React Native application for managing and tracking inventory through barcode scanning. This app helps warehouse staff perform inventory checks by scanning items and comparing them against expected quantities.

## Features

- **Multiple Inventory Lists**: Support for managing different warehouse inventories
- **Barcode Scanning**: Real-time barcode scanning using device camera
- **Manual Article Entry**: Alternative input method for unreadable barcodes
- **Item Tracking**: Track scanned items against expected quantities
- **Missing Items Report**: Generate reports of missing or understocked items
- **Visual Feedback**: Image previews and color-coded status indicators
- **Offline Support**: Full functionality without internet connectivity
- **Data Synchronization**: Automatic sync when connection is restored

## Prerequisites

- Node.js (v14 or higher)
- React Native development environment
- Android Studio
- Android SDK
- JDK 11 or higher

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Install required native modules:
```bash
npm install react-native-vision-camera vision-camera-code-scanner react-native-reanimated @react-native-async-storage/async-storage @react-native-community/netinfo
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Application screens
├── services/           # Business logic and data services
│   ├── StorageService.ts    # Offline data persistence
│   └── InventoryListService.ts # Inventory management
├── config/            # Configuration files
└── types/             # TypeScript type definitions
```

## Key Components

### Screens

1. **InventoryListScreen**
   - Displays and selects inventory lists
   - Shows item count for each list
   - Works offline with locally stored lists

2. **InventoryScreen**
   - Main scanning interface
   - Displays expected items and quantities
   - Real-time scanning functionality
   - Manual article number input option
   - Saves scanned items locally

3. **MissingItemsScreen**
   - Shows items with quantity discrepancies
   - Displays expected vs. scanned quantities
   - Generates offline reports

### Services

**InventoryListService**
- Manages inventory data
- Handles barcode lookup
- Calculates missing items
- Supports offline operation
- Syncs data when online

**StorageService**
- Handles local data persistence
- Manages offline storage
- Provides data access methods
- Maintains sync status

### Components

**BarcodeScanner**
- Real-time barcode scanning
- Camera permission handling
- Manual input option for unreadable barcodes
- Visual scanning guide
- Supports all common barcode formats

**ManualInputModal**
- Numeric keypad for article numbers
- Input validation
- Keyboard-optimized interface
- Seamless integration with scanning workflow

## Data Models

```typescript
interface InventoryList {
  id: string;
  name: string;
  description: string;
  items: ExpectedItem[];
}

interface ExpectedItem {
  articleNumber: string;
  description: string;
  expectedQuantity: number;
  imagePath: string;
}

interface MissingItem extends ExpectedItem {
  scannedQuantity: number;
  missing: number;
}
```

## Development

1. Start Metro bundler:
```bash
npm start
```

2. Run on Android:
```bash
npm run android
```

## Configuration

The app uses:
- `tsconfig.json`: TypeScript configuration
- `babel.config.js`: Babel configuration
- `inventory-lists.json`: Inventory data

## Offline Support

The app provides full offline functionality:

1. **Data Storage**
   - Inventory lists are cached locally
   - Scanned items are saved to device storage
   - Missing items reports are stored offline

2. **Sync Mechanism**
   - Automatic sync when connection is restored
   - Background sync for pending changes
   - Conflict resolution for concurrent updates

3. **Network Status**
   - Real-time connectivity monitoring
   - Visual indicators for offline mode
   - Sync status tracking

## Best Practices

- Keep inventory lists updated when online
- Ensure proper lighting for scanning
- Use manual input when barcodes are damaged
- Regular missing items checks
- Update item images as needed
- Sync data when connection is available

## Future Enhancements

- Cloud synchronization
- Multiple barcode formats
- Export reports
- User authentication
- Real-time collaboration
- Conflict resolution improvements 