import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSubscriptionStore } from './subscriptionStore';
import adService from '../services/adService';

export interface AdStoreState {
  // Ücretsiz kullanıcı için giriş sayacı
  entryCount: number;
  
  // Giriş sayacını artırır ve gerekirse reklam gösterir
  incrementEntryCount: () => Promise<void>;
  
  // Giriş sayacını sıfırlar (reklam tamamlandığında veya ücretli kullanıcı olduğunda)
  resetEntryCount: () => void;
  
  // Reklam gösterilmeli mi kontrolü
  shouldShowAd: () => boolean;
  
  // Reklam gösterme işlemini gerçekleştirir
  showAd: () => Promise<boolean>;
  
  // Kalan kullanım hakkını döndürür
  getRemainingUses: () => number;
}

// Free kullanıcı için maksimum izin verilen giriş sayısı
const MAX_FREE_ENTRIES = 2;

export const useAdStore = create<AdStoreState>()(
  persist(
    (set, get) => ({
      entryCount: 0,
      
      incrementEntryCount: async () => {
        // Ücretli kullanıcılar için sayacı artırmaya gerek yok
        const isAdFree = useSubscriptionStore.getState().isFeatureAvailable('isAdFree');
        if (isAdFree) return;
        
        // Giriş sayacını artır
        const newCount = get().entryCount + 1;
        set({ entryCount: newCount });
        
        // Eğer limit aşıldıysa reklam göster
        if (newCount >= MAX_FREE_ENTRIES) {
          await get().showAd();
        }
      },
      
      resetEntryCount: () => {
        set({ entryCount: 0 });
      },
      
      shouldShowAd: () => {
        // Ücretli kullanıcılar için reklam gösterme
        const isAdFree = useSubscriptionStore.getState().isFeatureAvailable('isAdFree');
        if (isAdFree) return false;
        
        // Ücretsiz kullanıcılar için giriş sayısına bak
        return get().entryCount >= MAX_FREE_ENTRIES;
      },
      
      showAd: async () => {
        // Reklam gösterme işlemi
        const wasAdWatched = await adService.showInterstitialAd();
        
        // Reklam tamamlandıysa sayacı sıfırla (2 yeni kullanım hakkı ver)
        if (wasAdWatched) {
          get().resetEntryCount();
        }
        
        return wasAdWatched;
      },
      
      getRemainingUses: () => {
        // Ücretli kullanıcılar için sınırsız kullanım
        const isAdFree = useSubscriptionStore.getState().isFeatureAvailable('isAdFree');
        if (isAdFree) return Infinity;
        
        // Ücretsiz kullanıcılar için kalan kullanım hakkını hesapla
        return Math.max(0, MAX_FREE_ENTRIES - get().entryCount);
      }
    }),
    {
      name: 'diet-tracker-ad-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 