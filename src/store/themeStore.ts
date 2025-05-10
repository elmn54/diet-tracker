import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toggleTheme } from '../constants/theme';

interface ThemeState {
  isDarkMode: boolean;
  isSystemTheme: boolean;
  
  // Eylemler
  toggleDarkMode: () => Promise<void>;
  setUseSystemTheme: (useSystem: boolean) => Promise<void>;
  setIsDarkMode: (isDark: boolean) => Promise<void>;
  loadThemePreference: () => Promise<void>;
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
    
    // Temayı güncelle
    toggleTheme(newValue);
    
    return Promise.resolve();
  },
  
  // Dark mode doğrudan ayarlama
  setIsDarkMode: async (isDark: boolean) => {
    set({ isDarkMode: isDark });
    await AsyncStorage.setItem('isDarkMode', JSON.stringify(isDark));
    toggleTheme(isDark);
    return Promise.resolve();
  },
  
  // Sistem temasını kullanma ayarı
  setUseSystemTheme: async (useSystem: boolean) => {
    set({ 
      isSystemTheme: useSystem
    });
    
    // Tercihleri kaydet
    await AsyncStorage.setItem('isSystemTheme', JSON.stringify(useSystem));
    
    return Promise.resolve();
  },
  
  // Tema tercihlerini yükleme
  loadThemePreference: async () => {
    try {
      const storedDarkMode = await AsyncStorage.getItem('isDarkMode');
      const storedSystemTheme = await AsyncStorage.getItem('isSystemTheme');
      
      const isSystemThemeValue = storedSystemTheme ? JSON.parse(storedSystemTheme) : true;
      const isDarkModeValue = storedDarkMode ? JSON.parse(storedDarkMode) : false;
      
      set({
        isDarkMode: isDarkModeValue,
        isSystemTheme: isSystemThemeValue
      });
      
      // Temayı güncelle (bu App.tsx'te yapılacak)
      toggleTheme(isDarkModeValue);
    } catch (error) {
      console.error('Tema tercihleri yüklenirken hata oluştu:', error);
    }
    
    return Promise.resolve();
  }
})); 