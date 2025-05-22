import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseFirestore, firebaseAuth } from '../firebase/firebase.config';
import { doc, updateDoc, getDoc, Timestamp } from '@react-native-firebase/firestore';

const ACTIVE_PLAN_ID_KEY = 'active_plan_id';
const SUBSCRIPTION_END_DATE_KEY = 'subscription_end_date';

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
  subscriptionEndDate: Date | null;
  isSubscriptionLoading: boolean;
  loadUserSubscription: () => Promise<void>;
  updateSubscriptionInFirestore: (planId: 'free' | 'basic' | 'premium', endDate?: Date | null) => Promise<void>;
  setActivePlanLocally: (planId: 'free' | 'basic' | 'premium', endDate?: Date | null) => void;
  subscribeToPlan: (planId: 'basic' | 'premium') => Promise<boolean>;
  cancelUserSubscription: () => Promise<void>;
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
  subscriptionEndDate: null,
  isSubscriptionLoading: true,
  
  loadUserSubscription: async () => {
    set({ isSubscriptionLoading: true });
    const user = firebaseAuth.currentUser;
    if (user) {
      try {
        const userDocRef = doc(firebaseFirestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          // activePlanId için varsayılan değer
          const planId = (userData?.activePlanId as 'free' | 'basic' | 'premium') || 'free';
          
          let subEndDate: Date | null = null;
          if (userData?.subscriptionEndDate && userData.subscriptionEndDate instanceof Timestamp) {
            subEndDate = userData.subscriptionEndDate.toDate();
          }

          if (subEndDate && subEndDate < new Date() && planId !== 'free') {
            console.log(`Subscription for ${user.uid} expired. Downgrading to free.`);
            set({ activePlanId: 'free', subscriptionEndDate: null, isSubscriptionLoading: false });
            await get().updateSubscriptionInFirestore('free', null);
          } else {
            set({ activePlanId: planId, subscriptionEndDate: subEndDate, isSubscriptionLoading: false });
          }
          await AsyncStorage.setItem(ACTIVE_PLAN_ID_KEY, planId);
          if (subEndDate) {
            await AsyncStorage.setItem(SUBSCRIPTION_END_DATE_KEY, subEndDate.toISOString());
          } else {
            await AsyncStorage.removeItem(SUBSCRIPTION_END_DATE_KEY);
          }

        } else {
          // Kullanıcı dokümanı yoksa (yeni kullanıcı olabilir, AuthContext'te oluşturulacak)
          set({ activePlanId: 'free', subscriptionEndDate: null, isSubscriptionLoading: false });
          await AsyncStorage.setItem(ACTIVE_PLAN_ID_KEY, 'free');
          await AsyncStorage.removeItem(SUBSCRIPTION_END_DATE_KEY);
        }
      } catch (error) {
        console.error('Error loading user subscription from Firestore:', error);
        set({ isSubscriptionLoading: false, activePlanId: 'free', subscriptionEndDate: null });
      }
    } else {
      // Kullanıcı giriş yapmamışsa, lokalden yükle
      const storedPlanId = (await AsyncStorage.getItem(ACTIVE_PLAN_ID_KEY) as 'free' | 'basic' | 'premium' | null) || 'free';
      const storedEndDate = await AsyncStorage.getItem(SUBSCRIPTION_END_DATE_KEY);
      set({
        activePlanId: storedPlanId,
        subscriptionEndDate: storedEndDate ? new Date(storedEndDate) : null,
        isSubscriptionLoading: false,
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
        get().setActivePlanLocally(planId, endDate);
        console.log(`User ${user.uid} subscription updated in Firestore to ${planId}.`);
      } catch (error) {
        console.error('Error updating subscription in Firestore:', error);
        throw error;
      }
    } else {
      console.warn('Cannot update Firestore: User not logged in. Updating locally.');
      get().setActivePlanLocally(planId, endDate);
    }
  },

  setActivePlanLocally: (planId, endDate = null) => {
    set({ activePlanId: planId, subscriptionEndDate: endDate });
    AsyncStorage.setItem(ACTIVE_PLAN_ID_KEY, planId);
    if (endDate) {
      AsyncStorage.setItem(SUBSCRIPTION_END_DATE_KEY, endDate.toISOString());
    } else {
      AsyncStorage.removeItem(SUBSCRIPTION_END_DATE_KEY);
    }
  },
  
  subscribeToPlan: async (planId) => {
    const newEndDate = new Date();
    newEndDate.setMonth(newEndDate.getMonth() + 1);
    try {
      await get().updateSubscriptionInFirestore(planId, newEndDate);
      return true;
    } catch (error) {
      return false;
    }
  },
  
  cancelUserSubscription: async () => {
    try {
      await get().updateSubscriptionInFirestore('free', null);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    }
  },

  isFeatureAvailable: (featureKey) => {
    const { plans, activePlanId } = get();
    const currentPlan = plans.find(plan => plan.id === activePlanId);
    if (currentPlan && currentPlan[featureKey] !== undefined) {
      return !!currentPlan[featureKey];
    }
    return false;
  },
  
  reset: async () => {
    set({
      activePlanId: 'free',
      subscriptionEndDate: null,
      isSubscriptionLoading: false,
    });
    await AsyncStorage.removeItem(ACTIVE_PLAN_ID_KEY);
    await AsyncStorage.removeItem(SUBSCRIPTION_END_DATE_KEY);
  }
}));