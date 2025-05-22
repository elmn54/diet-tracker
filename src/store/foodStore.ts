import { create } from 'zustand';
import { setItem, getItem } from '../storage/asyncStorage';
import { useActivityStore } from './activityStore';
import { v4 as uuidv4 } from 'uuid'; // ID üretimi için
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

// Anahtar sabitler
const FOODS_STORAGE_KEY = 'foods';

// Tür tanımlamaları
export interface FoodItem {
  id: string; // UUID ile oluşturulacak, Firestore'da doküman ID'si olarak kullanılacak
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string; // ISO string formatında tarih
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  imageUri?: string; // Yemek fotoğrafının URI'si (opsiyonel)
  createdAt?: string | FirebaseFirestoreTypes.Timestamp; // ISO string veya Firestore Timestamp
  updatedAt?: string | FirebaseFirestoreTypes.Timestamp; // ISO string veya Firestore Timestamp
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
  calculateNetCalories: (date: string) => number;
  reset: () => Promise<void>;
  loadFoods: () => Promise<void>;
  isLoading: boolean;
  setFoods: (foods: FoodItem[]) => void; // Firestore'dan yükleme için
}

// Tarih karşılaştırma yardımcı fonksiyonu
const isSameDate = (date1: string, date2: string): boolean => {
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
  addFood: async (foodInput) => {
    const newFoodItem: FoodItem = {
      ...foodInput,
      id: foodInput.id || uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { foods } = get();
    const newFoods = [...foods, newFoodItem];
    
    set({ foods: newFoods });
    await setItem(FOODS_STORAGE_KEY, newFoods);
    // TODO: Premium kullanıcı ise Firestore'a da ekle (syncService aracılığıyla)
    return newFoodItem;
  },
  
  // Yemek sil
  removeFood: async (id: string) => {
    const { foods } = get();
    const newFoods = foods.filter((food) => food.id !== id);
    
    set({ foods: newFoods });
    await setItem(FOODS_STORAGE_KEY, newFoods);
    // TODO: Premium kullanıcı ise Firestore'dan da sil (syncService aracılığıyla)
  },
  
  // Yemek güncelle
  updateFood: async (updatedFood: FoodItem) => {
    const foodWithTimestamp = {
      ...updatedFood,
      updatedAt: new Date().toISOString(),
    };
    const { foods } = get();
    const newFoods = foods.map((food) => 
      food.id === foodWithTimestamp.id ? foodWithTimestamp : food
    );
    
    set({ foods: newFoods });
    await setItem(FOODS_STORAGE_KEY, newFoods);
    // TODO: Premium kullanıcı ise Firestore'da da güncelle (syncService aracılığıyla)
  },
  
  // Günlük kalori hesapla
  calculateDailyCalories: (date: string) => {
    const { foods } = get();
    return foods
      .filter((food) => isSameDate(food.date, date))
      .reduce((total, food) => total + food.calories, 0);
  },
  
  // Net kalori hesapla (yemekler - aktiviteler)
  calculateNetCalories: (date: string) => {
    const foodCalories = get().calculateDailyCalories(date);
    const burnedCalories = useActivityStore.getState().calculateDailyBurnedCalories(date);
    return foodCalories - burnedCalories;
  },
  
  // Günlük besin değerlerini hesapla
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
  
  // Test için store'u sıfırla
  reset: async () => {
    set({ foods: [], isLoading: false });
    await setItem(FOODS_STORAGE_KEY, []);
  },

  // Firestore'dan gelen verilerle store'u güncellemek için
  setFoods: (loadedFoods: FoodItem[]) => {
    set({ foods: loadedFoods, isLoading: false });
    // İsteğe bağlı olarak AsyncStorage'a da yazılabilir, ancak Firestore ana kaynak olacaksa
    // ve lokal sadece cache/çevrimdışı ise bu adım atlanabilir veya farklı yönetilebilir.
    // Şimdilik AsyncStorage'a da yazalım.
    setItem(FOODS_STORAGE_KEY, loadedFoods);
  }
}));