import React, { useEffect, useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import { theme, toggleTheme, LightTheme, DarkTheme } from './src/constants/theme';
import { useFoodStore } from './src/store/foodStore';
import { useThemeStore } from './src/store/themeStore';

// Tema uygulanmış ve veri yükleme mantığı içeren uygulama
export default function App() {
  // Sistem temasını al
  const colorScheme = useColorScheme();
  const [currentTheme, setCurrentTheme] = useState(theme);
  
  // Tema tercihleri ve yükleme
  const { 
    isDarkMode, 
    isSystemTheme,
    loadThemePreference 
  } = useThemeStore();
  
  // Uygulamanın ilk başlatılmasında verileri yükle
  const loadFoods = useFoodStore(state => state.loadFoods);
  
  useEffect(() => {
    // Verileri ve tercihleri yükleme
    loadFoods();
    loadThemePreference();
  }, [loadFoods, loadThemePreference]);

  // Tema değişikliklerini takip etme
  useEffect(() => {
    // Sistem teması kullanılıyorsa
    if (isSystemTheme) {
      const newTheme = colorScheme === 'dark' ? DarkTheme : LightTheme;
      setCurrentTheme(newTheme);
    }
    // Kullanıcı tercihi kullanılıyorsa
    else {
      const newTheme = isDarkMode ? DarkTheme : LightTheme;
      setCurrentTheme(newTheme);
    }
  }, [isDarkMode, isSystemTheme, colorScheme]);

  return (
    <PaperProvider theme={currentTheme}>
      <NavigationContainer>
        <AppNavigator />
        <StatusBar 
          barStyle={(isSystemTheme ? colorScheme === 'dark' : isDarkMode) ? 'light-content' : 'dark-content'} 
          backgroundColor={currentTheme.colors.surface} 
        />
      </NavigationContainer>
    </PaperProvider>
  );
}
