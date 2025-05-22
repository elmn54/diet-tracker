import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
// DÜZELTME: syncService'den doğru fonksiyonu import et
import { syncUserSettingsUpstream } from '../services/syncService';
import { useSubscriptionStore } from './subscriptionStore';
import { firebaseAuth } from '../firebase/firebase.config';

const CALORIE_GOAL_KEY = 'calorie_goal';
const NUTRIENT_GOALS_KEY = 'nutrient_goals';

export interface NutrientGoals {
  protein: number;
  carbs: number;
  fat: number;
}

interface CalorieGoalState {
  calorieGoal: number;
  nutrientGoals: NutrientGoals;
  isLoading: boolean;
  
  setCalorieGoal: (goal: number) => Promise<void>;
  setNutrientGoals: (goals: NutrientGoals) => Promise<void>;
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
      
      const currentNutrientGoals = get().nutrientGoals;
      set({ calorieGoal: goal });
      await AsyncStorage.setItem(CALORIE_GOAL_KEY, goal.toString());

      const { activePlanId } = useSubscriptionStore.getState();
      const userId = firebaseAuth.currentUser?.uid;
      if (activePlanId === 'premium' && userId) {
        await syncUserSettingsUpstream(userId, { calorieGoal: goal, nutrientGoals: currentNutrientGoals });
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
      const currentCalorieGoal = get().calorieGoal;
      set({ nutrientGoals: goals });
      await AsyncStorage.setItem(NUTRIENT_GOALS_KEY, JSON.stringify(goals));

      const { activePlanId } = useSubscriptionStore.getState();
      const userId = firebaseAuth.currentUser?.uid;
      if (activePlanId === 'premium' && userId) {
        await syncUserSettingsUpstream(userId, { calorieGoal: currentCalorieGoal, nutrientGoals: goals });
      }

    } catch (error) {
      console.error('Besin değerleri hedefleri kaydedilirken hata oluştu:', error);
    }
  },
  
  loadGoals: async () => {
    const { activePlanId } = useSubscriptionStore.getState();
    if (activePlanId !== 'premium') {
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