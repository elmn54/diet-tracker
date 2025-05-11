import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useFoodStore, FoodItem } from '../store/foodStore';
import { useCalorieGoalStore } from '../store/calorieGoalStore';
import { useTheme, Menu, Divider, Card } from 'react-native-paper';
import WeeklyCalendar from '../components/WeeklyCalendar';
import CaloriesCard from '../components/CaloriesCard';
import MacrosCard from '../components/MacrosCard';
import FoodEntryBar from '../components/FoodEntryBar';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Ana Sayfa'>;

// Aynı tarihte olup olmadığını kontrol eden yardımcı fonksiyon
const isSameDay = (date1: string, date2: Date): boolean => {
  const d1 = new Date(date1);
  return (
    d1.getFullYear() === date2.getFullYear() &&
    d1.getMonth() === date2.getMonth() &&
    d1.getDate() === date2.getDate()
  );
};

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [menuVisible, setMenuVisible] = useState(false);
  const [dailyFoods, setDailyFoods] = useState<FoodItem[]>([]);
  const theme = useTheme();
  
  const styles = makeStyles(theme.colors);
  
  // Yemek ve kalori hedefi verilerini çek
  const { foods, calculateDailyCalories, calculateDailyNutrients } = useFoodStore();
  const { calorieGoal, nutrientGoals } = useCalorieGoalStore();
  
  // Seçilen günün değerlerini hesapla
  const dailyCalories = calculateDailyCalories(selectedDate.toISOString());
  const dailyNutrients = calculateDailyNutrients(selectedDate.toISOString());
  
  // Kalan kalorileri hesapla
  const remainingCalories = Math.max(0, calorieGoal - dailyCalories);

  // Seçilen tarihe göre yemekleri filtreleme
  useEffect(() => {
    const filteredFoods = foods.filter(food => 
      isSameDay(food.date, selectedDate)
    );
    setDailyFoods(filteredFoods);
  }, [foods, selectedDate]);

  // Tema ayarları sayfasına git
  const handleOpenThemeSettings = () => {
    navigation.navigate('ThemeSettings');
  };

  // İstatistikler sayfasına git
  const handleOpenStats = () => {
    navigation.navigate('Stats');
  };
  
  // API ayarları sayfasına git
  const handleOpenApiSettings = () => {
    navigation.navigate('ApiSettings');
    setMenuVisible(false);
  };
  
  // Fiyatlandırma sayfasına git
  const handleOpenPricingScreen = () => {
    navigation.navigate('Pricing');
    setMenuVisible(false);
  };
  
  // Kalori hedefi sayfasına git
  const handleOpenCalorieGoalScreen = () => {
    navigation.navigate('CalorieGoal');
    setMenuVisible(false);
  };
  
  // Menüyü aç/kapa
  const toggleMenu = () => setMenuVisible(!menuVisible);

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

  // Öğün türü emojisi
  const getMealTypeEmoji = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '🍳';
      case 'lunch': return '🍲';
      case 'dinner': return '🍽️';
      case 'snack': return '🍌';
      default: return '🍴';
    }
  };

  // Yemek öğesini görüntüleme
  const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <Card style={styles.foodCard} onPress={() => {
      // Düzenleme işlevini çağır
      navigation.navigate('FoodEntry', { 
        editMode: true, 
        foodItem: item 
      });
    }}>
      <View style={styles.foodItemContainer}>
        <Text style={styles.mealTypeEmoji}>{getFoodEmoji(item.name)}</Text>
        <View style={styles.foodDetails}>
          <Text style={styles.foodName}>{item.name}</Text>
          <Text style={styles.foodCalories}>{item.calories} kcal</Text>
        </View>
        <View style={styles.foodMacros}>
          <Text style={styles.macroText}>P: {item.protein}g</Text>
          <Text style={styles.macroText}>C: {item.carbs}g</Text>
          <Text style={styles.macroText}>Y: {item.fat}g</Text>
        </View>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            Alert.alert(
              'Yemeği Sil',
              'Bu yemeği silmek istediğinizden emin misiniz?',
              [
                { text: 'İptal', style: 'cancel' },
                { text: 'Sil', 
                  onPress: async () => {
                    try {
                      await useFoodStore.getState().removeFood(item.id);
                    } catch (error) {
                      console.error('Yemek silinirken hata oluştu:', error);
                      Alert.alert('Hata', 'Yemek silinirken bir hata oluştu.');
                    }
                  }, 
                  style: 'destructive' 
                }
              ]
            );
          }}
        >
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  // Boş liste yerini tutan öğe
  const EmptyListComponent = () => (
    <View style={styles.emptyListContainer}>
      <Text style={styles.emptyListText}>
        Bu tarihte kayıtlı yemek bulunmamaktadır.
      </Text>
    </View>
  );

  const getDayLabel = () => {
    // Bugünün tarihiyle karşılaştır
    const today = new Date();
    const isToday = 
      today.getDate() === selectedDate.getDate() && 
      today.getMonth() === selectedDate.getMonth() && 
      today.getFullYear() === selectedDate.getFullYear();
    
    if (isToday) return 'Bugün';
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = 
      yesterday.getDate() === selectedDate.getDate() && 
      yesterday.getMonth() === selectedDate.getMonth() && 
      yesterday.getFullYear() === selectedDate.getFullYear();
    
    if (isYesterday) return 'Dün';
    
    // Türkçe tarih formatı
    return selectedDate.toLocaleDateString('tr-TR', { 
      day: 'numeric',
      month: 'long', 
      year: 'numeric'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.background}
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
      />
      
      {/* ÜST BÖLÜM: Header ve Takvim */}
      <View style={styles.topSection}>
        {/* Başlık */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Ana Sayfa</Text>
        </View>
        
        {/* Tarih ve Butonlar */}
        <View style={styles.todayContainer}>
          <Text style={styles.todayText}>{getDayLabel()}</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={handleOpenStats}
            >
              <Text style={styles.themeIcon}>📊</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={handleOpenThemeSettings}
            >
              <Text style={styles.themeIcon}>{theme.dark ? '🌙' : '☀️'}</Text>
            </TouchableOpacity>
            
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableOpacity style={styles.iconButton} onPress={toggleMenu}>
                  <Text style={styles.themeIcon}>⚙️</Text>
                </TouchableOpacity>
              }
            >
              <Menu.Item 
                onPress={handleOpenCalorieGoalScreen} 
                title="Kalori Hedefi" 
                leadingIcon="target"
              />
              <Menu.Item 
                onPress={handleOpenApiSettings} 
                title="API Ayarları" 
                leadingIcon="api"
              />
              <Menu.Item 
                onPress={handleOpenPricingScreen}
                title="Abonelik Planları" 
                leadingIcon="cash" 
              />
              <Divider />
              <Menu.Item 
                onPress={() => {
                  navigation.navigate('Profile');
                  setMenuVisible(false);
                }}
                title="Profil" 
                leadingIcon="account" 
              />
            </Menu>
          </View>
        </View>
        
        {/* Takvim */}
        <WeeklyCalendar 
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </View>
      
      {/* ORTA BÖLÜM: Yemek Listesi (kaydırılabilir) */}
      <View style={styles.middleSection}>
        <FlatList
          data={dailyFoods}
          renderItem={renderFoodItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={EmptyListComponent}
          contentContainerStyle={dailyFoods.length === 0 ? styles.emptyListContentContainer : styles.foodListContentContainer}
        />
      </View>
      
      {/* ALT BÖLÜM: Kalori ve Makro Kartları */}
      <View style={styles.bottomSection}>
        <View style={styles.cardsContainer}>
          <CaloriesCard 
            food={dailyCalories}
            exercise={0} // Egzersiz kalorisi henüz eklenmiyor
            remaining={remainingCalories}
          />
          
          <MacrosCard 
            carbs={{ current: dailyNutrients.carbs, goal: nutrientGoals.carbs }}
            protein={{ current: dailyNutrients.protein, goal: nutrientGoals.protein }}
            fat={{ current: dailyNutrients.fat, goal: nutrientGoals.fat }}
          />
        </View>
      </View>
      
      {/* EN ALT: Yemek Giriş Çubuğu */}
      <FoodEntryBar />
    </SafeAreaView>
  );
};

const makeStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topSection: {
    backgroundColor: colors.background,
  },
  middleSection: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bottomSection: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 100, // FoodEntryBar için daha fazla yer
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
    color: colors.onSurface,
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
    color: colors.onSurface,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginLeft: 8,
  },
  themeIcon: {
    fontSize: 24,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    height: 120, // Kartların yüksekliği azaltıldı
  },
  foodListContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  emptyListContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    flex: 1,
    justifyContent: 'center',
  },
  foodCard: {
    marginBottom: 10,
    backgroundColor: colors.surface,
    borderRadius: 10,
  },
  foodItemContainer: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  mealTypeEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  foodDetails: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
  foodCalories: {
    fontSize: 14,
    color: colors.onSurface,
    opacity: 0.7,
  },
  foodMacros: {
    flexDirection: 'row',
    gap: 8,
  },
  macroText: {
    fontSize: 12,
    color: colors.onSurface,
    opacity: 0.7,
  },
  emptyListContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 10,
  },
  emptyListText: {
    fontSize: 16,
    color: colors.onSurface,
    textAlign: 'center',
  },
  deleteButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    fontSize: 20,
  },
});

export default HomeScreen; 