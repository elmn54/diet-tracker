import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage anahtarları
const SUBSCRIPTION_PLAN_KEY = 'subscription_plan';
const IS_SUBSCRIBED_KEY = 'is_subscribed';

// Abonelik planı türü
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  requestLimit?: number; // Aylık AI istek limiti
  imageRecognitionEnabled: boolean; // Görüntü tanıma özelliği etkin mi
  advancedStatsEnabled: boolean; // Gelişmiş istatistikler
}

// Abonelik store tipi
interface SubscriptionState {
  plans: SubscriptionPlan[];
  selectedPlan: string; // Plan ID
  isSubscribed: boolean;
  isTrialActive: boolean;
  trialEndDate: string | null;
  
  // Eylemler
  selectPlan: (planId: string) => void;
  subscribe: () => Promise<boolean>;
  cancelSubscription: () => Promise<void>;
  setSubscribed: (isSubscribed: boolean) => Promise<void>;
  startTrial: () => Promise<void>;
  getRemainingTrialDays: () => number;
  isPlanFeatureAvailable: (featureKey: string) => boolean;
  getRemainingRequests: () => number;
  reset: () => Promise<void>;
}

// Varsayılan abonelik planları
const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Temel',
    price: 39.99,
    features: [
      'Reklamsız deneyim',
      'Günlük kalori takibi',
      'Temel besin değerleri',
      'Haftalık özet'
    ],
    requestLimit: 5,
    imageRecognitionEnabled: false,
    advancedStatsEnabled: false
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 164.99,
    features: [
      'Reklamsız deneyim',
      'Bulut yedekleme',
      'Birden fazla cihaz senkronizasyonu',
      'Sınırsız yemek takibi',
      'Detaylı besin analizleri',
      'Hedef takibi',
      '7/24 öncelikli destek'
    ],
    requestLimit: 20,
    imageRecognitionEnabled: true,
    advancedStatsEnabled: true
  }
];

// Abonelik mağazası
export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  // Başlangıç değerleri
  plans: DEFAULT_PLANS,
  selectedPlan: 'basic',
  isSubscribed: false,
  isTrialActive: false,
  trialEndDate: null,
  
  // Plan seç
  selectPlan: (planId: string) => {
    // Planın var olduğunu doğrula
    const planExists = get().plans.some(plan => plan.id === planId);
    if (planExists) {
      set({ selectedPlan: planId });
      AsyncStorage.setItem(SUBSCRIPTION_PLAN_KEY, planId);
    }
  },
  
  // Abonelik başlat (Ödeme entegrasyonu burada yapılacak)
  subscribe: async (): Promise<boolean> => {
    try {
      // Gerçek bir uygulamada burada ödeme işlemi yapılır
      // Bu örnek için sadece abonelik durumunu güncelliyoruz
      await AsyncStorage.setItem(IS_SUBSCRIBED_KEY, 'true');
      set({ isSubscribed: true });
      return true;
    } catch (error) {
      console.error('Abonelik başlatılırken hata oluştu:', error);
      return false;
    }
  },
  
  // Aboneliği iptal et
  cancelSubscription: async () => {
    try {
      await AsyncStorage.setItem(IS_SUBSCRIBED_KEY, 'false');
      set({ isSubscribed: false });
    } catch (error) {
      console.error('Abonelik iptal edilirken hata oluştu:', error);
    }
  },
  
  // Abonelik durumunu ayarla (test veya harici entegrasyon için)
  setSubscribed: async (isSubscribed: boolean) => {
    try {
      await AsyncStorage.setItem(IS_SUBSCRIBED_KEY, isSubscribed ? 'true' : 'false');
      set({ isSubscribed });
    } catch (error) {
      console.error('Abonelik durumu güncellenirken hata oluştu:', error);
    }
  },
  
  // Deneme sürümünü başlat
  startTrial: async () => {
    try {
      const trialDays = 7; // 7 günlük deneme
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + trialDays);
      
      await AsyncStorage.setItem('trial_end_date', endDate.toISOString());
      set({ 
        isTrialActive: true,
        trialEndDate: endDate.toISOString()
      });
    } catch (error) {
      console.error('Deneme sürümü başlatılırken hata oluştu:', error);
    }
  },
  
  // Kalan deneme gün sayısını hesapla
  getRemainingTrialDays: () => {
    const { trialEndDate, isTrialActive } = get();
    
    if (!isTrialActive || !trialEndDate) {
      return 0;
    }
    
    const now = new Date();
    const end = new Date(trialEndDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  },
  
  // Belirli bir özelliğin kullanılabilir olup olmadığını kontrol et
  isPlanFeatureAvailable: (featureKey: string) => {
    const { plans, selectedPlan, isSubscribed, isTrialActive } = get();
    
    // Özellik erişimi için abonelik veya deneme sürümü aktif olmalı
    if (!isSubscribed && !isTrialActive) {
      // Temel plan bazı özelliklere izin verebilir
      const basicPlan = plans.find(plan => plan.id === 'basic');
      if (basicPlan && featureKey in basicPlan) {
        return Boolean(basicPlan[featureKey as keyof SubscriptionPlan]);
      }
      return false;
    }
    
    // Mevcut planı bul
    const currentPlan = plans.find(plan => plan.id === selectedPlan);
    if (!currentPlan) {
      return false;
    }
    
    // Özelliğin var olup olmadığını kontrol et
    if (featureKey in currentPlan) {
      return Boolean(currentPlan[featureKey as keyof SubscriptionPlan]);
    }
    
    return false;
  },
  
  // Kalan AI istek sayısını hesapla (mock)
  getRemainingRequests: () => {
    const { plans, selectedPlan } = get();
    const currentPlan = plans.find(plan => plan.id === selectedPlan);
    
    if (!currentPlan || !currentPlan.requestLimit) {
      return 0;
    }
    
    // Gerçek uygulamada, kullanılan istek sayısını takip etmek için
    // bir veritabanı veya API kullanılır
    // Bu örnekte sabit bir değer döndürüyoruz
    if (currentPlan.requestLimit === Infinity) {
      return Infinity;
    }
    
    // Aylık limit üzerinden kullanılan istek sayısını çıkar
    const usedRequests = 0; // Bu değer normalde bir API'den veya veritabanından alınır
    return Math.max(0, currentPlan.requestLimit - usedRequests);
  },
  
  // Store'u sıfırla (test için)
  reset: async () => {
    try {
      set({
        selectedPlan: 'basic',
        isSubscribed: false,
        isTrialActive: false,
        trialEndDate: null
      });
      
      await AsyncStorage.removeItem(SUBSCRIPTION_PLAN_KEY);
      await AsyncStorage.removeItem(IS_SUBSCRIBED_KEY);
      await AsyncStorage.removeItem('trial_end_date');
    } catch (error) {
      console.error('Store sıfırlanırken hata oluştu:', error);
    }
  }
}));

export default useSubscriptionStore; 