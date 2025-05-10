import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage anahtarları
const CALORIE_GOAL_KEY = 'calorie_goal';
const NUTRIENT_GOALS_KEY = 'nutrient_goals';
const CONSUMED_CALORIES_KEY = 'consumed_calories';

// Besin değerleri türü
export interface NutrientGoals {
  protein: number; // g
  carbs: number;   // g
  fat: number;     // g
}

// Kalori Hedef Store Türü
interface CalorieGoalState {
  calorieGoal: number;
  nutrientGoals: NutrientGoals;
  consumedCalories: number;
  remainingCalories: number;
  isLoading: boolean;
  
  // Eylemler
  setCalorieGoal: (goal: number) => Promise<void>;
  setNutrientGoals: (goals: NutrientGoals) => Promise<void>;
  setConsumedCalories: (calories: number) => Promise<void>;
  calculateRemainingCalories: () => number;
  loadGoals: () => Promise<void>;
  reset: () => Promise<void>;
}

// Varsayılan hedefler
const DEFAULT_CALORIE_GOAL = 2000; // kcal
const DEFAULT_NUTRIENT_GOALS: NutrientGoals = {
  protein: 100, // g
  carbs: 250,   // g
  fat: 65,      // g
};

// Kalori ve Besin Hedefleri Store
export const useCalorieGoalStore = create<CalorieGoalState>((set, get) => ({
  // Başlangıç değerleri
  calorieGoal: DEFAULT_CALORIE_GOAL,
  nutrientGoals: DEFAULT_NUTRIENT_GOALS,
  consumedCalories: 0,
  remainingCalories: DEFAULT_CALORIE_GOAL,
  isLoading: true,
  
  // Kalori hedefini ayarla
  setCalorieGoal: async (goal: number) => {
    try {
      set({ calorieGoal: goal });
      await AsyncStorage.setItem(CALORIE_GOAL_KEY, goal.toString());
      
      // Kalan kaloriyi güncelle
      const remainingCalories = get().calculateRemainingCalories();
      set({ remainingCalories });
    } catch (error) {
      console.error('Kalori hedefi kaydedilirken hata oluştu:', error);
    }
  },
  
  // Besin değerleri hedeflerini ayarla
  setNutrientGoals: async (goals: NutrientGoals) => {
    try {
      set({ nutrientGoals: goals });
      await AsyncStorage.setItem(NUTRIENT_GOALS_KEY, JSON.stringify(goals));
    } catch (error) {
      console.error('Besin değerleri hedefleri kaydedilirken hata oluştu:', error);
    }
  },
  
  // Tüketilen kaloriyi ayarla (manuel giriş veya otomatik hesaplama için)
  setConsumedCalories: async (calories: number) => {
    try {
      set({ consumedCalories: calories });
      await AsyncStorage.setItem(CONSUMED_CALORIES_KEY, calories.toString());
      
      // Kalan kaloriyi güncelle
      const remainingCalories = get().calculateRemainingCalories();
      set({ remainingCalories });
    } catch (error) {
      console.error('Tüketilen kalori kaydedilirken hata oluştu:', error);
    }
  },
  
  // Kalan kaloriyi hesapla
  calculateRemainingCalories: () => {
    const { calorieGoal, consumedCalories } = get();
    return calorieGoal - consumedCalories;
  },
  
  // Hedefleri yükle
  loadGoals: async () => {
    try {
      set({ isLoading: true });
      
      // Kalori hedefini yükle
      const storedCalorieGoal = await AsyncStorage.getItem(CALORIE_GOAL_KEY);
      if (storedCalorieGoal) {
        set({ calorieGoal: parseInt(storedCalorieGoal, 10) });
      }
      
      // Besin değerleri hedeflerini yükle
      const storedNutrientGoals = await AsyncStorage.getItem(NUTRIENT_GOALS_KEY);
      if (storedNutrientGoals) {
        set({ nutrientGoals: JSON.parse(storedNutrientGoals) });
      }
      
      // Tüketilen kaloriyi yükle
      const storedConsumedCalories = await AsyncStorage.getItem(CONSUMED_CALORIES_KEY);
      if (storedConsumedCalories) {
        set({ consumedCalories: parseInt(storedConsumedCalories, 10) });
      }
      
      // Kalan kaloriyi hesapla
      const remainingCalories = get().calculateRemainingCalories();
      set({ remainingCalories, isLoading: false });
    } catch (error) {
      console.error('Hedefler yüklenirken hata oluştu:', error);
      set({ isLoading: false });
    }
  },
  
  // Test için store'u sıfırla
  reset: async () => {
    try {
      set({
        calorieGoal: DEFAULT_CALORIE_GOAL,
        nutrientGoals: DEFAULT_NUTRIENT_GOALS,
        consumedCalories: 0,
        remainingCalories: DEFAULT_CALORIE_GOAL,
        isLoading: false
      });
      
      await AsyncStorage.removeItem(CALORIE_GOAL_KEY);
      await AsyncStorage.removeItem(NUTRIENT_GOALS_KEY);
      await AsyncStorage.removeItem(CONSUMED_CALORIES_KEY);
    } catch (error) {
      console.error('Store sıfırlanırken hata oluştu:', error);
    }
  }
}));

export default useCalorieGoalStore; 