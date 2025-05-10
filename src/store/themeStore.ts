import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toggleTheme } from '../constants/theme';

interface ThemeState {
  isDarkMode: boolean;
  isSystemTheme: boolean;
  
  // Eylemler
  toggleDarkMode: () => Promise<void>;
  setUseSystemTheme: (useSystem: boolean) => Promise<void>;
  loadThemePreference: () => Promise<void>;
  
  // Temayı döndüren yardımcı fonksiyon
  getTheme: () => any;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDarkMode: false,
  isSystemTheme: true,
  
  // Karanlık mod durumunu tersine çevirme
  toggleDarkMode: async () => {
    const newValue = !get().isDarkMode;
    set({ 
      isDarkMode: newValue,
      isSystemTheme: false 
    });
    
    // Tercihi kaydet
    await AsyncStorage.setItem('isDarkMode', JSON.stringify(newValue));
    await AsyncStorage.setItem('isSystemTheme', JSON.stringify(false));
    
    return Promise.resolve();
  },
  
  // Sistem temasını kullanma ayarı
  setUseSystemTheme: async (useSystem) => {
    set({ isSystemTheme: useSystem });
    await AsyncStorage.setItem('isSystemTheme', JSON.stringify(useSystem));
    return Promise.resolve();
  },
  
  // Tema tercihlerini yükleme
  loadThemePreference: async () => {
    try {
      const storedDarkMode = await AsyncStorage.getItem('isDarkMode');
      const storedSystemTheme = await AsyncStorage.getItem('isSystemTheme');
      
      set({
        isDarkMode: storedDarkMode ? JSON.parse(storedDarkMode) : false,
        isSystemTheme: storedSystemTheme ? JSON.parse(storedSystemTheme) : true,
      });
    } catch (error) {
      console.error('Tema tercihleri yüklenirken hata oluştu:', error);
    }
    
    return Promise.resolve();
  },
  
  // Mevcut duruma göre temayı döndürme
  getTheme: () => {
    return toggleTheme(get().isDarkMode);
  }
})); 