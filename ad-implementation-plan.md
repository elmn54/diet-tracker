# Ad Implementation Plan for Free Users

## Overview
- Free users will see a full-screen ad after every 2 entries
- Watching the complete ad gives users 2 more free entries
- Using react-native-google-mobile-ads for implementation

## Implementation Steps

### 1. User Type Management
- Create/update user store to track free vs premium users
- Add a flag in user profile or local storage

### 2. Entry Counter System
- Create a counter in the app state (using zustand)
- Track how many entries a free user has made
- Reset counter when premium user or after watching an ad

### 3. Ad Integration
- Set up react-native-google-mobile-ads
- Configure test and production ad unit IDs
- Create an AdService for centralized ad management

### 4. Ad Display Logic
- Create a hook to manage when to show ads
- Trigger full-screen interstitial ads after 2 entries for free users
- Implement ad event listeners to detect when an ad is fully watched

### 5. Ad Reward System
- When ad is completed, reset the entry counter
- Show feedback to user that they received more free entries

### 6. UI Integration
- Add loading states while ads are being fetched
- Create user-friendly messages about the ad system

### 7. Testing
- Test with test ad IDs
- Verify counter logic works correctly
- Ensure ads show at the right time

### 8. Analytics (Optional)
- Track ad impressions and completions
- Monitor user behavior around ads

## Technical Components

### Zustand Store Updates
```typescript
// Example structure
interface AdStore {
  entryCount: number;
  incrementEntryCount: () => void;
  resetEntryCount: () => void;
  shouldShowAd: () => boolean;
}
```

### Ad Service
```typescript
// Example structure
class AdService {
  initialize();
  loadInterstitialAd();
  showInterstitialAd(): Promise<boolean>; // Returns whether ad was fully watched
}
```

### Ad Hook
```typescript
// Example usage
const { showAdIfNeeded, entryCount, incrementEntry } = useAdManager();
``` 