import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSubscriptionStore } from './subscriptionStore';
import { firebaseAuth, firebaseFirestore } from '../firebase/firebase.config';
import { doc, updateDoc, serverTimestamp } from '@react-native-firebase/firestore';

// Key'leri dinamik oluşturmak için yardımcı fonksiyonlar
const getCalorieGoalStorageKey = (userId?: string | null) => {
  const prefix = 'calorie_goal';
  return userId ? `${prefix}_${userId}` : prefix;
};

const getNutrientGoalsStorageKey = (userId?: string | null) => {
  const prefix = 'nutrient_goals';
  return userId ? `${prefix}_${userId}` : prefix;
};

export interface NutrientGoals {
  protein: number;
  carbs: number;
  fat: number;
}

interface CalorieGoalState {
  calorieGoal: number;
  nutrientGoals: NutrientGoals;
  setCalorieGoal: (newGoal: number) => Promise<void>;
  setNutrientGoals: (newGoals: NutrientGoals) => Promise<void>;
  loadGoals: () => Promise<void>;
  isLoading: boolean;
  reset: () => Promise<void>;
}

export const useCalorieGoalStore = create<CalorieGoalState>((set, get) => ({
  calorieGoal: 2000, // Varsayılan değer
  nutrientGoals: { protein: 100, carbs: 250, fat: 65 }, // Varsayılan değerler
  isLoading: true,
  
  loadGoals: async () => {
    set({ isLoading: true });
    try {
      // Kullanıcı ID'sini al
      const currentUser = firebaseAuth.currentUser;
      const userId = currentUser?.uid;
      
      // Kullanıcıya özel storage key oluştur
      const calorieGoalKey = getCalorieGoalStorageKey(userId);
      const nutrientGoalsKey = getNutrientGoalsStorageKey(userId);
      
      const storedCalorieGoal = await AsyncStorage.getItem(calorieGoalKey);
      const storedNutrientGoals = await AsyncStorage.getItem(nutrientGoalsKey);
      
      const parsedCalorieGoal = storedCalorieGoal ? parseInt(storedCalorieGoal, 10) : 2000;
      const parsedNutrientGoals: NutrientGoals = storedNutrientGoals 
        ? JSON.parse(storedNutrientGoals) 
        : { protein: 100, carbs: 250, fat: 65 };
      
      set({
        calorieGoal: parsedCalorieGoal,
        nutrientGoals: parsedNutrientGoals,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to load goals:', error);
      set({
        calorieGoal: 2000,
        nutrientGoals: { protein: 100, carbs: 250, fat: 65 },
        isLoading: false
      });
    }
  },
  
  setCalorieGoal: async (newGoal: number) => {
    set({ calorieGoal: newGoal });
    
    // Kullanıcı ID'sini al
    const currentUser = firebaseAuth.currentUser;
    const userId = currentUser?.uid;
    
    // Kullanıcıya özel storage key oluştur
    const calorieGoalKey = getCalorieGoalStorageKey(userId);
    
    await AsyncStorage.setItem(calorieGoalKey, newGoal.toString());
    
    const { activePlanId } = useSubscriptionStore.getState();
    const { nutrientGoals } = get();
    
    if (activePlanId.includes('premium') && userId) {
      // Update in Firestore
      try {
        const userDoc = doc(firebaseFirestore, 'users', userId);
        await updateDoc(userDoc, {
          'userSettings.calorieGoal': newGoal,
          'userSettings.updatedAt': serverTimestamp(),
        });
      } catch (error) {
        console.error('Error updating calorie goal in Firestore:', error);
      }
    }
  },
  
  setNutrientGoals: async (newGoals: NutrientGoals) => {
    set({ nutrientGoals: newGoals });
    
    // Kullanıcı ID'sini al
    const currentUser = firebaseAuth.currentUser;
    const userId = currentUser?.uid;
    
    // Kullanıcıya özel storage key oluştur
    const nutrientGoalsKey = getNutrientGoalsStorageKey(userId);
    
    await AsyncStorage.setItem(nutrientGoalsKey, JSON.stringify(newGoals));
    
    const { activePlanId } = useSubscriptionStore.getState();
    const { calorieGoal } = get();
    
    if (activePlanId.includes('premium') && userId) {
      // Update in Firestore
      try {
        const userDoc = doc(firebaseFirestore, 'users', userId);
        await updateDoc(userDoc, {
          'userSettings.nutrientGoals': newGoals,
          'userSettings.updatedAt': serverTimestamp(),
        });
      } catch (error) {
        console.error('Error updating nutrient goals in Firestore:', error);
      }
    }
  },
  
  reset: async () => {
    set({
      calorieGoal: 2000,
      nutrientGoals: { protein: 100, carbs: 250, fat: 65 },
      isLoading: false
    });
    
    // Premium kullanıcılar için reset durumunda bile verileri silmeye gerek yok
    // Çünkü her kullanıcının kendi ID'si ile saklanıyor
    // Ancak istenirse tüm verileri silmek için:
    // const currentUser = firebaseAuth.currentUser;
    // const userId = currentUser?.uid;
    // const calorieGoalKey = getCalorieGoalStorageKey(userId);
    // const nutrientGoalsKey = getNutrientGoalsStorageKey(userId);
    // await AsyncStorage.removeItem(calorieGoalKey);
    // await AsyncStorage.removeItem(nutrientGoalsKey);
  }
}));

export default useCalorieGoalStore;