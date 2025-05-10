import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, StatusBar, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import HomeScreen from '../screens/HomeScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import FoodEntryScreen from '../screens/FoodEntryScreen';
import DailySummaryScreen from '../screens/DailySummaryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ThemeSettingsScreen from '../screens/ThemeSettingsScreen';

// Stack navigator tipini tanımlıyoruz
export type RootStackParamList = {
  'Ana Sayfa': undefined;
  'Login': undefined;
  'Register': undefined;
  'FoodEntry': undefined;
  'DailySummary': undefined;
  'Profile': undefined;
  'ThemeSettings': undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  // Tema renklerini al
  const theme = useTheme();
  
  // Basit bir statusBar yüksekliği hesaplama
  const statusBarHeight = StatusBar.currentHeight || 0;
  
  const screenOptions = {
    headerTitleAlign: 'center' as const,
    headerStyle: {
      backgroundColor: theme.colors.surface,
    },
    headerTitleStyle: {
      fontWeight: 'bold' as const,
      color: theme.colors.onSurface,
    },
    // Status bar ile çakışma olmasın diye
    contentStyle: {
      paddingTop: Platform.OS === 'android' ? statusBarHeight : 0,
      backgroundColor: theme.colors.background,
    }
  };
  
  return (
    <Stack.Navigator 
      initialRouteName="Ana Sayfa"
      id={undefined}
    >
      <Stack.Screen 
        name="Ana Sayfa" 
        component={HomeScreen}
        options={{
          ...screenOptions,
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          ...screenOptions,
          title: 'Giriş Yap'
        }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{
          ...screenOptions,
          title: 'Kayıt Ol'
        }}
      />
      <Stack.Screen 
        name="FoodEntry" 
        component={FoodEntryScreen}
        options={{
          ...screenOptions,
          title: 'Yemek Ekle'
        }}
      />
      <Stack.Screen 
        name="DailySummary" 
        component={DailySummaryScreen}
        options={{
          ...screenOptions,
          title: 'Günlük Özet'
        }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          ...screenOptions,
          title: 'Profil'
        }}
      />
      <Stack.Screen 
        name="ThemeSettings" 
        component={ThemeSettingsScreen}
        options={{
          ...screenOptions,
          title: 'Tema Ayarları'
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator; 