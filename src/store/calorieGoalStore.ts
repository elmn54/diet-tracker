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
      // Değerin geçerli bir sayı olduğundan emin ol
      if (isNaN(goal) || goal <= 0) {
        console.error('Geçersiz kalori hedefi değeri:', goal);
        return;
      }
      
      console.log('Setting calorie goal to:', goal);
      
      // Kalori hedefini güncelle
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
      // Değerlerin geçerli sayılar olduğundan emin ol
      if (
        isNaN(goals.protein) || goals.protein < 0 ||
        isNaN(goals.carbs) || goals.carbs < 0 ||
        isNaN(goals.fat) || goals.fat < 0
      ) {
        console.error('Geçersiz besin değerleri hedefleri:', goals);
        return;
      }
      
      console.log('Setting nutrient goals to:', goals);
      
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
        try {
          const parsedGoal = parseInt(storedCalorieGoal, 10);
          
          // Değerin geçerli olduğundan emin ol
          if (!isNaN(parsedGoal) && parsedGoal > 0) {
            console.log('Loaded calorie goal from storage:', parsedGoal);
            set({ calorieGoal: parsedGoal });
          } else {
            console.warn('Invalid stored calorie goal, using default:', DEFAULT_CALORIE_GOAL);
            set({ calorieGoal: DEFAULT_CALORIE_GOAL });
          }
        } catch (parseError) {
          console.error('Failed to parse stored calorie goal:', parseError);
          set({ calorieGoal: DEFAULT_CALORIE_GOAL });
        }
      }
      
      // Besin değerleri hedeflerini yükle
      const storedNutrientGoals = await AsyncStorage.getItem(NUTRIENT_GOALS_KEY);
      if (storedNutrientGoals) {
        try {
          const parsedGoals = JSON.parse(storedNutrientGoals);
          
          // Tüm değerlerin geçerli olduğundan emin ol
          if (
            parsedGoals &&
            typeof parsedGoals === 'object' &&
            !isNaN(parsedGoals.protein) && parsedGoals.protein >= 0 &&
            !isNaN(parsedGoals.carbs) && parsedGoals.carbs >= 0 &&
            !isNaN(parsedGoals.fat) && parsedGoals.fat >= 0
          ) {
            console.log('Loaded nutrient goals from storage:', parsedGoals);
            set({ nutrientGoals: parsedGoals });
          } else {
            console.warn('Invalid stored nutrient goals, using defaults:', DEFAULT_NUTRIENT_GOALS);
            set({ nutrientGoals: DEFAULT_NUTRIENT_GOALS });
          }
        } catch (parseError) {
          console.error('Failed to parse stored nutrient goals:', parseError);
          set({ nutrientGoals: DEFAULT_NUTRIENT_GOALS });
        }
      }
      
      // Tüketilen kaloriyi yükle
      const storedConsumedCalories = await AsyncStorage.getItem(CONSUMED_CALORIES_KEY);
      if (storedConsumedCalories) {
        try {
          const parsedConsumed = parseInt(storedConsumedCalories, 10);
          
          if (!isNaN(parsedConsumed) && parsedConsumed >= 0) {
            set({ consumedCalories: parsedConsumed });
          } else {
            set({ consumedCalories: 0 });
          }
        } catch (parseError) {
          console.error('Failed to parse stored consumed calories:', parseError);
          set({ consumedCalories: 0 });
        }
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