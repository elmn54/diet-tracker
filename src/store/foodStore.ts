import { create } from 'zustand';
import { setItem, getItem } from '../storage/asyncStorage';
// import { useActivityStore } from './activityStore'; // Bu import döngüye neden olabilir, doğrudan kullanmayalım
import { v4 as uuidv4 } from 'uuid';
import { FirebaseFirestoreTypes, Timestamp } from '@react-native-firebase/firestore';
// DÜZELTME: syncService'den doğru fonksiyonları import et
import { syncItemUpstream, deleteItemFromFirestore } from '../services/syncService';
import { useSubscriptionStore } from './subscriptionStore';
import { useActivityStore } from './activityStore'; // calculateNetCalories için gerekli

const FOODS_STORAGE_KEY = 'foods';

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  imageUri?: string;
  createdAt?: string | Date | FirebaseFirestoreTypes.Timestamp;
  updatedAt?: string | Date | FirebaseFirestoreTypes.Timestamp;
}

export interface Nutrients {
  protein: number;
  carbs: number;
  fat: number;
}

interface FoodState {
  foods: FoodItem[];
  addFood: (food: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<FoodItem>;
  removeFood: (id: string) => Promise<void>;
  updateFood: (food: FoodItem) => Promise<void>;
  calculateDailyCalories: (date: string) => number;
  calculateDailyNutrients: (date: string) => Nutrients;
  // calculateNetCalories: (date: string) => number; // Bu hala döngüye neden olabilir
  reset: () => Promise<void>;
  loadFoods: () => Promise<void>;
  isLoading: boolean;
  setFoods: (foods: FoodItem[]) => void;
}

const isSameDate = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const useFoodStore = create<FoodState>((set, get) => ({
  foods: [],
  isLoading: true,
  
  loadFoods: async () => {
    set({ isLoading: true });
    try {
      const storedFoods = await getItem<FoodItem[]>(FOODS_STORAGE_KEY, []);
      const processedFoods = (storedFoods || []).map(food => ({
        ...food,
        createdAt: typeof food.createdAt === 'string' ? new Date(food.createdAt) : food.createdAt,
        updatedAt: typeof food.updatedAt === 'string' ? new Date(food.updatedAt) : food.updatedAt,
      }));
      set({ foods: processedFoods, isLoading: false });
    } catch (error) {
      console.error("Failed to load foods:", error);
      set({ foods: [], isLoading: false });
    }
  },
  
  addFood: async (foodInput) => {
    const now = new Date();
    const newFoodItem: FoodItem = {
      ...foodInput,
      id: foodInput.id || uuidv4(),
      createdAt: now,
      updatedAt: now,
    };

    const { foods } = get();
    const newFoods = [...foods, newFoodItem];
    
    set({ foods: newFoods });
    await setItem(FOODS_STORAGE_KEY, newFoods.map(f => ({...f, createdAt: (f.createdAt instanceof Date ? f.createdAt.toISOString() : f.createdAt), updatedAt: (f.updatedAt instanceof Date ? f.updatedAt.toISOString() : f.updatedAt) })) );

    const { activePlanId } = useSubscriptionStore.getState();
    if (activePlanId === 'premium') {
      await syncItemUpstream('meals', newFoodItem);
    }
    return newFoodItem;
  },
  
  removeFood: async (id: string) => {
    const { foods } = get();
    const newFoods = foods.filter((food) => food.id !== id);
    
    set({ foods: newFoods });
    await setItem(FOODS_STORAGE_KEY, newFoods.map(f => ({...f, createdAt: (f.createdAt instanceof Date ? f.createdAt.toISOString() : f.createdAt), updatedAt: (f.updatedAt instanceof Date ? f.updatedAt.toISOString() : f.updatedAt) })) );

    const { activePlanId } = useSubscriptionStore.getState();
    if (activePlanId === 'premium') {
      await deleteItemFromFirestore('meals', id);
    }
  },
  
  updateFood: async (updatedFood: FoodItem) => {
    const foodWithTimestamp: FoodItem = {
      ...updatedFood,
      updatedAt: new Date(),
    };
    const { foods } = get();
    const newFoods = foods.map((food) => 
      food.id === foodWithTimestamp.id ? foodWithTimestamp : food
    );
    
    set({ foods: newFoods });
    await setItem(FOODS_STORAGE_KEY, newFoods.map(f => ({...f, createdAt: (f.createdAt instanceof Date ? f.createdAt.toISOString() : f.createdAt), updatedAt: (f.updatedAt instanceof Date ? f.updatedAt.toISOString() : f.updatedAt) })) );

    const { activePlanId } = useSubscriptionStore.getState();
    if (activePlanId === 'premium') {
      await syncItemUpstream('meals', foodWithTimestamp);
    }
  },
  
  calculateDailyCalories: (date: string) => {
    const { foods } = get();
    return foods
      .filter((food) => isSameDate(food.date, date))
      .reduce((total, food) => total + food.calories, 0);
  },
  
  calculateDailyNutrients: (date: string) => {
    const { foods } = get();
    return foods
      .filter((food) => isSameDate(food.date, date))
      .reduce(
        (nutrients, food) => ({
          protein: nutrients.protein + food.protein,
          carbs: nutrients.carbs + food.carbs,
          fat: nutrients.fat + food.fat,
        }),
        { protein: 0, carbs: 0, fat: 0 }
      );
  },
  
  reset: async () => {
    set({ foods: [], isLoading: false });
    await setItem(FOODS_STORAGE_KEY, []);
  },

  setFoods: (loadedFoods: FoodItem[]) => {
    const processedFoods = loadedFoods.map(food => ({
        ...food,
        createdAt: food.createdAt && !(food.createdAt instanceof Date) && (food.createdAt as FirebaseFirestoreTypes.Timestamp)?.toDate ? (food.createdAt as FirebaseFirestoreTypes.Timestamp).toDate() : (typeof food.createdAt === 'string' ? new Date(food.createdAt) : food.createdAt),
        updatedAt: food.updatedAt && !(food.updatedAt instanceof Date) && (food.updatedAt as FirebaseFirestoreTypes.Timestamp)?.toDate ? (food.updatedAt as FirebaseFirestoreTypes.Timestamp).toDate() : (typeof food.updatedAt === 'string' ? new Date(food.updatedAt) : food.updatedAt),
    }));
    set({ foods: processedFoods, isLoading: false });
    setItem(FOODS_STORAGE_KEY, processedFoods.map(f => ({...f, createdAt: (f.createdAt instanceof Date ? f.createdAt.toISOString() : f.createdAt), updatedAt: (f.updatedAt instanceof Date ? f.updatedAt.toISOString() : f.updatedAt) })) );
  }
}));

// calculateNetCalories'i store dışına taşıyarak veya ihtiyaç duyulan yerde hesaplayarak döngüyü kırabiliriz.
// Şimdilik bu fonksiyonu yorum satırına alıyorum.
// export const calculateNetCalories = (date: string): number => {
//   const foodCalories = useFoodStore.getState().calculateDailyCalories(date);
//   const burnedCalories = useActivityStore.getState().calculateDailyBurnedCalories(date);
//   return foodCalories - burnedCalories;
// };