import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, FlatList, Alert, KeyboardAvoidingView, Platform, Keyboard, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useFoodStore, FoodItem } from '../store/foodStore';
import { useActivityStore } from '../store/activityStore';
import { ActivityItem, ActivityType } from '../types/activity';
import { useCalorieGoalStore } from '../store/calorieGoalStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { useTheme, Menu, Divider, Card, Badge } from 'react-native-paper';
import WeeklyCalendar from '../components/WeeklyCalendar';
import CaloriesCard from '../components/CaloriesCard';
import MacrosCard from '../components/MacrosCard';
import FoodEntryBar from '../components/FoodEntryBar';
import GestureRecognizer from 'react-native-swipe-gestures';

// Alternatif yaklaşım (eğer mevcut çözüm çalışmazsa):
// import { Gesture, GestureDetector } from 'react-native-gesture-handler';

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
  const [dailyActivities, setDailyActivities] = useState<ActivityItem[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const theme = useTheme();
  
  // Abonelik bilgisini al - doğru değişkenleri kullan
  const { activePlanId, isSubscribed } = useSubscriptionStore();
  
  // FlatList için referans oluştur
  const flatListRef = useRef<FlatList<FoodItem | ActivityItem>>(null);
  const nativeGestureRef = useRef(null);
  
  const styles = makeStyles(theme.colors);
  
  // Yemek, aktivite ve kalori hedefi verilerini çek
  const { foods, calculateDailyCalories, calculateDailyNutrients } = useFoodStore();
  const { activities, calculateDailyBurnedCalories } = useActivityStore();
  const { calorieGoal, nutrientGoals } = useCalorieGoalStore();
  
  // Swipe konfigürasyonu
  const swipeConfig = {
    velocityThreshold: 0.3,         // Hız eşiği
    directionalOffsetThreshold: 50,  // Yön sapma eşiği 
    gestureIsClickThreshold: 5,      // Tıklama eşiği
    enableMoveUp: false,            // Yukarı swipe'ı devre dışı bırak (FlatList scroll için)
    enableMoveDown: false           // Aşağı swipe'ı devre dışı bırak (FlatList scroll için)
  };
  
  // Swipe işleyicileri
  const onSwipeLeft = () => {
    goToNextDay();
  };
  
  const onSwipeRight = () => {
    goToPreviousDay();
  };
  
  // Seçilen günün değerlerini hesapla
  const foodCalories = calculateDailyCalories(selectedDate.toISOString());
  const burnedCalories = calculateDailyBurnedCalories(selectedDate.toISOString());
  const dailyNutrients = calculateDailyNutrients(selectedDate.toISOString());
  
  // Net kalorileri hesapla
  const netCalories = foodCalories - burnedCalories;
  
  // Kalan kalorileri hesapla
  const remainingCalories = calorieGoal - netCalories;

  // Seçilen tarihe göre yemekleri ve aktiviteleri filtreleme
  useEffect(() => {
    const filteredFoods = foods.filter(food => 
      isSameDay(food.date, selectedDate)
    );
    setDailyFoods(filteredFoods);
    
    const filteredActivities = activities.filter(activity => 
      isSameDay(activity.date, selectedDate)
    );
    setDailyActivities(filteredActivities);
  }, [foods, activities, selectedDate]);

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
  const getFoodEmoji = (foodName: string | undefined) => {
    // foodName undefined veya null ise varsayılan emoji döndür
    if (!foodName) return '🍽️';
    
    try {
      const lowerName = foodName.toLowerCase();
      const words = lowerName.split(/\s+/); // Boşluklarla kelimelere ayır
      
      // Daha özel yemek türleri (öncelikli)
      if (hasWord(lowerName, ['dolma', 'sarma'])) return '🍃';
      if (hasWord(lowerName, ['kebap', 'kebab', 'şiş'])) return '🍢';
      if (hasWord(lowerName, ['çorba', 'soup'])) return '🍲';
      if (hasWord(lowerName, ['pilav', 'rice', 'pirinç'])) return '🍚';
      if (hasWord(lowerName, ['kızartma', 'fırında', 'frying'])) return '🍳';
      if (hasWord(lowerName, ['börek', 'poğaça', 'açma'])) return '🥐';
      if (hasWord(lowerName, ['pizza'])) return '🍕';
      if (hasWord(lowerName, ['hamburger', 'burger'])) return '🍔';
      if (hasWord(lowerName, ['tavuk', 'chicken'])) return '🍗';
      if (hasWord(lowerName, ['balık', 'fish'])) return '🐟';
      if (hasWord(lowerName, ['makarna', 'pasta', 'spagetti', 'noodle'])) return '🍝';
      if (hasWord(lowerName, ['salata', 'salad'])) return '🥗';
      if (hasWord(lowerName, ['muz', 'banana'])) return '🍌';
      if (hasWord(lowerName, ['elma', 'apple'])) return '🍎';
      if (hasWord(lowerName, ['portakal', 'orange'])) return '🍊';
      if (hasWord(lowerName, ['çikolata', 'chocolate'])) return '🍫';
      if (hasWord(lowerName, ['dondurma', 'ice cream'])) return '🍦';
      if (hasWord(lowerName, ['kahve', 'coffee'])) return '☕';
      if (hasWord(lowerName, ['çay', 'tea'])) return '🍵';
      if (hasWord(lowerName, ['kek', 'cake', 'pasta'])) return '🍰';
      if (hasWord(lowerName, ['süt', 'milk', 'yoğurt', 'yogurt'])) return '🥛';
      if (hasWord(lowerName, ['ekmek', 'bread'])) return '🍞';
      
      // Daha genel yemek türleri (düşük öncelikli)
      if (hasWord(lowerName, ['et', 'meat', 'steak', 'biftek'])) return '🥩';
      if (hasWord(lowerName, ['yumurta', 'egg'])) return '🍳';
      
      // Varsayılan kategori bulunamadıysa
      return '🍽️';
    } catch (error) {
      console.error('Emoji seçme hatası:', error);
      return '🍽️'; // Hata durumunda varsayılan emoji
    }
  };
  
  // Kelime eşleştirme yardımcı fonksiyonu
  const hasWord = (text: string, keywords: string[]): boolean => {
    // Her bir anahtar kelimeyi kontrol et
    for (const keyword of keywords) {
      // Kelimenin başında, sonunda veya ayrı bir kelime olarak olup olmadığını kontrol et
      // Örnek: "et" kelimesi "diet" içinde eşleşmemeli, ama "et yemeği" içinde eşleşmeli
      const regex = new RegExp(`\\b${keyword}\\b|^${keyword}|${keyword}$`, 'i');
      if (regex.test(text)) {
        return true;
      }
    }
    return false;
  };

  // Metni kısaltma fonksiyonu
  const truncateText = (text: string, maxLength: number): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Öğün türü emojisi
  const getMealTypeEmoji = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '🍳';
      case 'lunch': return '🍲';
      case 'dinner': return '🍽️';
      case 'snack': return '🍌';
      default: return '��';
    }
  };

  // Aktivite türüne göre emoji seçme
  const getActivityEmoji = (activityType?: ActivityType) => {
    switch (activityType) {
      case 'walking': return '🚶';
      case 'running': return '🏃';
      case 'cycling': return '🚲';
      case 'swimming': return '🏊';
      case 'workout': return '💪';
      default: return '⚡';
    }
  };

  // Tüm öğeleri sıralanmış şekilde birleştir
  const getAllEntries = () => {
    // FoodItem ve ActivityItem'ları birleştirmek için, tip ayrımı yapabilecek bir alan ekle
    const foodEntries = dailyFoods.map(food => ({ ...food, entryType: 'food' as const }));
    const activityEntries = dailyActivities.map(activity => ({ ...activity, entryType: 'activity' as const }));
    
    // Birleştirilmiş ve sıralanmış liste
    return [...foodEntries, ...activityEntries].sort((a, b) => {
      // id'lere göre sırala (id'ler timestamp olarak oluşturulduğu için)
      const idA = parseInt(a.id);
      const idB = parseInt(b.id);
      
      // Küçük id daha eski girdiyi temsil eder (timestamp olarak)
      // Eski girdiler üstte, yeni girdiler altta olacak
      return idA - idB;
    });
  };

  // Yemek öğesini görüntüleme
  const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <Card style={styles.foodCard} onPress={() => {
      // Düzenleme işlevini çağır
      // Date nesnelerini ISO stringine dönüştürerek serileştirilebilir hale getir
      const serializedFoodItem = {
        ...item,
        // Firebase Timestamp ve Date nesnelerini ISO string'e dönüştür
        createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : 
                  typeof item.createdAt === 'object' ? new Date((item.createdAt as any).seconds * 1000).toISOString() : 
                  item.createdAt,
        updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : 
                  typeof item.updatedAt === 'object' ? new Date((item.updatedAt as any).seconds * 1000).toISOString() : 
                  item.updatedAt,
      };
      
      navigation.navigate('FoodEntry', { 
        editMode: true, 
        foodItem: serializedFoodItem 
      });
    }}>
      <View style={styles.foodItemContainer}>
        <Text style={styles.mealTypeEmoji}>{getFoodEmoji(item.name)}</Text>
        <View style={styles.foodDetails}>
          <Text style={styles.foodName} numberOfLines={2} ellipsizeMode="tail">
            {truncateText(item.name || '', 30)}
          </Text>
          <Text style={styles.foodCalories}>{item.calories} kcal</Text>
        </View>
        <View style={styles.foodMacros}>
          <Text style={styles.macroText}>P: {Number(item.protein).toFixed(1).replace(/\.0$/, '')}g</Text>
          <Text style={styles.macroText}>C: {Number(item.carbs).toFixed(1).replace(/\.0$/, '')}g</Text>
          <Text style={styles.macroText}>Y: {Number(item.fat).toFixed(1).replace(/\.0$/, '')}g</Text>
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

  // Aktivite öğesini görüntüleme
  const renderActivityItem = ({ item }: { item: ActivityItem }) => (
    <Card style={styles.activityCard} onPress={() => {
      // Düzenleme işlevini çağır
      // Date nesnelerini ISO stringine dönüştürerek serileştirilebilir hale getir
      const serializedActivityItem = {
        ...item,
        // Firebase Timestamp ve Date nesnelerini ISO string'e dönüştür
        createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : 
                  typeof item.createdAt === 'object' ? new Date((item.createdAt as any).seconds * 1000).toISOString() : 
                  item.createdAt,
        updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : 
                  typeof item.updatedAt === 'object' ? new Date((item.updatedAt as any).seconds * 1000).toISOString() : 
                  item.updatedAt,
      };
      
      navigation.navigate('ActivityEntry', { 
        editMode: true, 
        activityItem: serializedActivityItem 
      });
    }}>
      <View style={styles.activityItemContainer}>
        <Text style={styles.activityTypeEmoji}>{getActivityEmoji(item.activityType)}</Text>
        <View style={styles.activityDetails}>
          <Text style={styles.activityName} numberOfLines={2} ellipsizeMode="tail">
            {truncateText(item.name || '', 30)}
          </Text>
          <Text style={styles.activityCalories}>-{item.calories} kcal</Text>
        </View>
        <View style={styles.activityInfo}>
          <Text style={styles.activityDuration}>{item.duration} dk</Text>
          <Text style={styles.activityIntensity}>{item.intensity}</Text>
        </View>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            Alert.alert(
              'Aktiviteyi Sil',
              'Bu aktiviteyi silmek istediğinizden emin misiniz?',
              [
                { text: 'İptal', style: 'cancel' },
                { text: 'Sil', 
                  onPress: async () => {
                    try {
                      await useActivityStore.getState().removeActivity(item.id);
                    } catch (error) {
                      console.error('Aktivite silinirken hata oluştu:', error);
                      Alert.alert('Hata', 'Aktivite silinirken bir hata oluştu.');
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

  // Öğe tipine göre doğru render fonksiyonunu belirle
  const renderItem = ({ item }: { item: any }) => {
    if (item.entryType === 'activity') {
      return renderActivityItem({ item });
    } else {
      return renderFoodItem({ item });
    }
  };

  // Boş liste yerini tutan öğe
  const EmptyListComponent = () => (
    <View style={styles.emptyListContainer}>
      <Text style={styles.emptyListText}>
        Bu tarihte kayıtlı yemek veya aktivite bulunmamaktadır.
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

  // Sonraki güne geçme fonksiyonu
  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
  };
  
  // Önceki güne geçme fonksiyonu
  const goToPreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    setSelectedDate(previousDay);
  };
  
  // Kalori durumunu hesaplayan fonksiyon
  const getCalorieStatus = (date: Date): 'complete' | 'incomplete' | 'exceeded' | undefined => {
    try {
      // Tarih biçimini ayarla
      const dateString = date.toISOString();
      
      // Günün kalori değerlerini hesapla
      const dayCalories = calculateDailyCalories(dateString);
      
      // Günün kalori durumunu değerlendir
      const calorieCompletion = (dayCalories / calorieGoal) * 100;
      
      if (dayCalories === 0) {
        // Veri yoksa undefined döndür (renklendirme yapılmaz)
        return undefined;
      } else if (calorieCompletion >= 95 && calorieCompletion <= 105) {
        // %95-105 aralığında ise tamamlanmış kabul et (hedef tutturulmuş)
        return 'complete';
      } else if (calorieCompletion > 105) {
        // %105'ten fazla ise aşılmış kabul et
        return 'exceeded';
      } else {
        // %95'ten az ise tamamlanmamış kabul et
        return 'incomplete';
      }
    } catch (error) {
      console.error('Kalori durumu hesaplanırken hata:', error);
      return undefined;
    }
  };

  return (
    <SafeAreaView 
      style={styles.container}
      edges={['left', 'right', 'bottom']}
    >
      <StatusBar
        backgroundColor={theme.colors.background}
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
      />
      
      {/* ÜST BÖLÜM: Header ve Takvim */}
      <View style={styles.topSection}>
        {/* Tarih ve Butonlar */}
        <View style={styles.todayContainer}>
          <Text style={styles.todayText}>{getDayLabel()}</Text>
          <View style={styles.headerButtons}>
            <View style={styles.statsButtonContainer}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={handleOpenStats}
              >
                <Text style={styles.themeIcon}>📊</Text>
              </TouchableOpacity>
              
              {/* Abonelik türü badge - absolute positioning ile konumlandırılıyor */}
              <Badge 
                style={[
                  styles.subscriptionBadge, 
                  { 
                    backgroundColor: isSubscribed 
                      ? (activePlanId === 'premium' 
                          ? theme.colors.primary 
                          : theme.dark ? '#686868' : theme.colors.surfaceVariant)
                      : theme.dark ? '#585858' : 'rgba(255, 255, 255, 0.8)',
                    color: theme.dark 
                      ? '#FFFFFF' 
                      : '#000000'
                  }
                ]}
              >
                {isSubscribed 
                  ? (activePlanId === 'premium' 
                      ? 'Premium' 
                      : 'Temel')
                  : 'Ücretsiz'}
              </Badge>
            </View>
            
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
                onPress={() => {
                  handleOpenThemeSettings();
                  setMenuVisible(false);
                }}
                title="Tema Ayarları"
                leadingIcon={theme.dark ? "weather-night" : "weather-sunny"}
              />
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
          getCalorieStatus={getCalorieStatus}
        />
      </View>
      
      {/* ORTA BÖLÜM: Yemek Listesi (kaydırılabilir) */}
      <View style={styles.middleSection}>
        <GestureRecognizer
          onSwipeLeft={onSwipeLeft}
          onSwipeRight={onSwipeRight}
          config={swipeConfig}
          style={{ flex: 1, width: '100%' }}
        >
          <FlatList
            ref={flatListRef}
            data={getAllEntries()}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            ListEmptyComponent={EmptyListComponent}
            contentContainerStyle={dailyFoods.length === 0 && dailyActivities.length === 0 ? 
              styles.emptyListContentContainer : styles.foodListContentContainer}
            style={styles.flatList}
            scrollEnabled={true}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={true}
            bounces={true}
          />
        </GestureRecognizer>
      </View>
      
      {/* ALT BÖLÜM: Kalori ve Makro Kartları */}
      {!isInputFocused && (
        <View style={styles.bottomSection}>
          <View style={styles.cardsContainer}>
            <CaloriesCard 
              food={foodCalories}
              exercise={burnedCalories}
              remaining={remainingCalories}
            />
            <MacrosCard 
              carbs={{ current: dailyNutrients.carbs, goal: nutrientGoals.carbs }}
              protein={{ current: dailyNutrients.protein, goal: nutrientGoals.protein }}
              fat={{ current: dailyNutrients.fat, goal: nutrientGoals.fat }}
            />
          </View>
        </View>
      )}
      
      {/* EN ALT: Yemek Giriş Çubuğu - Artık kendi klavye konumlandırmasını yapıyor */}
      <FoodEntryBar 
        selectedDate={selectedDate} 
        onFocusChange={setIsInputFocused}
      />
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
    marginBottom: 0,
  },
  middleSection: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 0,
    marginTop: 0,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  bottomSection: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 100, // FoodEntryBar için yer
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
    paddingTop: 0,
    paddingBottom: 120,
    width: '100%',
    alignSelf: 'flex-start',
    flexGrow: 1,
  },
  emptyListContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 0, 
    paddingBottom: 120,
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
    flexWrap: 'nowrap',
  },
  mealTypeEmoji: {
    fontSize: 24,
    marginRight: 12,
    width: 30, // Sabit genişlik
  },
  foodDetails: {
    flex: 1,
    minWidth: 0, // flexbox içindeki overflow sorunları için
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.onSurface,
    flexShrink: 1,
    maxWidth: '100%',
  },
  foodCalories: {
    fontSize: 14,
    color: colors.onSurface,
    opacity: 0.7,
  },
  foodMacros: {
    flexDirection: 'row',
    gap: 8,
    minWidth: 100, // Makrolar için minimum genişlik
    justifyContent: 'flex-end',
    flexShrink: 0, // Küçültülmesini engelle
  },
  macroText: {
    fontSize: 12,
    color: colors.onSurface,
    opacity: 0.7,
    flexShrink: 0, // Küçültülmesini engelle
  },
  emptyListContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 10,
    width: '80%',
    marginVertical: 20,
  },
  emptyListContainerFixed: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 10,
    width: '90%',
    marginVertical: 8,
    marginBottom: 24, // Alt barı kapatmasın diye küçük bırak
    alignSelf: 'center',
  },
  emptyListText: {
    fontSize: 16,
    color: colors.onSurface,
    textAlign: 'center',
    lineHeight: 22,
  },
  deleteButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    flexShrink: 0, // Küçültülmesini engelle
  },
  deleteIcon: {
    fontSize: 20,
  },
  gestureOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  activityCard: {
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    elevation: 3
  },
  activityItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  activityTypeEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  activityDetails: {
    flex: 1,
    marginRight: 10,
  },
  activityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.onSurfaceVariant,
  },
  activityCalories: {
    fontSize: 14,
    color: colors.tertiary, // Aktivite kalori değeri için özel renk
    fontWeight: 'bold',
  },
  activityInfo: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  activityDuration: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  activityIntensity: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    textTransform: 'capitalize'
  },
  flatList: {
    flex: 1,
    marginTop: 0,
    paddingTop: 0,
    width: '100%',
  },
  statsButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -10,
    position: 'relative',
  },
  subscriptionBadge: {
    position: 'absolute',
    left: -45,
    top: 10,
    height: 24,
    fontSize: 11,
    fontWeight: 'bold',
    minWidth: 50,
    paddingHorizontal: 4,
    color: '#000',
    zIndex: 1,
  },
  foodEntryContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});

export default HomeScreen; 