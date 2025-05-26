import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Divider, SegmentedButtons, useTheme, MD3Theme, Card } from 'react-native-paper';
import { useFoodStore } from '../store/foodStore';
import { useActivityStore } from '../store/activityStore';
import { useCalorieGoalStore } from '../store/calorieGoalStore';
import NutritionChart from '../components/NutritionChart';
import { format, subDays, isSameDay, startOfWeek, addDays, eachDayOfInterval, endOfWeek } from 'date-fns';
import { enUS } from 'date-fns/locale';

type TimeRange = 'day' | 'week' | 'month';

// Grafik veri tipi
interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity?: number) => string;
    withDots?: boolean;
  }[];
}

const StatsScreen = () => {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const [weeklyData, setWeeklyData] = useState<ChartData>({ 
    labels: [], 
    datasets: [{ data: [] }] 
  });
  const [monthlyData, setMonthlyData] = useState<ChartData>({ 
    labels: [], 
    datasets: [{ data: [] }] 
  });
  
  const { calculateDailyNutrients, calculateDailyCalories, foods } = useFoodStore();
  const { calculateDailyBurnedCalories, activities } = useActivityStore();
  const { calorieGoal, nutrientGoals } = useCalorieGoalStore();
  
  // Günlük besin değerlerini hesapla
  const dailyNutrients = calculateDailyNutrients(selectedDate.toISOString());
  const foodCalories = calculateDailyCalories(selectedDate.toISOString());
  const burnedCalories = calculateDailyBurnedCalories(selectedDate.toISOString());
  const netCalories = foodCalories - burnedCalories;
  
  // Haftalık besin değerlerini hesapla
  const calculateWeeklyNutrients = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFoodCalories = 0;
    let totalBurnedCalories = 0;
    
    for (let i = 0; i < 7; i++) {
      const currentDay = addDays(weekStart, i);
      const dayNutrients = calculateDailyNutrients(currentDay.toISOString());
      totalProtein += dayNutrients.protein;
      totalCarbs += dayNutrients.carbs;
      totalFat += dayNutrients.fat;
      totalFoodCalories += calculateDailyCalories(currentDay.toISOString());
      totalBurnedCalories += calculateDailyBurnedCalories(currentDay.toISOString());
    }
    
    return {
      nutrients: {
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat
      },
      calories: {
        food: totalFoodCalories,
        burned: totalBurnedCalories,
        net: totalFoodCalories - totalBurnedCalories
      }
    };
  };
  
  // Aylık besin değerlerini hesapla
  const calculateMonthlyNutrients = () => {
    const today = new Date();
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFoodCalories = 0;
    let totalBurnedCalories = 0;
    
    // Son 30 gün
    for (let i = 0; i < 30; i++) {
      const currentDay = subDays(today, i);
      const dayNutrients = calculateDailyNutrients(currentDay.toISOString());
      totalProtein += dayNutrients.protein;
      totalCarbs += dayNutrients.carbs;
      totalFat += dayNutrients.fat;
      totalFoodCalories += calculateDailyCalories(currentDay.toISOString());
      totalBurnedCalories += calculateDailyBurnedCalories(currentDay.toISOString());
    }
    
    return {
      nutrients: {
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat
      },
      calories: {
        food: totalFoodCalories,
        burned: totalBurnedCalories,
        net: totalFoodCalories - totalBurnedCalories
      }
    };
  };
  
  // Seçili haftanın günlük kalori verilerini hazırla
  useEffect(() => {
    // Haftalık veri
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const weekCalories = daysInWeek.map(day => {
      return calculateDailyCalories(day.toISOString());
    });
    
    const weekDays = daysInWeek.map(day => format(day, 'EEE', { locale: enUS }));
    
    setWeeklyData({
      labels: weekDays,
      datasets: [
        {
          data: weekCalories,
          color: (opacity = 1) => theme.colors.primary,
        },
        {
          data: Array(7).fill(calorieGoal),
          color: (opacity = 1) => `rgba(${theme.colors.error.replace(/[^\d,]/g, '')}, ${opacity})`,
          withDots: false
        }
      ]
    });
    
    // Aylık veri (son 4 hafta)
    const monthData = [];
    const monthLabels = [];
    for (let i = 0; i < 4; i++) {
      const weekStartDate = subDays(weekStart, i * 7);
      const weekEndDate = subDays(weekEnd, i * 7);
      const daysInThisWeek = eachDayOfInterval({ start: weekStartDate, end: weekEndDate });
      
      const weekTotalCalories = daysInThisWeek.reduce((total, day) => {
        return total + calculateDailyCalories(day.toISOString());
      }, 0);
      
      const weekAvgCalories = weekTotalCalories / 7;
      
      monthData.unshift(weekAvgCalories);
      monthLabels.unshift(`H${i+1}`);
    }
    
    setMonthlyData({
      labels: monthLabels,
      datasets: [
        {
          data: monthData,
          color: (opacity = 1) => theme.colors.primary
        },
        {
          data: Array(4).fill(calorieGoal),
          color: (opacity = 1) => `rgba(${theme.colors.error.replace(/[^\d,]/g, '')}, ${opacity})`,
          withDots: false
        }
      ]
    });
  }, [selectedDate, timeRange, foods, calorieGoal, theme.colors.primary, theme.colors.error]);
  
  // Seçilen zaman aralığına göre besin değerlerini getir
  const getNutrients = () => {
    switch (timeRange) {
      case 'day':
        return {
          nutrients: dailyNutrients,
          calories: {
            food: foodCalories,
            burned: burnedCalories,
            net: netCalories
          }
        };
      case 'week':
        return calculateWeeklyNutrients();
      case 'month':
        return calculateMonthlyNutrients();
      default:
        return {
          nutrients: dailyNutrients,
          calories: {
            food: foodCalories,
            burned: burnedCalories,
            net: netCalories
          }
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
        return format(selectedDate, 'd MMMM yyyy', { locale: enUS });
      case 'week':
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const weekEnd = addDays(weekStart, 6);
        return `${format(weekStart, 'd MMM', { locale: enUS })} - ${format(weekEnd, 'd MMM', { locale: enUS })}`;
      case 'month':
        return 'Son 30 Gün';
      default:
        return format(selectedDate, 'd MMMM yyyy', { locale: enUS });
    }
  };

  // Hedef yüzdesini hesapla
  const calculateGoalPercentage = () => {
    if (calorieGoal === 0) return 0;
    const percentage = (calories.food / (timeRange === 'day' ? calorieGoal : timeRange === 'week' ? calorieGoal * 7 : calorieGoal * 30)) * 100;
    return Math.min(percentage, 100);
  };

  // Hedef durumunu metin olarak göster
  const getGoalStatus = () => {
    const percentage = calculateGoalPercentage();
    if (percentage >= 90 && percentage <= 110) {
      return { text: 'In the goal', color: theme.colors.primary };
    } else if (percentage < 90) {
      return { text: 'Below the goal', color: theme.colors.error };
    } else {
      return { text: 'Above the goal', color: theme.colors.error };
    }
  };
  
  const goalStatus = getGoalStatus();

  const renderWeeklyChart = () => {
    return (
      <View style={styles.alternativeChart}>
        <Text style={styles.chartTitle}>Weekly Calories Tracking</Text>
        {weeklyData.datasets[0].data.map((value, index) => (
          <View key={index} style={styles.chartItemRow}>
            <Text style={styles.chartDay}>{weeklyData.labels[index]}</Text>
            <View style={styles.chartBarContainer}>
              <View 
                style={[
                  styles.chartBar, 
                  { 
                    width: `${(value / calorieGoal) * 100}%`,
                    backgroundColor: value > calorieGoal ? theme.colors.error : theme.colors.primary
                  }
                ]} 
              />
            </View>
            <Text style={styles.chartValue}>{Math.round(value)} kcal</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderMonthlyChart = () => {
    return (
      <View style={styles.alternativeChart}>
        <Text style={styles.chartTitle}>Monthly Average Calories Change</Text>
        {monthlyData.datasets[0].data.map((value, index) => (
          <View key={index} style={styles.chartItemRow}>
            <Text style={styles.chartDay}>{monthlyData.labels[index]}</Text>
            <View style={styles.chartBarContainer}>
              <View 
                style={[
                  styles.chartBar, 
                  { 
                    width: `${(value / calorieGoal) * 100}%`,
                    backgroundColor: value > calorieGoal ? theme.colors.error : theme.colors.primary
                  }
                ]} 
              />
            </View>
            <Text style={styles.chartValue}>{Math.round(value)} kcal</Text>
          </View>
        ))}
      </View>
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Statistics</Text>
      
      <SegmentedButtons
        value={timeRange}
        onValueChange={(value) => setTimeRange(value as TimeRange)}
        buttons={[
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' }
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
      
      <Card style={styles.summaryContainer}>
        <View style={styles.summaryContent}>
          <View style={styles.calorieDetailsContainer}>
            <View style={styles.calorieItem}>
              <Text style={styles.summaryTitle}>Consumed Calories</Text>
              <Text style={styles.calorieValue}>{Math.round(calories.food)} kcal</Text>
            </View>
            <View style={styles.calorieItem}>
              <Text style={styles.summaryTitle}>Burned Calories</Text>
              <Text style={styles.calorieValue}>{Math.round(calories.burned)} kcal</Text>
            </View>
            <View style={styles.calorieItem}>
              <Text style={styles.summaryTitle}>Net Calories</Text>
              <Text style={styles.calorieValue}>{Math.round(calories.net)} kcal</Text>
            </View>
          </View>
          
          <View style={styles.goalStatusContainer}>
            <Text style={styles.goalLabel}>Goal: {timeRange === 'day' ? calorieGoal : timeRange === 'week' ? calorieGoal * 7 : calorieGoal * 30} kcal</Text>
            <Text style={[styles.goalStatus, { color: goalStatus.color }]}>
              {goalStatus.text}
            </Text>
          </View>
        </View>
      </Card>
      
      <Divider style={styles.divider} />
      
      <Card style={styles.chartCard}>
        <NutritionChart data={nutrients} />
      </Card>
      
      {timeRange === 'week' && (
        <Card style={styles.chartCard}>
          {renderWeeklyChart()}
        </Card>
      )}
      
      {timeRange === 'month' && (
        <Card style={styles.chartCard}>
          {renderMonthlyChart()}
        </Card>
      )}
      
      <View style={styles.statsDetail}>
        <Text style={styles.statsTitle}>Detailed Statistics</Text>
        
        <View style={styles.statsItem}>
          <Text style={styles.statsLabel}>Total Protein:</Text>
          <View style={styles.statsValueContainer}>
            <Text style={styles.statsValue}>{nutrients.protein.toFixed(1)}g</Text>
            <Text style={styles.statsGoal}>
              (Goal: {timeRange === 'day' ? nutrientGoals.protein : 
                      timeRange === 'week' ? nutrientGoals.protein * 7 : 
                      nutrientGoals.protein * 30}g)
            </Text>
          </View>
        </View>
        
        <View style={styles.statsItem}>
          <Text style={styles.statsLabel}>Total Carbohydrates:</Text>
          <View style={styles.statsValueContainer}>
            <Text style={styles.statsValue}>{nutrients.carbs.toFixed(1)}g</Text>
            <Text style={styles.statsGoal}>
              (Goal: {timeRange === 'day' ? nutrientGoals.carbs : 
                      timeRange === 'week' ? nutrientGoals.carbs * 7 : 
                      nutrientGoals.carbs * 30}g)
            </Text>
          </View>
        </View>
        
        <View style={styles.statsItem}>
          <Text style={styles.statsLabel}>Total Fat:</Text>
          <View style={styles.statsValueContainer}>
            <Text style={styles.statsValue}>{nutrients.fat.toFixed(1)}g</Text>
            <Text style={styles.statsGoal}>
              (Goal: {timeRange === 'day' ? nutrientGoals.fat : 
                      timeRange === 'week' ? nutrientGoals.fat * 7 : 
                      nutrientGoals.fat * 30}g)
            </Text>
          </View>
        </View>
        
        {timeRange !== 'day' && (
          <View style={styles.statsItem}>
            <Text style={styles.statsLabel}>Daily Average Calories:</Text>
            <Text style={styles.statsValue}>
              {Math.round(calories.food / (timeRange === 'week' ? 7 : 30))} kcal
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: theme.colors.onBackground,
  },
  segmentedButtons: {
    marginBottom: 20,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateNavButton: {
    fontSize: 24,
    color: theme.colors.primary,
    fontWeight: 'bold',
    padding: 10,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onBackground,
  },
  summaryContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: theme.colors.surface,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calorieDetailsContainer: {
    flex: 1,
    marginRight: 10,
  },
  calorieItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 16,
    color: theme.colors.onSurface,
    opacity: 0.8,
  },
  calorieValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'right',
  },
  goalStatusContainer: {
    alignItems: 'flex-end',
  },
  goalLabel: {
    fontSize: 14,
    color: theme.colors.onSurface,
    opacity: 0.7,
  },
  goalStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  divider: {
    marginVertical: 16,
  },
  chartCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: theme.colors.surface,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: theme.colors.onSurface,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsDetail: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: theme.colors.onSurface,
  },
  statsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsLabel: {
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  statsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statsValueContainer: {
    alignItems: 'flex-end',
  },
  statsGoal: {
    fontSize: 12,
    color: theme.colors.onSurface,
    opacity: 0.7,
  },
  alternativeChart: {
    padding: 8,
  },
  chartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartDay: {
    width: 40,
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  chartBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 10,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  chartBar: {
    height: '100%',
    borderRadius: 10,
  },
  chartValue: {
    width: 80,
    fontSize: 14,
    textAlign: 'right',
    color: theme.colors.onSurface,
  },
});

export default StatsScreen; 