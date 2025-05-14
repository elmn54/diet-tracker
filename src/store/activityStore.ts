import { create } from 'zustand';
import { setItem, getItem } from '../storage/asyncStorage';
import { ActivityItem, ActivityType, ActivityIntensity } from '../types/activity';

// Anahtar sabitler
const ACTIVITIES_STORAGE_KEY = 'activities';

// Arayüz tanımlamaları
interface ActivityState {
  activities: ActivityItem[];
  addActivity: (activity: ActivityItem) => Promise<void>;
  removeActivity: (id: string) => Promise<void>;
  updateActivity: (activity: ActivityItem) => Promise<void>;
  calculateDailyBurnedCalories: (date: string) => number;
  reset: () => Promise<void>;
  loadActivities: () => Promise<void>;
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

// Egzersiz kalori hesaplama - basit bir versiyon (daha sonra geliştirilebilir)
export const calculateCaloriesBurned = (
  activityType: ActivityType, 
  intensity: ActivityIntensity, 
  durationMinutes: number, 
  weightKg: number = 70
): number => {
  // MET (Metabolic Equivalent of Task) değerleri - aktivite tipine ve yoğunluğuna göre
  const metValues: Record<ActivityType, Record<ActivityIntensity, number>> = {
    walking: { low: 2.5, medium: 3.5, high: 4.5 },
    running: { low: 7.0, medium: 9.0, high: 12.0 },
    cycling: { low: 4.0, medium: 6.0, high: 10.0 },
    swimming: { low: 5.0, medium: 7.0, high: 10.0 },
    workout: { low: 3.5, medium: 5.0, high: 7.0 },
    other: { low: 3.0, medium: 5.0, high: 7.0 }
  };

  // MET değerini belirle
  const met = metValues[activityType][intensity];

  // Kalori hesaplama formülü: MET * ağırlık (kg) * süre (saat)
  // Süreyi saatten dakikaya çevir
  const durationHours = durationMinutes / 60;
  
  // Yakılan kalori hesapla (negatif değer olarak döndür - kalori çıkışı)
  const caloriesBurned = Math.round(met * weightKg * durationHours);
  
  return caloriesBurned;
};

// Zustand store
export const useActivityStore = create<ActivityState>((set, get) => ({
  // Başlangıç değerleri
  activities: [],
  isLoading: true,
  
  // AsyncStorage'dan verileri yükle
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
  
  // Aktivite ekle
  addActivity: async (activity: ActivityItem) => {
    const { activities } = get();
    const newActivities = [...activities, activity];
    
    // Önce state'i güncelle
    set({ activities: newActivities });
    
    // Sonra AsyncStorage'a kaydet
    await setItem(ACTIVITIES_STORAGE_KEY, newActivities);
  },
  
  // Aktivite sil
  removeActivity: async (id: string) => {
    const { activities } = get();
    const newActivities = activities.filter((activity) => activity.id !== id);
    
    // Önce state'i güncelle
    set({ activities: newActivities });
    
    // Sonra AsyncStorage'a kaydet
    await setItem(ACTIVITIES_STORAGE_KEY, newActivities);
  },
  
  // Aktivite güncelle
  updateActivity: async (updatedActivity: ActivityItem) => {
    const { activities } = get();
    const newActivities = activities.map((activity) => 
      activity.id === updatedActivity.id ? updatedActivity : activity
    );
    
    // Önce state'i güncelle
    set({ activities: newActivities });
    
    // Sonra AsyncStorage'a kaydet
    await setItem(ACTIVITIES_STORAGE_KEY, newActivities);
  },
  
  // Günlük yakılan kalori hesapla
  calculateDailyBurnedCalories: (date: string) => {
    const { activities } = get();
    return activities
      .filter((activity) => isSameDay(activity.date, date))
      .reduce((total, activity) => total + activity.calories, 0);
  },
  
  // Test için store'u sıfırla
  reset: async () => {
    set({ activities: [] });
    await setItem(ACTIVITIES_STORAGE_KEY, []);
  },
})); 