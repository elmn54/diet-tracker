import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Text, Divider, IconButton, FAB, useTheme, MD3Theme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFoodStore, FoodItem } from '../store/foodStore';
import { useCalorieGoalStore } from '../store/calorieGoalStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Card from '../components/Card';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { enUS } from 'date-fns/locale';

type DailySummaryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'DailySummary'>;

const DailySummaryScreen = () => {
  const navigation = useNavigation<DailySummaryScreenNavigationProp>();
  const [date, setDate] = useState(new Date());
  const [formattedDate, setFormattedDate] = useState('');
  const theme = useTheme();
  const styles = makeStyles(theme);
  
  const { 
    foods,
    calculateDailyCalories, 
    calculateDailyNutrients, 
    removeFood, 
    loadFoods,
    isLoading 
  } = useFoodStore(state => ({
    foods: state.foods,
    calculateDailyCalories: state.calculateDailyCalories,
    calculateDailyNutrients: state.calculateDailyNutrients,
    removeFood: state.removeFood,
    loadFoods: state.loadFoods,
    isLoading: state.isLoading
  }));

  const { calorieGoal, nutrientGoals } = useCalorieGoalStore();

  // İlk yüklemede verileri getir
  useEffect(() => {
    loadFoods();
  }, [loadFoods]);

  // Tarih formatını ayarla
  useEffect(() => {
    setFormattedDate(format(date, 'EEEE, d MMMM yyyy', { locale: enUS }));
  }, [date]);

  // Günlük toplam değerleri hesapla
  const dailyCalories = calculateDailyCalories(date.toISOString());
  const dailyNutrients = calculateDailyNutrients(date.toISOString());

  // Kalan kalori hesapla
  const remainingCalories = calorieGoal - dailyCalories;
  
  // Calories hedefi durumu
  const getCalorieStatus = () => {
    const percentage = (dailyCalories / calorieGoal) * 100;
    if (percentage < 80) {
      return { message: "You need to consume more calories to reach your goal", color: theme.colors.primary };
    } else if (percentage <= 100) {
      return { message: "You are getting closer to your goal, good job!", color: theme.colors.primary };
    } else if (percentage <= 110) {
      return { message: "You have reached your goal", color: theme.colors.tertiary };
    } else {
      return { message: "You have exceeded your calorie goal", color: theme.colors.error };
    }
  };
  
  const calorieStatus = getCalorieStatus();

  // Todayün yemeklerini filtrele
  const isSameDayFn = (dateString: string, targetDate: Date) => {
    const foodDate = new Date(dateString);
    return (
      foodDate.getFullYear() === targetDate.getFullYear() &&
      foodDate.getMonth() === targetDate.getMonth() &&
      foodDate.getDate() === targetDate.getDate()
    );
  };

  const todaysFoods = foods.filter(food => isSameDayFn(food.date, date));
  
  // Öğüne göre yemekleri grupla
  const foodsByMeal = {
    breakfast: todaysFoods.filter(food => food.mealType === 'breakfast'),
    lunch: todaysFoods.filter(food => food.mealType === 'lunch'),
    dinner: todaysFoods.filter(food => food.mealType === 'dinner'),
    snack: todaysFoods.filter(food => food.mealType === 'snack'),
  };

  // Öğün başına toplam kalorileri hesapla
  const mealCalories = {
    breakfast: foodsByMeal.breakfast.reduce((total, food) => total + food.calories, 0),
    lunch: foodsByMeal.lunch.reduce((total, food) => total + food.calories, 0),
    dinner: foodsByMeal.dinner.reduce((total, food) => total + food.calories, 0),
    snack: foodsByMeal.snack.reduce((total, food) => total + food.calories, 0),
  };

  // Önceki güne git
  const goToPreviousDay = () => {
    setDate(subDays(date, 1));
  };

  // Sonraki güne git
  const goToNextDay = () => {
    const nextDate = addDays(date, 1);
    // Gelecekteki tarihlere gitmeyi engelle
    if (isSameDay(nextDate, new Date()) || nextDate < new Date()) {
      setDate(nextDate);
    }
  };

  // Bugüne git
  const goToToday = () => {
    setDate(new Date());
  };

  // Yemek silme işlemi
  const handleDeleteFood = async (id: string) => {
    try {
      Alert.alert(
        'Delete Food',
        'Are you sure you want to delete this food?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            onPress: async () => {
              await removeFood(id);
            },
            style: 'destructive',
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Error deleting food:', error);
    }
  };

  // Öğün başlık adlarını Türkçeleştirme
  const mealTypeNames = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
  };

  // Yemek türüne göre emoji seçme
  const getFoodEmoji = (foodName: string) => {
    const lowerName = foodName.toLowerCase();
    
    if (lowerName.includes('pilav') || lowerName.includes('rice')) return '🍚';
    if (lowerName.includes('tavuk') || lowerName.includes('chicken')) return '🍗';
    if (lowerName.includes('balık') || lowerName.includes('fish')) return '🐟';
    if (lowerName.includes('pizza')) return '🍕';
    if (lowerName.includes('hamburger') || lowerName.includes('burger')) return '🍔';
    if (lowerName.includes('salata') || lowerName.includes('salad')) return '🥗';
    if (lowerName.includes('muz') || lowerName.includes('banana')) return '🍌';
    if (lowerName.includes('elma') || lowerName.includes('apple')) return '🍎';
    if (lowerName.includes('portakal') || lowerName.includes('orange')) return '🍊';
    if (lowerName.includes('çorba') || lowerName.includes('soup')) return '🍲';
    if (lowerName.includes('makarna') || lowerName.includes('pasta')) return '🍝';
    if (lowerName.includes('et') || lowerName.includes('meat')) return '🥩';
    if (lowerName.includes('yumurta') || lowerName.includes('egg')) return '🍳';
    if (lowerName.includes('süt') || lowerName.includes('milk')) return '🥛';
    if (lowerName.includes('ekmek') || lowerName.includes('bread')) return '🍞';
    if (lowerName.includes('çikolata') || lowerName.includes('chocolate')) return '🍫';
    if (lowerName.includes('dondurma') || lowerName.includes('ice cream')) return '🍦';
    if (lowerName.includes('kahve') || lowerName.includes('coffee')) return '☕';
    if (lowerName.includes('çay') || lowerName.includes('tea')) return '🍵';
    if (lowerName.includes('kek') || lowerName.includes('cake')) return '🍰';
    
    // Varsayılan
    return '🍽️';
  };

  // Öğün emoji'leri
  const mealTypeEmojis = {
    breakfast: '🍳',
    lunch: '🍲',
    dinner: '🍽️',
    snack: '🍌',
  };

  // Yemek kartı render fonksiyonu
  const renderFoodCard = (food: FoodItem) => (
    <Card key={food.id} style={styles.foodCard}>
      <Card.Content style={styles.foodCardContent}>
        <View style={styles.foodIconContainer}>
          <Text style={styles.foodIcon}>{getFoodEmoji(food.name)}</Text>
        </View>
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{food.name}</Text>
          <Text style={styles.calorieText}>{food.calories} kcal</Text>
        </View>
        <View style={styles.foodNutrients}>
          <Text style={styles.nutrientText}>P: {food.protein}g</Text>
          <Text style={styles.nutrientText}>K: {food.carbs}g</Text>
          <Text style={styles.nutrientText}>Y: {food.fat}g</Text>
        </View>
        <IconButton
          icon="delete"
          iconColor={theme.colors.error}
          size={20}
          onPress={() => handleDeleteFood(food.id)}
          style={styles.deleteButton}
        />
      </Card.Content>
    </Card>
  );

  // Öğün bölümü render fonksiyonu
  const renderMealSection = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => (
    <View style={styles.mealSection} key={mealType}>
      <View style={styles.mealHeaderRow}>
        <View style={styles.mealTitleContainer}>
          <Text style={styles.mealEmoji}>{mealTypeEmojis[mealType]}</Text>
          <Text style={styles.mealTitle}>{mealTypeNames[mealType]}</Text>
        </View>
        <View style={styles.mealCalorieContainer}>
          <Text style={styles.mealCalorie}>{mealCalories[mealType]} kcal</Text>
          <TouchableOpacity 
            style={styles.addFoodButton}
            onPress={() => navigation.navigate('FoodEntry')}
          >
            <Text style={styles.addFoodButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {foodsByMeal[mealType].length > 0 ? (
        foodsByMeal[mealType].map(renderFoodCard)
      ) : (
        <View style={styles.emptyMealContainer}>
          <Text style={styles.emptyMealText}>No food recorded in this meal</Text>
          <TouchableOpacity 
            style={styles.emptyAddButton}
            onPress={() => navigation.navigate('FoodEntry')}
          >
            <Text style={styles.emptyAddButtonText}>Food Add</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const isToday = isSameDay(date, new Date());

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.dateSelector}>
          <IconButton 
            icon="chevron-left" 
            size={24} 
            onPress={goToPreviousDay}
            iconColor={theme.colors.primary}
          />
          <TouchableOpacity onPress={goToToday}>
            <Text style={[styles.dateText, isToday && styles.todayText]}>{formattedDate}</Text>
          </TouchableOpacity>
          <IconButton 
            icon="chevron-right" 
            size={24} 
            onPress={goToNextDay}
            iconColor={isToday ? theme.colors.outline : theme.colors.primary}
            disabled={isToday}
          />
        </View>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryTitle}>Daily Summary</Text>
            
            <View style={styles.calorieRow}>
              <View style={styles.calorieInfo}>
                <Text style={styles.calorieValue}>{dailyCalories}</Text>
                <Text style={styles.calorieLabel}>Consumed</Text>
              </View>
              <View style={styles.calorieInfo}>
                <Text style={[
                  styles.calorieValue, 
                  remainingCalories < 0 && { color: theme.colors.error },
                  (remainingCalories >= -50 && remainingCalories <= 50) && { color: theme.colors.tertiary }
                ]}>
                  {remainingCalories}
                </Text>
                <Text style={styles.calorieLabel}>Remaining</Text>
              </View>
              <View style={styles.calorieInfo}>
                <Text style={styles.calorieValue}>{calorieGoal}</Text>
                <Text style={styles.calorieLabel}>Goal</Text>
              </View>
            </View>
            
            <Text style={[styles.calorieStatus, { color: calorieStatus.color }]}>
              {calorieStatus.message}
            </Text>
            
            <View style={styles.nutrientRow}>
              <View style={styles.nutrientItem}>
                <Text style={styles.nutrientLabel}>Calories</Text>
                <Text style={styles.nutrientValue}>{dailyCalories} / {calorieGoal} kcal</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${Math.min(100, (dailyCalories / calorieGoal) * 100)}%`,
                        backgroundColor: (dailyCalories / calorieGoal) > 1 ? theme.colors.error : theme.colors.primary
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>
            
            <View style={styles.nutrientRow}>
              <View style={styles.nutrientItem}>
                <Text style={styles.nutrientLabel}>Protein</Text>
                <Text style={styles.nutrientValue}>{dailyNutrients.protein.toFixed(1)} / {nutrientGoals.protein} g</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${Math.min(100, (dailyNutrients.protein / nutrientGoals.protein) * 100)}%`,
                        backgroundColor: theme.colors.tertiary
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>
            
            <View style={styles.nutrientRow}>
              <View style={styles.nutrientItem}>
                <Text style={styles.nutrientLabel}>Carbohydrates</Text>
                <Text style={styles.nutrientValue}>{dailyNutrients.carbs.toFixed(1)} / {nutrientGoals.carbs} g</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${Math.min(100, (dailyNutrients.carbs / nutrientGoals.carbs) * 100)}%`,
                        backgroundColor: theme.colors.secondary
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>
            
            <View style={styles.nutrientRow}>
              <View style={styles.nutrientItem}>
                <Text style={styles.nutrientLabel}>Fat</Text>
                <Text style={styles.nutrientValue}>{dailyNutrients.fat.toFixed(1)} / {nutrientGoals.fat} g</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${Math.min(100, (dailyNutrients.fat / nutrientGoals.fat) * 100)}%`
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Divider style={styles.divider} />

        <Text style={styles.sectionTitle}>Meals</Text>

        {renderMealSection('breakfast')}
        {renderMealSection('lunch')}
        {renderMealSection('dinner')}
        {renderMealSection('snack')}
      </ScrollView>
      
      {isToday && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('FoodEntry')}
          color={theme.colors.onPrimary}
        />
      )}
    </SafeAreaView>
  );
};

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.onBackground,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onBackground,
  },
  todayText: {
    color: theme.colors.primary,
  },
  summaryCard: {
    marginBottom: 16,
    elevation: 2,
    backgroundColor: theme.colors.surface,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.onSurface,
  },
  calorieRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calorieInfo: {
    alignItems: 'center',
  },
  calorieValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  calorieLabel: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
  },
  calorieStatus: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  nutrientRow: {
    marginBottom: 12,
  },
  nutrientItem: {
    marginBottom: 8,
  },
  nutrientLabel: {
    fontSize: 14,
    marginBottom: 4,
    color: theme.colors.onSurfaceVariant,
  },
  nutrientValue: {
    fontSize: 14,
    marginBottom: 4,
    color: theme.colors.onSurface,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.onBackground,
  },
  mealSection: {
    marginBottom: 24,
  },
  mealHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onBackground,
  },
  mealCalorieContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealCalorie: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    marginRight: 12,
  },
  addFoodButton: {
    backgroundColor: theme.colors.primaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addFoodButtonText: {
    color: theme.colors.onPrimaryContainer,
    fontWeight: 'bold',
    fontSize: 12,
  },
  foodCard: {
    marginBottom: 8,
    backgroundColor: theme.colors.surface,
  },
  foodCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  foodIconContainer: {
    marginRight: 12,
  },
  foodIcon: {
    fontSize: 28,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  calorieText: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
  },
  foodNutrients: {
    flexDirection: 'row',
    marginRight: 16,
  },
  nutrientText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginRight: 8,
  },
  deleteButton: {
    margin: 0,
  },
  emptyMealContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
  },
  emptyMealText: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 8,
  },
  emptyAddButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emptyAddButtonText: {
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default DailySummaryScreen; 