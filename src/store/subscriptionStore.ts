// src/store/subscriptionStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseFirestore, firebaseAuth } from '../firebase/firebase.config';
import { doc, updateDoc, getDoc, Timestamp } from '@react-native-firebase/firestore';

const ACTIVE_PLAN_ID_KEY = 'active_plan_id';
const SUBSCRIPTION_END_DATE_KEY = 'subscription_end_date';
// Deneme sürümü anahtarları kaldırıldı
// const IS_TRIAL_ACTIVE_KEY = 'is_trial_active';
// const TRIAL_END_DATE_KEY = 'trial_end_date_key';


export interface SubscriptionPlan {
  id: 'free' | 'basic' | 'premium';
  name: string;
  price: number;
  features: string[];
  isAdFree: boolean;
  cloudSyncEnabled: boolean;
}

interface SubscriptionState {
  plans: SubscriptionPlan[];
  activePlanId: 'free' | 'basic' | 'premium';
  selectedPlanForPayment: 'free' | 'basic' | 'premium';
  subscriptionEndDate: Date | null;
  isSubscriptionLoading: boolean;
  isSubscribed: boolean; // Gerçek abonelik durumu
  // Deneme sürümü alanları kaldırıldı
  // isTrialActive: boolean;
  // trialEndDate: Date | null; 
  
  loadUserSubscription: () => Promise<void>;
  updateSubscriptionInFirestore: (planId: 'free' | 'basic' | 'premium', endDate?: Date | null) => Promise<void>;
  setSelectedPlanForPaymentLocally: (planId: 'free' | 'basic' | 'premium') => void; 
  activateSubscribedPlan: (planId: 'free' | 'basic' | 'premium', endDate?: Date | null) => Promise<void>;
  cancelUserSubscription: () => Promise<void>;
  // Deneme sürümü fonksiyonları kaldırıldı
  // getRemainingTrialDays: () => number;
  // startTrial: () => Promise<void>;

  isFeatureAvailable: (featureKey: keyof Pick<SubscriptionPlan, 'isAdFree' | 'cloudSyncEnabled'>) => boolean;
  reset: () => Promise<void>;
}

const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Ücretsiz',
    price: 0,
    features: [
      'Sınırsız kullanım',
      'Temel diyet takibi',
      'Lokal veri depolama',
    ],
    isAdFree: false,
    cloudSyncEnabled: false,
  },
  {
    id: 'basic',
    name: 'Temel',
    price: 39.99,
    features: [
      'Sınırsız kullanım',
      'Reklamsız deneyim',
      'Temel diyet takibi',
      'Lokal veri depolama',
    ],
    isAdFree: true,
    cloudSyncEnabled: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 164.99,
    features: [
      'Sınırsız kullanım',
      'Reklamsız deneyim',
      'Tüm diyet takip özellikleri',
      'Verileri buluta kaydetme',
      'Cihazlar arası senkronizasyon',
    ],
    isAdFree: true,
    cloudSyncEnabled: true,
  }
];

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  plans: DEFAULT_PLANS,
  activePlanId: 'free',
  selectedPlanForPayment: 'basic',
  subscriptionEndDate: null,
  isSubscriptionLoading: true,
  isSubscribed: false,
  // Deneme sürümü başlangıç değerleri kaldırıldı
  // isTrialActive: false,
  // trialEndDate: null,
  
  loadUserSubscription: async () => {
    set({ isSubscriptionLoading: true });
    const user = firebaseAuth.currentUser;

    // Deneme sürümüyle ilgili mantık kaldırıldı
    // ...

    if (user) {
      try {
        const userDocRef = doc(firebaseFirestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        let currentActivePlanId: 'free' | 'basic' | 'premium' = 'free';
        let currentSubscriptionEndDate: Date | null = null;
        let currentIsSubscribed = false;

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          currentActivePlanId = (userData?.activePlanId as 'free' | 'basic' | 'premium') || 'free';
          
          if (userData?.subscriptionEndDate && userData.subscriptionEndDate instanceof Timestamp) {
            currentSubscriptionEndDate = userData.subscriptionEndDate.toDate();
          }

          if (currentSubscriptionEndDate && currentSubscriptionEndDate < new Date() && currentActivePlanId !== 'free') {
            console.log(`Subscription for ${user.uid} expired. Downgrading to free.`);
            currentActivePlanId = 'free';
            currentSubscriptionEndDate = null;
            await get().updateSubscriptionInFirestore('free', null);
            currentIsSubscribed = false;
          } else if (currentActivePlanId !== 'free' && currentSubscriptionEndDate && currentSubscriptionEndDate >= new Date()) {
            currentIsSubscribed = true;
          }
        }
        
        set({ 
            activePlanId: currentActivePlanId, 
            subscriptionEndDate: currentSubscriptionEndDate, 
            isSubscribed: currentIsSubscribed,
            selectedPlanForPayment: currentActivePlanId,
            isSubscriptionLoading: false 
        });
        await AsyncStorage.setItem(ACTIVE_PLAN_ID_KEY, currentActivePlanId);
        if (currentSubscriptionEndDate) await AsyncStorage.setItem(SUBSCRIPTION_END_DATE_KEY, currentSubscriptionEndDate.toISOString());
        else await AsyncStorage.removeItem(SUBSCRIPTION_END_DATE_KEY);

      } catch (error) {
        console.error('Error loading user subscription from Firestore:', error);
        set({ isSubscriptionLoading: false, activePlanId: 'free', subscriptionEndDate: null, isSubscribed: false, selectedPlanForPayment: 'free' });
      }
    } else {
      const storedPlanId = (await AsyncStorage.getItem(ACTIVE_PLAN_ID_KEY) as 'free' | 'basic' | 'premium' | null) || 'free';
      const storedEndDateStr = await AsyncStorage.getItem(SUBSCRIPTION_END_DATE_KEY);
      const storedEndDate = storedEndDateStr ? new Date(storedEndDateStr) : null;
      let isLocallySubscribed = false;
      if (storedPlanId !== 'free' && storedEndDate && storedEndDate >= new Date()) {
        isLocallySubscribed = true;
      }

      set({
        activePlanId: storedPlanId,
        subscriptionEndDate: storedEndDate,
        isSubscribed: isLocallySubscribed,
        isSubscriptionLoading: false,
        selectedPlanForPayment: storedPlanId,
      });
    }
  },

  updateSubscriptionInFirestore: async (planId, endDate = null) => {
    const user = firebaseAuth.currentUser;
    if (user) {
      try {
        const userDocRef = doc(firebaseFirestore, 'users', user.uid);
        await updateDoc(userDocRef, {
          activePlanId: planId,
          subscriptionEndDate: endDate ? Timestamp.fromDate(endDate) : null,
        });
        
        const newIsSubscribed = planId !== 'free' && endDate !== null && endDate >= new Date();
        set({ 
            activePlanId: planId, 
            subscriptionEndDate: endDate, 
            selectedPlanForPayment: planId,
            isSubscribed: newIsSubscribed,
            // isTrialActive: false // Deneme sürümüyle ilgili kısım kaldırıldı
        });
        await AsyncStorage.setItem(ACTIVE_PLAN_ID_KEY, planId);
        if (endDate) await AsyncStorage.setItem(SUBSCRIPTION_END_DATE_KEY, endDate.toISOString());
        else await AsyncStorage.removeItem(SUBSCRIPTION_END_DATE_KEY);
        // await AsyncStorage.setItem(IS_TRIAL_ACTIVE_KEY, 'false'); // Kaldırıldı

        console.log(`User ${user.uid} subscription updated in Firestore to ${planId}.`);
      } catch (error) {
        console.error('Error updating subscription in Firestore:', error);
        throw error;
      }
    }
  },

  setSelectedPlanForPaymentLocally: (planId) => {
    set({ selectedPlanForPayment: planId });
  },
  
  activateSubscribedPlan: async (planId, endDate = null) => {
    await get().updateSubscriptionInFirestore(planId, endDate);
    // Deneme sürümüyle ilgili kısım kaldırıldı
    // set({ isTrialActive: false, trialEndDate: null });
    // await AsyncStorage.setItem(IS_TRIAL_ACTIVE_KEY, 'false');
    // await AsyncStorage.removeItem(TRIAL_END_DATE_KEY);
  },
  
  cancelUserSubscription: async () => {
    try {
      await get().updateSubscriptionInFirestore('free', null);
      // Deneme sürümüyle ilgili kısım kaldırıldı
      // set({ isTrialActive: false, trialEndDate: null });
      // await AsyncStorage.setItem(IS_TRIAL_ACTIVE_KEY, 'false');
      // await AsyncStorage.removeItem(TRIAL_END_DATE_KEY);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    }
  },

  // Deneme sürümü fonksiyonları kaldırıldı
  // startTrial: async () => { ... },
  // getRemainingTrialDays: () => { ... },

  isFeatureAvailable: (featureKey) => {
    const { plans, activePlanId } = get(); // isTrialActive kaldırıldı
    const planToCheck = activePlanId; // Artık sadece aktif plana bakıyoruz
    const currentPlan = plans.find(plan => plan.id === planToCheck);
    
    if (currentPlan && currentPlan[featureKey] !== undefined) {
      return !!currentPlan[featureKey];
    }
    return false;
  },
  
  reset: async () => {
    set({
      activePlanId: 'free',
      selectedPlanForPayment: 'basic',
      subscriptionEndDate: null,
      isSubscriptionLoading: false,
      isSubscribed: false,
      // Deneme sürümü alanları kaldırıldı
      // isTrialActive: false,
      // trialEndDate: null,
    });
    await AsyncStorage.removeItem(ACTIVE_PLAN_ID_KEY);
    await AsyncStorage.removeItem(SUBSCRIPTION_END_DATE_KEY);
    // Deneme sürümü anahtarları kaldırıldı
    // await AsyncStorage.removeItem(IS_TRIAL_ACTIVE_KEY);
    // await AsyncStorage.removeItem(TRIAL_END_DATE_KEY);
  }
}));