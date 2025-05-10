import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useFoodStore } from '../store/foodStore';
import { useTheme } from 'react-native-paper';
import WeeklyCalendar from '../components/WeeklyCalendar';
import CaloriesCard from '../components/CaloriesCard';
import MacrosCard from '../components/MacrosCard';
import FoodEntryBar from '../components/FoodEntryBar';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Ana Sayfa'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const theme = useTheme();
  
  const styles = makeStyles(theme.colors);
  
  const { calculateDailyCalories, calculateDailyNutrients } = useFoodStore();
  
  // Seçilen günün değerlerini hesapla
  const dailyCalories = calculateDailyCalories(selectedDate.toISOString());
  const dailyNutrients = calculateDailyNutrients(selectedDate.toISOString());
  
  // Sabit değerler (ileride kullanıcı profilinden gelebilir)
  const calorieGoal = 1500;
  const remainingCalories = Math.max(0, calorieGoal - dailyCalories);
  
  // Makro besin hedefleri
  const carbsGoal = 180;
  const proteinGoal = 102;
  const fatGoal = 42;

  // Tema ayarları sayfasına git
  const handleOpenThemeSettings = () => {
    navigation.navigate('ThemeSettings');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.background}
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
      />
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Ana Sayfa</Text>
      </View>
      
      <View style={styles.todayContainer}>
        <Text style={styles.todayText}>Today</Text>
        <TouchableOpacity 
          style={styles.themeIconContainer}
          onPress={handleOpenThemeSettings}
        >
          <Text style={styles.themeIcon}>{theme.dark ? '🌙' : '☀️'}</Text>
        </TouchableOpacity>
      </View>
      
      <WeeklyCalendar 
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
      
      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <View style={styles.cardsContainer}>
          <CaloriesCard 
            food={dailyCalories}
            exercise={0} // Egzersiz kalorisi henüz eklenmiyor
            remaining={remainingCalories}
          />
          
          <MacrosCard 
            carbs={{ current: dailyNutrients.carbs, goal: carbsGoal }}
            protein={{ current: dailyNutrients.protein, goal: proteinGoal }}
            fat={{ current: dailyNutrients.fat, goal: fatGoal }}
          />
        </View>
        
        {/* Buraya eklenen yemekler listelenebilir */}
        <View style={styles.foodListContainer}>
          {/* Yemek listesi bileşenleri */}
        </View>
      </ScrollView>
      
      <FoodEntryBar />
    </SafeAreaView>
  );
};

const makeStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  todayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  todayText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  themeIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  themeIcon: {
    fontSize: 24,
  },
  scrollContent: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContentContainer: {
    paddingBottom: 80, // FoodEntryBar için boşluk
  },
  cardsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  foodListContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
});

export default HomeScreen; 