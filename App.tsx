import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { toggleTheme, LightTheme, DarkTheme } from './src/constants/theme';
import { useFoodStore } from './src/store/foodStore';
import { useActivityStore } from './src/store/activityStore';
import { useThemeStore } from './src/store/themeStore';
import { useApiKeyStore } from './src/store/apiKeyStore';
import { useSubscriptionStore } from './src/store/subscriptionStore';
import { useCalorieGoalStore } from './src/store/calorieGoalStore';
import { useUIStore } from './src/store/uiStore';
import Toast from './src/components/Toast';
import CustomAlert from './src/components/CustomAlert';
import { AuthProvider } from './src/context/AuthContext';
import GoogleAuthService from './src/firebase/google-auth';

// Initialize Google Auth service
GoogleAuthService.init();

// Tema uygulanmış ve veri yükleme mantığı içeren uygulama
export default function App() {
  // Tema tercihleri
  const { 
    isDarkMode,
    loadThemePreference
  } = useThemeStore();
  
  // Tema nesnesi state'i
  const [currentTheme, setCurrentTheme] = useState(isDarkMode ? DarkTheme : LightTheme);
  
  // UI state
  const { 
    toast, 
    alert, 
    hideToast, 
    hideAlert 
  } = useUIStore();
  
  // Uygulamanın ilk başlatılmasında verileri yükle
  const loadFoods = useFoodStore(state => state.loadFoods);
  const loadActivities = useActivityStore(state => state.loadActivities);
  const loadApiKeys = useApiKeyStore(state => state.loadApiKeys);
  const loadGoals = useCalorieGoalStore(state => state.loadGoals);
  
  // Verileri yükleme
  useEffect(() => {
    async function loadInitialData() {
      await loadFoods();
      await loadActivities();
      await loadThemePreference();
      await loadApiKeys();
      await loadGoals();
    }
    
    loadInitialData();
  }, []); // Sadece uygulama ilk açıldığında çalıştır
  
  // isDarkMode değişikliklerini izle ve tema nesnesini güncelle
  useEffect(() => {
    setCurrentTheme(isDarkMode ? DarkTheme : LightTheme);
  }, [isDarkMode]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <PaperProvider theme={currentTheme}>
        <AuthProvider>
          <NavigationContainer>
            <AppNavigator />
            <StatusBar 
              barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
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
        </AuthProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
