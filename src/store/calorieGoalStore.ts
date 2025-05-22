import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncUserSettingsUpstream } from '../services/syncService'; // Eklenecek
import { useSubscriptionStore } from './subscriptionStore'; // Eklenecek


const CALORIE_GOAL_KEY = 'calorie_goal';
const NUTRIENT_GOALS_KEY = 'nutrient_goals';
// const CONSUMED_CALORIES_KEY = 'consumed_calories'; // Bu store'dan kaldırılabilir, foodStore hesaplıyor

export interface NutrientGoals {
  protein: number;
  carbs: number;
  fat: number;
}

interface CalorieGoalState {
  calorieGoal: number;
  nutrientGoals: NutrientGoals;
  // consumedCalories: number; // Kaldırıldı
  // remainingCalories: number; // Kaldırıldı, anlık hesaplanabilir
  isLoading: boolean;
  
  setCalorieGoal: (goal: number) => Promise<void>;
  setNutrientGoals: (goals: NutrientGoals) => Promise<void>;
  // setConsumedCalories: (calories: number) => Promise<void>; // Kaldırıldı
  // calculateRemainingCalories: () => number; // Kaldırıldı
  loadGoals: () => Promise<void>;
  reset: () => Promise<void>;
}

const DEFAULT_CALORIE_GOAL = 2000;
const DEFAULT_NUTRIENT_GOALS: NutrientGoals = {
  protein: 100,
  carbs: 250,
  fat: 65,
};

export const useCalorieGoalStore = create<CalorieGoalState>((set, get) => ({
  calorieGoal: DEFAULT_CALORIE_GOAL,
  nutrientGoals: DEFAULT_NUTRIENT_GOALS,
  isLoading: true,
  
  setCalorieGoal: async (goal: number) => {
    try {
      if (isNaN(goal) || goal <= 0) {
        console.error('Geçersiz kalori hedefi değeri:', goal);
        return;
      }
      
      const currentNutrientGoals = get().nutrientGoals; // Mevcut makroları al
      set({ calorieGoal: goal });
      await AsyncStorage.setItem(CALORIE_GOAL_KEY, goal.toString());

      // Premium kullanıcı ise Firestore'a da senkronize et
      if (useSubscriptionStore.getState().activePlanId === 'premium') {
        await syncUserSettingsUpstream({ calorieGoal: goal, nutrientGoals: currentNutrientGoals });
      }

    } catch (error) {
      console.error('Kalori hedefi kaydedilirken hata oluştu:', error);
    }
  },
  
  setNutrientGoals: async (goals: NutrientGoals) => {
    try {
      if (
        isNaN(goals.protein) || goals.protein < 0 ||
        isNaN(goals.carbs) || goals.carbs < 0 ||
        isNaN(goals.fat) || goals.fat < 0
      ) {
        console.error('Geçersiz besin değerleri hedefleri:', goals);
        return;
      }
      const currentCalorieGoal = get().calorieGoal; // Mevcut kalori hedefini al
      set({ nutrientGoals: goals });
      await AsyncStorage.setItem(NUTRIENT_GOALS_KEY, JSON.stringify(goals));

       // Premium kullanıcı ise Firestore'a da senkronize et
      if (useSubscriptionStore.getState().activePlanId === 'premium') {
        await syncUserSettingsUpstream({ calorieGoal: currentCalorieGoal, nutrientGoals: goals });
      }

    } catch (error) {
      console.error('Besin değerleri hedefleri kaydedilirken hata oluştu:', error);
    }
  },
  
  loadGoals: async () => {
    // Bu fonksiyon AuthContext'teki userSettings yüklemesiyle çakışabilir.
    // Öncelik Firestore'dan gelen userSettings olmalı.
    // Eğer AuthContext userSettings'i yüklüyorsa, bu fonksiyon sadece lokal fallback için kalabilir
    // veya AuthContext yüklendikten sonra çağrılabilir.
    // Şimdilik AuthContext'teki yüklemeye güveniyoruz.
    // Premium olmayan kullanıcılar için lokalden yükleme devam etmeli.
    if (useSubscriptionStore.getState().activePlanId !== 'premium') {
        set({ isLoading: true });
        try {
            const storedCalorieGoal = await AsyncStorage.getItem(CALORIE_GOAL_KEY);
            if (storedCalorieGoal) {
                const parsedGoal = parseInt(storedCalorieGoal, 10);
                if (!isNaN(parsedGoal) && parsedGoal > 0) {
                    set({ calorieGoal: parsedGoal });
                }
            }

            const storedNutrientGoals = await AsyncStorage.getItem(NUTRIENT_GOALS_KEY);
            if (storedNutrientGoals) {
                const parsedGoals = JSON.parse(storedNutrientGoals);
                if (
                    parsedGoals && typeof parsedGoals === 'object' &&
                    !isNaN(parsedGoals.protein) && parsedGoals.protein >= 0 &&
                    !isNaN(parsedGoals.carbs) && parsedGoals.carbs >= 0 &&
                    !isNaN(parsedGoals.fat) && parsedGoals.fat >= 0
                ) {
                    set({ nutrientGoals: parsedGoals });
                }
            }
        } catch (error) {
            console.error('Lokal hedefler yüklenirken hata:', error);
        } finally {
            set({ isLoading: false });
        }
    } else {
        // Premium kullanıcı için userSettings AuthContext tarafından yüklenecek
        // ve syncDownstreamDataToStores ile bu store güncellenecek.
        // Bu yüzden burada bir şey yapmaya gerek yok veya sadece isLoading=false ayarlanabilir.
        set({ isLoading: false });
    }
  },
  
  reset: async () => {
    set({
      calorieGoal: DEFAULT_CALORIE_GOAL,
      nutrientGoals: DEFAULT_NUTRIENT_GOALS,
      isLoading: false
    });
    await AsyncStorage.removeItem(CALORIE_GOAL_KEY);
    await AsyncStorage.removeItem(NUTRIENT_GOALS_KEY);
  }
}));

export default useCalorieGoalStore;