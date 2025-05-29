// src/store/subscriptionStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseFirestore, firebaseAuth } from '../firebase/firebase.config';
import { doc, updateDoc, getDoc, Timestamp, setDoc, serverTimestamp } from '@react-native-firebase/firestore';

const ACTIVE_PLAN_ID_KEY = 'active_plan_id';
const SUBSCRIPTION_END_DATE_KEY = 'subscription_end_date';

export interface SubscriptionPlan {
  id: 'free' | 'basic' | 'premium' | 'basic_yearly' | 'premium_yearly';
  name: string;
  price: number;
  features: string[];
  isAdFree: boolean;
  cloudSyncEnabled: boolean;
  isYearlyPlan?: boolean;
  monthlyCost?: number;
  savePercentage?: number;
}

interface SubscriptionState {
  plans: SubscriptionPlan[];
  activePlanId: 'free' | 'basic' | 'premium' | 'basic_yearly' | 'premium_yearly';
  selectedPlanForPayment: 'free' | 'basic' | 'premium' | 'basic_yearly' | 'premium_yearly';
  subscriptionEndDate: Date | null;
  isSubscriptionLoading: boolean;
  isSubscribed: boolean;
  
  loadUserSubscription: () => Promise<void>;
  updateSubscriptionInFirestore: (planId: 'free' | 'basic' | 'premium' | 'basic_yearly' | 'premium_yearly', endDate?: Date | null) => Promise<void>;
  setSelectedPlanForPaymentLocally: (planId: 'free' | 'basic' | 'premium' | 'basic_yearly' | 'premium_yearly') => void; 
  activateSubscribedPlan: (planId: 'free' | 'basic' | 'premium' | 'basic_yearly' | 'premium_yearly', endDate?: Date | null) => Promise<void>;
  cancelUserSubscription: () => Promise<void>;
  isFeatureAvailable: (featureKey: keyof Pick<SubscriptionPlan, 'isAdFree' | 'cloudSyncEnabled'>) => boolean;
  reset: () => Promise<void>;
}

const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      'Unlimited usage',
      'Basic diet tracking',
      'Local data storage',
      'Ad-supported experience',
    ],
    isAdFree: false,
    cloudSyncEnabled: false,
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 2.99,
    features: [
      'Unlimited usage',
      'Ad-free experience',
      'Basic diet tracking',
      'Local data storage',
      'Daily and weekly reports',
      'Advanced Statistics',
    ],
    isAdFree: true,
    cloudSyncEnabled: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 5.99,
    features: [
      'Unlimited usage',
      'Ad-free experience',
      'All diet tracking features',
      'Data cloud storage',
      'Device-to-device sync',
      'Daily and weekly reports',
      'Advanced Statistics',
      'Priority support',
    ],
    isAdFree: true,
    cloudSyncEnabled: true,
  },
  {
    id: 'basic_yearly',
    name: 'Basic Yearly',
    price: 24.99,
    monthlyCost: 2.08,
    savePercentage: 30,
    features: [
      'Unlimited usage',
      'Ad-free experience',
      'Basic diet tracking',
      'Local data storage',
      'Daily and weekly reports',
      'Advanced Statistics',
      'Save 30% with yearly plan',
    ],
    isAdFree: true,
    cloudSyncEnabled: false,
    isYearlyPlan: true,
  },
  {
    id: 'premium_yearly',
    name: 'Premium Yearly',
    price: 49.99,
    monthlyCost: 4.17,
    savePercentage: 30,
    features: [
      'Unlimited usage',
      'Ad-free experience',
      'All diet tracking features',
      'Data cloud storage',
      'Device-to-device sync',
      'Daily and weekly reports',
      'Advanced Statistics',
      'Priority support',
      'Save 30% with yearly plan',
    ],
    isAdFree: true,
    cloudSyncEnabled: true,
    isYearlyPlan: true,
  }
];

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  plans: DEFAULT_PLANS,
  activePlanId: 'free',
  selectedPlanForPayment: 'basic',
  subscriptionEndDate: null,
  isSubscriptionLoading: true,
  isSubscribed: false,
  
  loadUserSubscription: async () => {
    set({ isSubscriptionLoading: true });
    const user = firebaseAuth.currentUser;

    if (user) {
      try {
        const userDocRef = doc(firebaseFirestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        let currentActivePlanId: 'free' | 'basic' | 'premium' | 'basic_yearly' | 'premium_yearly' = 'free';
        let currentSubscriptionEndDate: Date | null = null;
        let currentIsSubscribed = false;

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          currentActivePlanId = (userData?.activePlanId as 'free' | 'basic' | 'premium' | 'basic_yearly' | 'premium_yearly') || 'free';
          
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
      const storedPlanId = (await AsyncStorage.getItem(ACTIVE_PLAN_ID_KEY) as 'free' | 'basic' | 'premium' | 'basic_yearly' | 'premium_yearly' | null) || 'free';
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
    if (user && user.uid) {
      try {
        const userDocRef = doc(firebaseFirestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          // Eğer kullanıcı dokümanı varsa, güncelle
          await updateDoc(userDocRef, {
            activePlanId: planId,
            subscriptionEndDate: endDate ? Timestamp.fromDate(endDate) : null,
          });
        } else {
          // Eğer kullanıcı dokümanı yoksa, oluştur
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: serverTimestamp(),
            activePlanId: planId,
            subscriptionEndDate: endDate ? Timestamp.fromDate(endDate) : null,
            userSettings: {
              calorieGoal: 2000,
              nutrientGoals: { protein: 100, carbs: 250, fat: 65 },
              updatedAt: serverTimestamp(),
            }
          });
        }
        
        const newIsSubscribed = planId !== 'free' && endDate !== null && endDate >= new Date();
        set({ 
            activePlanId: planId, 
            subscriptionEndDate: endDate, 
            selectedPlanForPayment: planId,
            isSubscribed: newIsSubscribed,
        });
        await AsyncStorage.setItem(ACTIVE_PLAN_ID_KEY, planId);
        if (endDate) await AsyncStorage.setItem(SUBSCRIPTION_END_DATE_KEY, endDate.toISOString());
        else await AsyncStorage.removeItem(SUBSCRIPTION_END_DATE_KEY);

        console.log(`User ${user.uid} subscription updated in Firestore to ${planId}.`);
      } catch (error) {
        console.error(`Error updating subscription in Firestore for user ${user.uid}:`, error);
        throw error; // Hataları izleyebilmek için hatayı fırlat
      }
    } else {
        console.warn('Cannot update Firestore: User not logged in or UID is missing.');
    }
  },


  setSelectedPlanForPaymentLocally: (planId) => {
    set({ selectedPlanForPayment: planId });
  },
  
  activateSubscribedPlan: async (planId, endDate = null) => {
    await get().updateSubscriptionInFirestore(planId, endDate);
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
    const planToCheck = activePlanId;
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
    });
    await AsyncStorage.removeItem(ACTIVE_PLAN_ID_KEY);
    await AsyncStorage.removeItem(SUBSCRIPTION_END_DATE_KEY);
  }
}));