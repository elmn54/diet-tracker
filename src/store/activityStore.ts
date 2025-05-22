import { create } from 'zustand';
import { setItem, getItem } from '../storage/asyncStorage';
import { ActivityItem, ActivityType, ActivityIntensity } from '../types/activity';
import { v4 as uuidv4 } from 'uuid'; // ID üretimi için
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

// Anahtar sabitler
const ACTIVITIES_STORAGE_KEY = 'activities';

// Arayüz tanımlamaları
interface ActivityState {
  activities: ActivityItem[];
  addActivity: (activity: Omit<ActivityItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<ActivityItem>;
  removeActivity: (id: string) => Promise<void>;
  updateActivity: (activity: ActivityItem) => Promise<void>;
  calculateDailyBurnedCalories: (date: string) => number;
  reset: () => Promise<void>;
  loadActivities: () => Promise<void>;
  isLoading: boolean;
  setActivities: (activities: ActivityItem[]) => void; // Firestore'dan yükleme için
}

// Tarih karşılaştırma yardımcı fonksiyonu
const isSameDateActivity = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

// Egzersiz kalori hesaplama
export const calculateCaloriesBurned = (
  activityType: ActivityType, 
  intensity: ActivityIntensity, 
  durationMinutes: number, 
  weightKg: number = 70 // Varsayılan ağırlık, idealde kullanıcı profilinden alınmalı
): number => {
  const metValues: Record<ActivityType, Record<ActivityIntensity, number>> = {
    walking: { low: 2.5, medium: 3.5, high: 4.5 },
    running: { low: 7.0, medium: 9.0, high: 12.0 },
    cycling: { low: 4.0, medium: 6.0, high: 10.0 },
    swimming: { low: 5.0, medium: 7.0, high: 10.0 },
    workout: { low: 3.5, medium: 5.0, high: 7.0 },
    other: { low: 3.0, medium: 5.0, high: 7.0 }
  };

  const met = metValues[activityType]?.[intensity] || metValues.other.medium; // Güvenli erişim
  const durationHours = durationMinutes / 60;
  const caloriesBurned = Math.round(met * weightKg * durationHours);
  return caloriesBurned;
};

// Zustand store
export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],
  isLoading: true,
  
  loadActivities: async () => {
    set({ isLoading: true });
    try {
      const storedActivities = await getItem<ActivityItem[]>(ACTIVITIES_STORAGE_KEY, []);
      set({ activities: storedActivities || [], isLoading: false });
    } catch (error) {
      console.error("Failed to load activities:", error);
      set({ activities: [], isLoading: false });
    }
  },
  
  addActivity: async (activityInput) => {
    const newActivityItem: ActivityItem = {
      ...activityInput,
      id: activityInput.id || uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const { activities } = get();
    const newActivities = [...activities, newActivityItem];
    
    set({ activities: newActivities });
    await setItem(ACTIVITIES_STORAGE_KEY, newActivities);
    // TODO: Premium kullanıcı ise Firestore'a da ekle
    return newActivityItem;
  },
  
  removeActivity: async (id: string) => {
    const { activities } = get();
    const newActivities = activities.filter((activity) => activity.id !== id);
    
    set({ activities: newActivities });
    await setItem(ACTIVITIES_STORAGE_KEY, newActivities);
    // TODO: Premium kullanıcı ise Firestore'dan da sil
  },
  
  updateActivity: async (updatedActivity: ActivityItem) => {
    const activityWithTimestamp = {
      ...updatedActivity,
      updatedAt: new Date().toISOString(),
    };
    const { activities } = get();
    const newActivities = activities.map((activity) => 
      activity.id === activityWithTimestamp.id ? activityWithTimestamp : activity
    );
    
    set({ activities: newActivities });
    await setItem(ACTIVITIES_STORAGE_KEY, newActivities);
    // TODO: Premium kullanıcı ise Firestore'da da güncelle
  },
  
  calculateDailyBurnedCalories: (date: string) => {
    const { activities } = get();
    return activities
      .filter((activity) => isSameDateActivity(activity.date, date))
      .reduce((total, activity) => total + activity.calories, 0);
  },
  
  reset: async () => {
    set({ activities: [], isLoading: false });
    await setItem(ACTIVITIES_STORAGE_KEY, []);
  },

  setActivities: (loadedActivities: ActivityItem[]) => {
    set({ activities: loadedActivities, isLoading: false });
    setItem(ACTIVITIES_STORAGE_KEY, loadedActivities);
  }
}));