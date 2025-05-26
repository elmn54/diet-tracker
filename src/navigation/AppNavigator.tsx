import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, StatusBar, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import HomeScreen from '../screens/HomeScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import FoodEntryScreen from '../screens/FoodEntryScreen';
import ActivityEntryScreen from '../screens/ActivityEntryScreen';
import DailySummaryScreen from '../screens/DailySummaryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ThemeSettingsScreen from '../screens/ThemeSettingsScreen';
import StatsScreen from '../screens/StatsScreen';
import ApiSettingsScreen from '../screens/ApiSettingsScreen';
import PricingScreen from '../screens/PricingScreen';
import CalorieGoalScreen from '../screens/CalorieGoalScreen';
import CalorieCalculatorScreen from '../screens/CalorieCalculatorScreen';
import PaymentScreen from '../screens/PaymentScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';
import PaymentFailureScreen from '../screens/PaymentFailureScreen';
import { spacing } from '../constants/theme';
import { ActivityItem } from '../types/activity';
import { useAuth } from '../context/AuthContext';

// Stack navigator tipini tanımlıyoruz
export type RootStackParamList = {
  'Ana Sayfa': undefined;
  'Login': undefined;
  'Register': undefined;
  'ForgotPassword': undefined;
  'FoodEntry': { 
    editMode?: boolean; 
    foodItem?: {
      id: string;
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      date: string;
      mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      imageUri?: string;
    };
    openCamera?: boolean;
    openGallery?: boolean;
    selectedDate?: Date;
    fromTextInput?: boolean;
  } | undefined;
  'ActivityEntry': {
    editMode?: boolean;
    activityItem?: ActivityItem;
    selectedDate?: Date;
  } | undefined;
  'DailySummary': undefined;
  'Profile': undefined;
  'ThemeSettings': undefined;
  'Stats': undefined;
  'ApiSettings': undefined;
  'Pricing': undefined;
  'CalorieGoal': undefined;
  'CalorieCalculator': {
    onCalculate?: (calories: number) => void;
  };
  'Payment': { 
    planId: string;
    planName: string;
    price: number;
  };
  'PaymentSuccess': {
    planId: string;
    transactionId: string;
  };
  'PaymentFailure': {
    error: string;
    planId?: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  // Tema renklerini al
  const theme = useTheme();
  // Kullanıcı oturum durumunu al
  const { user, isLoading } = useAuth();
  
  // Basit bir statusBar yüksekliği hesaplama
  const statusBarHeight = StatusBar.currentHeight || 0;
  
  const screenOptions = {
    headerTitleAlign: 'center' as const,
    headerStyle: {
      backgroundColor: theme.colors.background,
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

  // Kullanıcı yükleniyor ise boş sayfa göster
  if (isLoading) {
    return null;
  }
  
  return (
    <Stack.Navigator 
      initialRouteName={user ? "Ana Sayfa" : "Login"}
      id={undefined}
    >
      {user ? (
        // Kullanıcı oturum açmış ise Ana Uygulama Ekranları
        <>
          <Stack.Screen 
            name="Ana Sayfa" 
            component={HomeScreen}
            options={{
              ...screenOptions,
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="FoodEntry" 
            component={FoodEntryScreen}
            options={({ route }) => ({
              ...screenOptions,
              title: route.params?.editMode ? 'Edit Food' : 'Add Food'
            })}
          />
          <Stack.Screen 
            name="ActivityEntry" 
            component={ActivityEntryScreen}
            options={({ route }) => ({
              ...screenOptions,
              title: route.params?.editMode ? 'Edit Activity' : 'Add Activity'
            })}
          />
          <Stack.Screen 
            name="DailySummary" 
            component={DailySummaryScreen}
            options={{
              ...screenOptions,
              title: 'Günlük Özet',
              contentStyle: {
                ...screenOptions.contentStyle,
                paddingTop: spacing.s,
              }
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
          <Stack.Screen 
            name="Stats" 
            component={StatsScreen}
            options={{
              ...screenOptions,
              title: '',
              contentStyle: {
                ...screenOptions.contentStyle,
                paddingTop: 0,
              }
            }}
          />
          <Stack.Screen 
            name="ApiSettings" 
            component={ApiSettingsScreen}
            options={{
              ...screenOptions,
              title: '',
              contentStyle: {
                ...screenOptions.contentStyle,
                paddingTop: 0,
              }
            }}
          />
          <Stack.Screen 
            name="Pricing" 
            component={PricingScreen}
            options={{
              ...screenOptions,
              title: 'Abonelik Planları',
              contentStyle: {
                ...screenOptions.contentStyle,
                paddingTop: spacing.s,
              }
            }}
          />
          <Stack.Screen 
            name="CalorieGoal" 
            component={CalorieGoalScreen}
            options={{
              ...screenOptions,
              title: '',
              contentStyle: {
                ...screenOptions.contentStyle,
                paddingTop: spacing.s,
              }
            }}
          />
          <Stack.Screen 
            name="CalorieCalculator" 
            component={CalorieCalculatorScreen}
            options={{
              ...screenOptions,
              title: 'Kalori Hesaplayıcı',
              contentStyle: {
                ...screenOptions.contentStyle,
                paddingTop: spacing.s,
              }
            }}
          />
          <Stack.Screen 
            name="Payment" 
            component={PaymentScreen}
            options={{
              ...screenOptions,
              title: 'Ödeme',
              contentStyle: {
                ...screenOptions.contentStyle,
                paddingTop: spacing.s,
              }
            }}
          />
          <Stack.Screen 
            name="PaymentSuccess" 
            component={PaymentSuccessScreen}
            options={{
              ...screenOptions,
              title: 'Ödeme Başarılı',
              contentStyle: {
                ...screenOptions.contentStyle,
                paddingTop: spacing.s,
              }
            }}
          />
          <Stack.Screen 
            name="PaymentFailure" 
            component={PaymentFailureScreen}
            options={{
              ...screenOptions,
              title: 'Ödeme Başarısız',
              contentStyle: {
                ...screenOptions.contentStyle,
                paddingTop: spacing.s,
              }
            }}
          />
        </>
      ) : (
        // Kullanıcı oturum açmamış ise Kimlik Doğrulama Ekranları
        <>
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
            name="ForgotPassword" 
            component={ForgotPasswordScreen}
            options={{
              ...screenOptions,
              title: 'Şifremi Unuttum',
              contentStyle: {
                ...screenOptions.contentStyle,
                paddingTop: spacing.s,
              }
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator; 