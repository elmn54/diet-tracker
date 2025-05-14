import { create } from 'zustand';
import { setItem, getItem } from '../storage/asyncStorage';
import { useActivityStore } from './activityStore';

// Anahtar sabitler
const FOODS_STORAGE_KEY = 'foods';

// Tür tanımlamaları
export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  imageUri?: string; // Yemek fotoğrafının URI'si (opsiyonel)
}

export interface Nutrients {
  protein: number;
  carbs: number;
  fat: number;
}

interface FoodState {
  foods: FoodItem[];
  addFood: (food: FoodItem) => Promise<void>;
  removeFood: (id: string) => Promise<void>;
  updateFood: (food: FoodItem) => Promise<void>;
  calculateDailyCalories: (date: string) => number;
  calculateDailyNutrients: (date: string) => Nutrients;
  calculateNetCalories: (date: string) => number;
  reset: () => Promise<void>;
  loadFoods: () => Promise<void>;
  isLoading: boolean;
}

// Tarih karşılaştırma yardımcı fonksiyonu
const isSameDay = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

// Zustand store
export const useFoodStore = create<FoodState>((set, get) => ({
  // Başlangıç değerleri
  foods: [],
  isLoading: true,
  
  // AsyncStorage'dan verileri yükle
  loadFoods: async () => {
    set({ isLoading: true });
    try {
      const storedFoods = await getItem<FoodItem[]>(FOODS_STORAGE_KEY, []);
      set({ foods: storedFoods || [], isLoading: false });
    } catch (error) {
      console.error("Failed to load foods:", error);
      set({ foods: [], isLoading: false });
    }
  },
  
  // Yemek ekle
  addFood: async (food: FoodItem) => {
    const { foods } = get();
    const newFoods = [...foods, food];
    
    // Önce state'i güncelle
    set({ foods: newFoods });
    
    // Sonra AsyncStorage'a kaydet
    await setItem(FOODS_STORAGE_KEY, newFoods);
  },
  
  // Yemek sil
  removeFood: async (id: string) => {
    const { foods } = get();
    const newFoods = foods.filter((food) => food.id !== id);
    
    // Önce state'i güncelle
    set({ foods: newFoods });
    
    // Sonra AsyncStorage'a kaydet
    await setItem(FOODS_STORAGE_KEY, newFoods);
  },
  
  // Yemek güncelle
  updateFood: async (updatedFood: FoodItem) => {
    const { foods } = get();
    const newFoods = foods.map((food) => 
      food.id === updatedFood.id ? updatedFood : food
    );
    
    // Önce state'i güncelle
    set({ foods: newFoods });
    
    // Sonra AsyncStorage'a kaydet
    await setItem(FOODS_STORAGE_KEY, newFoods);
  },
  
  // Günlük kalori hesapla
  calculateDailyCalories: (date: string) => {
    const { foods } = get();
    return foods
      .filter((food) => isSameDay(food.date, date))
      .reduce((total, food) => total + food.calories, 0);
  },
  
  // Net kalori hesapla (yemekler - aktiviteler)
  calculateNetCalories: (date: string) => {
    // Yemeklerden alınan kalori
    const foodCalories = get().calculateDailyCalories(date);
    
    // Aktivitelerden yakılan kalori
    const burnedCalories = useActivityStore.getState().calculateDailyBurnedCalories(date);
    
    // Net kalori (alınan - yakılan)
    return foodCalories - burnedCalories;
  },
  
  // Günlük besin değerlerini hesapla
  calculateDailyNutrients: (date: string) => {
    const { foods } = get();
    return foods
      .filter((food) => isSameDay(food.date, date))
      .reduce(
        (nutrients, food) => ({
          protein: nutrients.protein + food.protein,
          carbs: nutrients.carbs + food.carbs,
          fat: nutrients.fat + food.fat,
        }),
        { protein: 0, carbs: 0, fat: 0 }
      );
  },
  
  // Test için store'u sıfırla
  reset: async () => {
    set({ foods: [] });
    await setItem(FOODS_STORAGE_KEY, []);
  },
})); 