import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toggleTheme } from '../constants/theme';

interface ThemeState {
  isDarkMode: boolean;
  
  // Eylemler
  toggleDarkMode: () => Promise<void>;
  setIsDarkMode: (isDark: boolean) => Promise<void>;
  loadThemePreference: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDarkMode: true, // Varsayılan olarak dark mode
  
  // Karanlık mod durumunu tersine çevirme
  toggleDarkMode: async () => {
    const newValue = !get().isDarkMode;
    set({ 
      isDarkMode: newValue
    });
    
    // Tercihi kaydet
    await AsyncStorage.setItem('isDarkMode', JSON.stringify(newValue));
    
    // Temayı güncelle
    toggleTheme(newValue);
    
    console.log(`toggleDarkMode - yeni değer: ${newValue ? 'dark' : 'light'}`);
    return Promise.resolve();
  },
  
  // Dark mode doğrudan ayarlama
  setIsDarkMode: async (isDark: boolean) => {
    set({ isDarkMode: isDark });
    await AsyncStorage.setItem('isDarkMode', JSON.stringify(isDark));
    toggleTheme(isDark);
    console.log(`setIsDarkMode - yeni değer: ${isDark ? 'dark' : 'light'}`);
    return Promise.resolve();
  },
  
  // Tema tercihlerini yükleme
  loadThemePreference: async () => {
    try {
      const storedDarkMode = await AsyncStorage.getItem('isDarkMode');
      
      // Kayıtlı değer varsa kullan, yoksa varsayılan dark mode
      const isDarkModeValue = storedDarkMode ? JSON.parse(storedDarkMode) : true;
      
      // Kullanıcı tercihi kullan
      set({
        isDarkMode: isDarkModeValue
      });
      
      // Temayı güncelle
      toggleTheme(isDarkModeValue);
      
      console.log(`Tema tercihi yüklendi: ${isDarkModeValue ? 'dark' : 'light'}`);
    } catch (error) {
      console.error('Tema tercihleri yüklenirken hata oluştu:', error);
      // Hata durumunda varsayılan dark mode
      set({ isDarkMode: true });
      toggleTheme(true);
    }
    
    return Promise.resolve();
  }
})); 