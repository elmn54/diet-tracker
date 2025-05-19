import { create } from 'zustand';
import { setItem, getItem } from '../storage/asyncStorage';
import { useFoodStore } from './foodStore';
import { useActivityStore } from './activityStore';
import { differenceInDays, isSameDay, subDays } from 'date-fns';

// Kullanıcı istatistikleri için store
interface UserStatsState {
  // İstatistik hesaplama fonksiyonları
  calculateStreakDays: () => number;
  calculateTotalLogsCount: () => number;
  
  // Diğer istatistik fonksiyonları burada eklenebilir
}

export const useUserStatsStore = create<UserStatsState>(() => ({
  
  // Kullanıcının kaç gün aralıksız giriş yaptığını hesapla
  calculateStreakDays: () => {
    const foods = useFoodStore.getState().foods;
    const activities = useActivityStore.getState().activities;
    
    if (foods.length === 0 && activities.length === 0) {
      return 0;
    }
    
    // Kullanıcının giriş yaptığı günleri topla
    const allEntryDates = [
      ...foods.map(food => food.date),
      ...activities.map(activity => activity.date)
    ];
    
    // Tarihleri benzersiz günlere dönüştür
    const uniqueDates = Array.from(new Set(
      allEntryDates.map(dateStr => {
        const date = new Date(dateStr);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      })
    ));
    
    // Tarihleri sırala (en yeniden en eskiye)
    const sortedDates = uniqueDates
      .map(dateStr => new Date(dateStr))
      .sort((a, b) => b.getTime() - a.getTime());
    
    // Eğer bugün veya dün giriş yoksa streak sıfır
    const today = new Date();
    const yesterday = subDays(today, 1);
    
    const hasEntryTodayOrYesterday = sortedDates.some(date => 
      isSameDay(date, today) || isSameDay(date, yesterday)
    );
    
    if (!hasEntryTodayOrYesterday) {
      return 0;
    }
    
    // Streak hesaplama
    let streakCount = 1;
    let currentDate = sortedDates[0];
    
    for (let i = 1; i < sortedDates.length; i++) {
      const nextDate = sortedDates[i];
      const dayDifference = differenceInDays(currentDate, nextDate);
      
      if (dayDifference === 1) {
        // Ardışık günler
        streakCount++;
        currentDate = nextDate;
      } else if (dayDifference > 1) {
        // Streak kırıldı
        break;
      }
    }
    
    return streakCount;
  },
  
  // Toplam kayıt sayısını hesapla
  calculateTotalLogsCount: () => {
    const foodCount = useFoodStore.getState().foods.length;
    const activityCount = useActivityStore.getState().activities.length;
    
    return foodCount + activityCount;
  }
})); 