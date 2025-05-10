import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Divider, IconButton } from 'react-native-paper';
import { useFoodStore, FoodItem } from '../store/foodStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Card from '../components/Card';
import { colors, spacing, metrics, typography } from '../constants/theme';

type DailySummaryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'DailySummary'>;

const DailySummaryScreen = () => {
  const navigation = useNavigation<DailySummaryScreenNavigationProp>();
  const [date, setDate] = useState(new Date());
  const [formattedDate, setFormattedDate] = useState('');
  
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

  // İlk yüklemede verileri getir
  useEffect(() => {
    loadFoods();
  }, [loadFoods]);

  // Tarih formatını ayarla
  useEffect(() => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setFormattedDate(date.toLocaleDateString('tr-TR', options));
  }, [date]);

  // Günlük toplam değerleri hesapla
  const dailyCalories = calculateDailyCalories(date.toISOString());
  const dailyNutrients = calculateDailyNutrients(date.toISOString());

  // Sabit günlük hedefler (ileride kullanıcı profilinden gelebilir)
  const calorieGoal = 2000;
  const proteinGoal = 100;
  const carbsGoal = 250;
  const fatGoal = 70;

  // Bugünün yemeklerini filtrele
  const isSameDay = (dateString: string) => {
    const foodDate = new Date(dateString);
    return (
      foodDate.getFullYear() === date.getFullYear() &&
      foodDate.getMonth() === date.getMonth() &&
      foodDate.getDate() === date.getDate()
    );
  };

  const todaysFoods = foods.filter(food => isSameDay(food.date));
  
  // Öğüne göre yemekleri grupla
  const foodsByMeal = {
    breakfast: todaysFoods.filter(food => food.mealType === 'breakfast'),
    lunch: todaysFoods.filter(food => food.mealType === 'lunch'),
    dinner: todaysFoods.filter(food => food.mealType === 'dinner'),
    snack: todaysFoods.filter(food => food.mealType === 'snack'),
  };

  // Önceki güne git
  const goToPreviousDay = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 1);
    setDate(newDate);
  };

  // Sonraki güne git
  const goToNextDay = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    setDate(newDate);
  };

  // Yemek silme işlemi
  const handleDeleteFood = async (id: string) => {
    try {
      await removeFood(id);
    } catch (error) {
      console.error('Yemek silinirken hata oluştu:', error);
    }
  };

  // Öğün başlık adlarını Türkçeleştirme
  const mealTypeNames = {
    breakfast: 'Kahvaltı',
    lunch: 'Öğle Yemeği',
    dinner: 'Akşam Yemeği',
    snack: 'Atıştırmalık',
  };

  // Yemek kartı render fonksiyonu
  const renderFoodCard = (food: FoodItem) => (
    <Card key={food.id} style={styles.foodCard}>
      <Card.Content style={styles.foodCardContent}>
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{food.name}</Text>
          <Text>{food.calories} kcal</Text>
        </View>
        <View style={styles.foodNutrients}>
          <Text style={styles.nutrientText}>P: {food.protein}g</Text>
          <Text style={styles.nutrientText}>K: {food.carbs}g</Text>
          <Text style={styles.nutrientText}>Y: {food.fat}g</Text>
        </View>
        <IconButton
          icon="delete"
          size={20}
          onPress={() => handleDeleteFood(food.id)}
          style={styles.deleteButton}
        />
      </Card.Content>
    </Card>
  );

  // Öğün bölümü render fonksiyonu
  const renderMealSection = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => (
    <View style={styles.mealSection}>
      <Text style={styles.mealTitle}>{mealTypeNames[mealType]}</Text>
      {foodsByMeal[mealType].length > 0 ? (
        foodsByMeal[mealType].map(renderFoodCard)
      ) : (
        <Text style={styles.emptyMealText}>Bu öğünde henüz yemek kaydı yok</Text>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Yükeniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.dateSelector}>
        <IconButton icon="chevron-left" size={24} onPress={goToPreviousDay} />
        <Text style={styles.dateText}>{formattedDate}</Text>
        <IconButton icon="chevron-right" size={24} onPress={goToNextDay} />
      </View>

      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text style={styles.summaryTitle}>Günlük Özet</Text>
          <View style={styles.nutrientRow}>
            <View style={styles.nutrientItem}>
              <Text style={styles.nutrientLabel}>Kalori</Text>
              <Text style={styles.nutrientValue}>{dailyCalories} / {calorieGoal} kcal</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${Math.min(100, (dailyCalories / calorieGoal) * 100)}%` }
                  ]} 
                />
              </View>
            </View>
          </View>
          
          <View style={styles.nutrientRow}>
            <View style={styles.nutrientItem}>
              <Text style={styles.nutrientLabel}>Protein</Text>
              <Text style={styles.nutrientValue}>{dailyNutrients.protein} / {proteinGoal} g</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${Math.min(100, (dailyNutrients.protein / proteinGoal) * 100)}%` }
                  ]} 
                />
              </View>
            </View>
          </View>
          
          <View style={styles.nutrientRow}>
            <View style={styles.nutrientItem}>
              <Text style={styles.nutrientLabel}>Karbonhidrat</Text>
              <Text style={styles.nutrientValue}>{dailyNutrients.carbs} / {carbsGoal} g</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${Math.min(100, (dailyNutrients.carbs / carbsGoal) * 100)}%` }
                  ]} 
                />
              </View>
            </View>
          </View>
          
          <View style={styles.nutrientRow}>
            <View style={styles.nutrientItem}>
              <Text style={styles.nutrientLabel}>Yağ</Text>
              <Text style={styles.nutrientValue}>{dailyNutrients.fat} / {fatGoal} g</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${Math.min(100, (dailyNutrients.fat / fatGoal) * 100)}%` }
                  ]} 
                />
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('FoodEntry')}
      >
        <Text style={styles.addButtonText}>Yemek Ekle</Text>
      </TouchableOpacity>
      
      <Divider style={styles.divider} />
      
      {renderMealSection('breakfast')}
      {renderMealSection('lunch')}
      {renderMealSection('dinner')}
      {renderMealSection('snack')}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.m,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.s,
  },
  dateText: {
    fontSize: typography.fontSize.large,
    fontWeight: 'bold',
    marginHorizontal: spacing.m,
    color: colors.text,
  },
  summaryCard: {
    marginVertical: spacing.m,
    elevation: 2, 
    backgroundColor: colors.surface,
    borderRadius: metrics.borderRadius.medium,
  },
  summaryTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    marginBottom: spacing.m,
    color: colors.text,
  },
  nutrientRow: {
    marginVertical: spacing.s,
  },
  nutrientItem: {
    marginVertical: spacing.xs,
  },
  nutrientLabel: {
    fontSize: typography.fontSize.medium,
    color: colors.textLight,
  },
  nutrientValue: {
    fontSize: typography.fontSize.medium,
    fontWeight: 'bold',
    marginTop: spacing.xs,
    color: colors.text,
  },
  progressBar: {
    height: 10,
    backgroundColor: colors.divider,
    borderRadius: metrics.borderRadius.small,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.protein,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.m,
    borderRadius: metrics.borderRadius.medium,
    alignItems: 'center',
    marginVertical: spacing.m,
  },
  addButtonText: {
    color: colors.surface,
    fontSize: typography.fontSize.medium,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: spacing.s,
    backgroundColor: colors.divider,
  },
  mealSection: {
    marginVertical: spacing.m,
  },
  mealTitle: {
    fontSize: typography.fontSize.large,
    fontWeight: 'bold',
    marginBottom: spacing.s,
    color: colors.text,
  },
  foodCard: {
    marginVertical: spacing.xs,
    elevation: 1,
    backgroundColor: colors.surface,
    borderRadius: metrics.borderRadius.medium,
    borderColor: colors.divider,
    borderWidth: 0.5,
  },
  foodCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodInfo: {
    flex: 2,
  },
  foodName: {
    fontSize: typography.fontSize.medium,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    color: colors.text,
  },
  foodNutrients: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutrientText: {
    color: colors.textLight,
    fontSize: typography.fontSize.small,
  },
  deleteButton: {
    margin: 0,
  },
  emptyMealText: {
    color: colors.textLight,
    fontStyle: 'italic',
    marginTop: spacing.xs,
    marginLeft: spacing.s,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.m,
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.m,
    fontSize: typography.fontSize.medium,
    color: colors.textLight,
  },
});

export default DailySummaryScreen; 