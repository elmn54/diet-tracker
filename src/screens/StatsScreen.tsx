import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Divider, SegmentedButtons, useTheme, MD3Theme } from 'react-native-paper';
import { useFoodStore } from '../store/foodStore';
import NutritionChart from '../components/NutritionChart';
import { format, subDays, isSameDay, startOfWeek, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';

type TimeRange = 'day' | 'week' | 'month';

const StatsScreen = () => {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  
  const { calculateDailyNutrients, calculateDailyCalories, foods } = useFoodStore();
  
  // Günlük besin değerlerini hesapla
  const dailyNutrients = calculateDailyNutrients(selectedDate.toISOString());
  const dailyCalories = calculateDailyCalories(selectedDate.toISOString());
  
  // Haftalık besin değerlerini hesapla
  const calculateWeeklyNutrients = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalCalories = 0;
    
    for (let i = 0; i < 7; i++) {
      const currentDay = addDays(weekStart, i);
      const dayNutrients = calculateDailyNutrients(currentDay.toISOString());
      totalProtein += dayNutrients.protein;
      totalCarbs += dayNutrients.carbs;
      totalFat += dayNutrients.fat;
      totalCalories += calculateDailyCalories(currentDay.toISOString());
    }
    
    return {
      nutrients: {
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat
      },
      calories: totalCalories
    };
  };
  
  // Aylık besin değerlerini hesapla
  const calculateMonthlyNutrients = () => {
    // Basit yaklaşım: Son 30 günü hesapla
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalCalories = 0;
    
    for (let i = 0; i < 30; i++) {
      const currentDay = subDays(new Date(), i);
      const dayNutrients = calculateDailyNutrients(currentDay.toISOString());
      totalProtein += dayNutrients.protein;
      totalCarbs += dayNutrients.carbs;
      totalFat += dayNutrients.fat;
      totalCalories += calculateDailyCalories(currentDay.toISOString());
    }
    
    return {
      nutrients: {
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat
      },
      calories: totalCalories
    };
  };
  
  // Seçilen zaman aralığına göre besin değerlerini getir
  const getNutrients = () => {
    switch (timeRange) {
      case 'day':
        return {
          nutrients: dailyNutrients,
          calories: dailyCalories
        };
      case 'week':
        return calculateWeeklyNutrients();
      case 'month':
        return calculateMonthlyNutrients();
      default:
        return {
          nutrients: dailyNutrients,
          calories: dailyCalories
        };
    }
  };
  
  const { nutrients, calories } = getNutrients();
  
  // Önceki güne git
  const goToPreviousDate = () => {
    setSelectedDate(prevDate => subDays(prevDate, 1));
  };
  
  // Sonraki güne git
  const goToNextDate = () => {
    const nextDate = addDays(selectedDate, 1);
    // Gelecekteki tarihlere gitmeyi engelle
    if (!isSameDay(nextDate, new Date()) && nextDate > new Date()) {
      return;
    }
    setSelectedDate(nextDate);
  };
  
  // Başlık metni oluştur
  const getTitle = () => {
    switch (timeRange) {
      case 'day':
        return format(selectedDate, 'd MMMM yyyy', { locale: tr });
      case 'week':
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const weekEnd = addDays(weekStart, 6);
        return `${format(weekStart, 'd MMM', { locale: tr })} - ${format(weekEnd, 'd MMM', { locale: tr })}`;
      case 'month':
        return 'Son 30 Gün';
      default:
        return format(selectedDate, 'd MMMM yyyy', { locale: tr });
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>İstatistikler</Text>
      
      <SegmentedButtons
        value={timeRange}
        onValueChange={(value) => setTimeRange(value as TimeRange)}
        buttons={[
          { value: 'day', label: 'Günlük' },
          { value: 'week', label: 'Haftalık' },
          { value: 'month', label: 'Aylık' }
        ]}
        style={styles.segmentedButtons}
      />
      
      {timeRange === 'day' && (
        <View style={styles.dateSelector}>
          <TouchableOpacity onPress={goToPreviousDate}>
            <Text style={styles.dateNavButton}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.dateTitle}>{getTitle()}</Text>
          <TouchableOpacity onPress={goToNextDate}>
            <Text style={styles.dateNavButton}>{'>'}</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Toplam Kalori</Text>
        <Text style={styles.calorieCount}>{Math.round(calories)} kcal</Text>
      </View>
      
      <Divider style={styles.divider} />
      
      <NutritionChart data={nutrients} />
      
      <View style={styles.statsDetail}>
        <Text style={styles.statsTitle}>Detaylı İstatistikler</Text>
        
        <View style={styles.statsItem}>
          <Text style={styles.statsLabel}>Toplam Protein:</Text>
          <Text style={styles.statsValue}>{nutrients.protein.toFixed(1)}g</Text>
        </View>
        
        <View style={styles.statsItem}>
          <Text style={styles.statsLabel}>Toplam Karbonhidrat:</Text>
          <Text style={styles.statsValue}>{nutrients.carbs.toFixed(1)}g</Text>
        </View>
        
        <View style={styles.statsItem}>
          <Text style={styles.statsLabel}>Toplam Yağ:</Text>
          <Text style={styles.statsValue}>{nutrients.fat.toFixed(1)}g</Text>
        </View>
        
        {timeRange !== 'day' && (
          <View style={styles.statsItem}>
            <Text style={styles.statsLabel}>Günlük Ortalama Kalori:</Text>
            <Text style={styles.statsValue}>
              {Math.round(calories / (timeRange === 'week' ? 7 : 30))} kcal
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.onBackground,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateNavButton: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    paddingHorizontal: 16,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onBackground,
  },
  summaryContainer: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    color: theme.colors.onPrimary,
    marginBottom: 8,
  },
  calorieCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.onPrimary,
  },
  divider: {
    marginVertical: 16,
  },
  statsDetail: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.onSurface,
  },
  statsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statsLabel: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
  },
  statsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
});

export default StatsScreen; 