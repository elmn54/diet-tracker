import React, { useEffect, useState } from 'react';
import { StatusBar, useColorScheme, AppState, AppStateStatus } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import { toggleTheme, LightTheme, DarkTheme } from './src/constants/theme';
import { useFoodStore } from './src/store/foodStore';
import { useThemeStore } from './src/store/themeStore';
import { useApiKeyStore } from './src/store/apiKeyStore';
import { useSubscriptionStore } from './src/store/subscriptionStore';
import { useCalorieGoalStore } from './src/store/calorieGoalStore';
import { useUIStore } from './src/store/uiStore';
import Toast from './src/components/Toast';
import CustomAlert from './src/components/CustomAlert';

// Tema uygulanmış ve veri yükleme mantığı içeren uygulama
export default function App() {
  // Sistem temasını al
  const colorScheme = useColorScheme();
  const [currentTheme, setCurrentTheme] = useState(colorScheme === 'dark' ? DarkTheme : LightTheme);
  
  // Tema tercihleri ve yükleme
  const { 
    isDarkMode, 
    isSystemTheme,
    loadThemePreference,
    setIsDarkMode
  } = useThemeStore();
  
  // UI state
  const { 
    toast, 
    alert, 
    hideToast, 
    hideAlert 
  } = useUIStore();
  
  // Uygulamanın ilk başlatılmasında verileri yükle
  const loadFoods = useFoodStore(state => state.loadFoods);
  const loadApiKeys = useApiKeyStore(state => state.loadApiKeys);
  const loadGoals = useCalorieGoalStore(state => state.loadGoals);
  
  // AppState değişikliklerini izlemek için
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isSystemTheme) {
        // Uygulama aktif olduğunda ve sistem teması kullanılıyorsa
        // Sistemi kontrol et ve tema güncellenmesi gerekiyorsa güncelle
        const systemIsDark = colorScheme === 'dark';
        if (isDarkMode !== systemIsDark) {
          setIsDarkMode(systemIsDark);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isSystemTheme, colorScheme, isDarkMode, setIsDarkMode]);
  
  // Verileri yükleme
  useEffect(() => {
    loadFoods();
    loadThemePreference();
    loadApiKeys();
    loadGoals();
  }, [loadFoods, loadThemePreference, loadApiKeys, loadGoals]);

  // Tema değişikliklerini takip etme
  useEffect(() => {
    if (isSystemTheme) {
      // Sistem teması kullanılıyorsa, sistem temasını kontrol et
      const systemIsDark = colorScheme === 'dark';
      
      // Eğer mevcut tema sistem temasından farklıysa güncelle
      if (isDarkMode !== systemIsDark) {
        setIsDarkMode(systemIsDark);
      }
      
      // Tema nesnesini güncelle
      setCurrentTheme(systemIsDark ? DarkTheme : LightTheme);
    } else {
      // Kullanıcı tercihini kullan
      setCurrentTheme(isDarkMode ? DarkTheme : LightTheme);
    }
  }, [isDarkMode, isSystemTheme, colorScheme, setIsDarkMode]);

  return (
    <PaperProvider theme={currentTheme}>
      <NavigationContainer>
        <AppNavigator />
        <StatusBar 
          barStyle={(isSystemTheme ? colorScheme === 'dark' : isDarkMode) ? 'light-content' : 'dark-content'} 
          backgroundColor={currentTheme.colors.background}
          translucent
        />
        
        {/* Global Toast bildirimi */}
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onDismiss={hideToast}
        />
        
        {/* Global Alert bildirimi */}
        <CustomAlert
          visible={alert.visible}
          title={alert.title}
          message={alert.message}
          type={alert.type}
          buttons={alert.buttons}
          onDismiss={hideAlert}
        />
      </NavigationContainer>
    </PaperProvider>
  );
}
