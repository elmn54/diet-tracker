import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, Keyboard, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme, MD3Theme } from 'react-native-paper';
import { useFoodStore, FoodItem } from '../store/foodStore';
import { useApiKeyStore } from '../store/apiKeyStore';
import { useUIStore } from '../store/uiStore';
// Gerçek API hizmetini ekle
import { AI_PROVIDERS } from '../constants/aiProviders';
import { createCompletion } from '../services/aiService.js';
// Fotoğraf işlemleri için
import * as ImagePicker from 'expo-image-picker';
import { identifyFood } from '../services/foodRecognitionService';
import { useSubscriptionStore } from '../store/subscriptionStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Ana Sayfa'>;

interface FoodEntryBarProps {
  selectedDate?: Date;
  hideCaloriesAndMacros?: boolean;
  onFocusChange?: (isFocused: boolean) => void;
}

const FoodEntryBar: React.FC<FoodEntryBarProps> = ({ 
  selectedDate = new Date(),
  hideCaloriesAndMacros = true,
  onFocusChange
}) => {
  const navigation = useNavigation<NavigationProp>();
  const [inputText, setInputText] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const theme = useTheme();
  const { addFood } = useFoodStore();
  const { showToast } = useUIStore();
  
  // Store'dan API bilgilerini al
  const apiKeys = useApiKeyStore(state => state.apiKeys);
  const preferredProvider = useApiKeyStore(state => state.preferredProvider);
  
  const styles = makeStyles(theme);
  
  // Klavye olaylarını dinle
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
        if (!inputText.trim()) {
          handleFocusChange(false);
        }
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, [inputText]);

  // Input odak değişikliğini işle
  const handleFocusChange = (focused: boolean) => {
    setIsInputFocused(focused);
    if (onFocusChange) {
      onFocusChange(focused);
    }
  };

  // Gelişmiş yemek eklemeye git
  const handleAdvancedEntry = () => {
    handleFocusChange(false);
    Keyboard.dismiss();
    
    // Gelişmiş mod her zaman manuel giriş için kullanılır,
    // bu nedenle fromTextInput parametresini geçmeyeceğiz
    navigation.navigate('FoodEntry', { selectedDate });
  };

  // Kamera izni isteği
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Kamerayı kullanmak için izin gereklidir.');
      return false;
    }
    return true;
  };

  // Galeri izni isteği
  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Galeriyi kullanmak için izin gereklidir.');
      return false;
    }
    return true;
  };

  // Görüntü API'si ile analiz
  const analyzeImageWithAI = async (imageUri: string): Promise<any> => {
    const apiKey = apiKeys[preferredProvider];
    if (!apiKey) {
      throw new Error('API anahtarı bulunamadı');
    }
    
    try {
      console.log(`Analyzing image with ${preferredProvider} API`);
      const result = await identifyFood(
        { uri: imageUri },
        preferredProvider,
        apiKey
      );
      
      console.log('Analysis result:', result);
      return result;
    } catch (error) {
      console.error('API çağrısı sırasında hata:', error);
      throw error;
    }
  };

  // Abonelik kontrolü
  const isPlanFeatureAvailable = (feature: string): boolean => {
    return useSubscriptionStore.getState().isPlanFeatureAvailable(feature);
  };

  // Kalan istek sayısı kontrolü
  const getRemainingRequests = (): number => {
    return useSubscriptionStore.getState().getRemainingRequests();
  };

  // Kamera ile direkt fotoğraf çek ve analiz et
  const handleCameraCapture = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await analyzeAndSaveImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Fotoğraf çekerken hata oluştu:', error);
      Alert.alert('Hata', 'Fotoğraf çekilemedi. Lütfen tekrar deneyin.');
    }
  };

  // Galeriden direkt fotoğraf seç ve analiz et
  const handleGalleryPick = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await analyzeAndSaveImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Fotoğraf seçerken hata oluştu:', error);
      Alert.alert('Hata', 'Fotoğraf seçilemedi. Lütfen tekrar deneyin.');
    }
  };

  // API anahtarı kontrolü
  const checkApiKey = (): boolean => {
    const apiKey = apiKeys[preferredProvider];
    if (!apiKey) {
      Alert.alert(
        'API Anahtarı Gerekli', 
        'Yemek analizi için bir API anahtarı gereklidir. API ayarlarına gitmek ister misiniz?',
        [
          {
            text: 'İptal',
            style: 'cancel'
          },
          {
            text: 'API Ayarlarına Git',
            onPress: () => navigation.navigate('ApiSettings')
          }
        ]
      );
      return false;
    }
    return true;
  };

  // Görüntüyü analiz et ve kaydet
  const analyzeAndSaveImage = async (imageUri: string) => {
    setIsAnalyzing(true);
    
    try {
      // API anahtarı kontrolü
      if (!checkApiKey()) {
        setIsAnalyzing(false);
        return;
      }
      
      // Abonelik kontrolü
      if (!isPlanFeatureAvailable('imageRecognitionEnabled')) {
        Alert.alert(
          'Premium Özellik', 
          'Görsel tanıma özelliği sadece premium aboneler için kullanılabilir.',
          [
            { text: 'İptal' },
            { text: 'Abonelik Planları', onPress: () => navigation.navigate('Pricing') }
          ]
        );
        setIsAnalyzing(false);
        return;
      }
      
      // İstek limitini kontrol et
      const remainingReqs = getRemainingRequests();
      if (remainingReqs === 0) {
        Alert.alert(
          'Limit Aşıldı', 
          'Bu ay için AI görüntü tanıma limitinizi doldurdunuz. Daha fazla kullanım için Pro planına yükseltin.',
          [
            { text: 'İptal' },
            { text: 'Abonelik Planları', onPress: () => navigation.navigate('Pricing') }
          ]
        );
        setIsAnalyzing(false);
        return;
      }
      
      // API'den veri alma
      const result = await analyzeImageWithAI(imageUri);
      console.log('Raw result:', JSON.stringify(result));
      
      // API yanıt yapısını kontrol et ve uygun şekilde kullan
      let foodName = 'Bilinmeyen Yemek';
      let calories = 0;
      let protein = 0;
      let carbs = 0;
      let fat = 0;
      let hasCompleteData = true;
      
      // name veya foodName alanlarını kontrol et
      if (typeof result === 'object' && result !== null) {
        foodName = result.name || result.foodName || 'Bilinmeyen Yemek';
        
        // Besin değerleri kontrolü - çeşitli yanıt yapıları için destek
        if (result.nutritionFacts) {
          calories = result.nutritionFacts.calories || 0;
          protein = result.nutritionFacts.protein || 0;
          carbs = result.nutritionFacts.carbs || 0;
          fat = result.nutritionFacts.fat || 0;
          
          // Veri eksik mi kontrol et
          if (result.nutritionFacts.protein === null || 
              result.nutritionFacts.carbs === null || 
              result.nutritionFacts.fat === null) {
            hasCompleteData = false;
          }
        } else {
          // Direkt olarak ana objede olabilir
          calories = result.calories || 0;
          protein = result.protein || 0;
          carbs = result.carbs || 0;
          fat = result.fat || 0;
          
          // Ana objede eksik veri kontrolü
          if (result.protein === null || result.carbs === null || result.fat === null) {
            hasCompleteData = false;
          }
        }
      }
      
      // Eksik besin değerleri varsa kullanıcıya sor
      if (!hasCompleteData) {
        Alert.alert(
          'Eksik Besin Değerleri',
          `"${foodName}" için bazı besin değerleri eksik. Ne yapmak istersiniz?`,
          [
            { 
              text: 'Eksik Değerlerle Kaydet', 
              onPress: () => {
                // Mevcut değerlerle kaydet
                saveFood(foodName, calories, protein, carbs, fat, imageUri);
              }
            },
            { 
              text: 'Manuel Düzenle', 
              onPress: () => {
                // Detaylı düzenleme ekranına git
                navigation.navigate('FoodEntry', {
                  foodItem: {
                    id: Date.now().toString(),
                    name: foodName,
                    calories: Number(calories),
                    protein: Number(protein),
                    carbs: Number(carbs),
                    fat: Number(fat),
                    date: selectedDate.toISOString(),
                    mealType: 'lunch',
                    imageUri: imageUri
                  },
                  selectedDate: selectedDate
                });
                setIsAnalyzing(false);
              },
              style: 'default'
            }
          ]
        );
      } else {
        // Tam verileri olan yemeği direkt kaydet
        saveFood(foodName, calories, protein, carbs, fat, imageUri);
      }
    } catch (error) {
      console.error('Görüntü analiz edilirken hata oluştu:', error);
      
      // Hata mesajını özelleştir
      let errorMessage = 'Yemek tanınamadı. Lütfen manuel olarak ekleyin veya tekrar deneyin.';
      if (error instanceof Error) {
        console.error('Error details:', error.message, error.stack);
        if (error.message.includes('API anahtarı')) {
          errorMessage = 'API anahtarı geçersiz veya eksik. API ayarlarınızı kontrol edin.';
        }
      }
      
      Alert.alert('Analiz Hatası', errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Yemek kaydetme yardımcı fonksiyonu
  const saveFood = async (name: string, calories: number, protein: number, carbs: number, fat: number, imageUri?: string) => {
    try {
      // Yeni yemek oluştur
      const newFood: FoodItem = {
        id: Date.now().toString(),
        name: name,
        calories: Number(calories),
        protein: Number(protein),
        carbs: Number(carbs),
        fat: Number(fat),
        date: selectedDate.toISOString(),
        mealType: 'lunch', // Varsayılan öğün tipi
        imageUri: imageUri
      };
      
      console.log('Oluşturulan yemek:', newFood);
      
      // Yemeği kaydet
      await addFood(newFood);
      
      // Başarılı mesajı göster
      showToast(`${newFood.name} eklendi (${newFood.calories} kcal)`, 'success');
    } catch (error) {
      console.error('Yemek kaydedilirken hata oluştu:', error);
      Alert.alert('Hata', 'Yemek kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Metin tabanlı yemek analizi için AI çağrısı
  const analyzeTextWithAI = async (text: string): Promise<any> => {
    const apiKey = apiKeys[preferredProvider];
    if (!apiKey) {
      throw new Error('API anahtarı bulunamadı');
    }
    
    console.log(`Analyzing text with ${preferredProvider} API: "${text}"`);
    
    try {
      // Text promtu oluştur
      const prompt = `Aşağıdaki yemek için besin değerlerini JSON formatında ver: ${text}
      
      Yanıtını şu formatta ver:
      {
        "name": "Yemek adı",
        "nutritionFacts": {
          "calories": sayı,
          "protein": sayı,
          "carbs": sayı,
          "fat": sayı
        }
      }`;
      
      // createCompletion fonksiyonunu kullan
      const completion = await createCompletion(
        preferredProvider,
        prompt,
        apiKey
      );
      
      console.log("AI yanıtı:", completion);
      
      // JSON yanıtını çıkar
      const jsonMatch = completion.match(/\{.*\}/s);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        console.log("Parse edilmiş sonuç:", result);
        return result;
      }
      
      throw new Error('AI yanıtından JSON çıkarılamadı');
    } catch (error) {
      console.error('AI analizi sırasında hata:', error);
      throw error;
    }
  };

  // Basit giriş için
  const handleQuickEntry = async () => {
    if (inputText.trim().length > 0) {
      // API anahtarı kontrolü
      if (!checkApiKey()) {
        return;
      }
      
      try {
        setIsAnalyzing(true);
        
        // Gerçek API çağrısı yap
        console.log("Yemek analizi başlıyor:", inputText);
        const result = await analyzeTextWithAI(inputText);
        
        // AI sonuçlarını kullanarak yeni yemek oluştur
        const newFood: FoodItem = {
          id: Date.now().toString(),
          name: result.name || inputText,
          calories: result.nutritionFacts.calories,
          protein: result.nutritionFacts.protein,
          carbs: result.nutritionFacts.carbs,
          fat: result.nutritionFacts.fat,
          date: selectedDate.toISOString(),
          mealType: 'lunch', // Varsayılan öğün tipi
        };
        
        await addFood(newFood);
        
        // Alert yerine toast kullan
        showToast(`${newFood.name} eklendi (${newFood.calories} kcal)`, 'success');
        
        // Input temizle
        setInputText('');
        handleFocusChange(false);
        Keyboard.dismiss();
      } catch (error) {
        console.error('Yemek eklenirken hata oluştu:', error);
        Alert.alert('Hata', 'Yemek eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  // Klavye ve focus durumuna göre butonları gösterme durumu
  const shouldShowButtons = isInputFocused && (isKeyboardVisible || inputText.trim().length > 0);

  return (
    <View style={[
      styles.container,
      shouldShowButtons && styles.containerExpanded
    ]}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ne yediniz?"
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={inputText}
          onChangeText={setInputText}
          onFocus={() => handleFocusChange(true)}
          onBlur={() => handleFocusChange(false)}
        />
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={handleGalleryPick}
            disabled={isAnalyzing}
          >
            <Text style={styles.icon}>🖼️</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={handleCameraCapture}
            disabled={isAnalyzing}
          >
            <Text style={styles.icon}>📷</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {shouldShowButtons && (
        <View style={styles.quickEntryContainer}>
          <TouchableOpacity 
            style={styles.quickEntryButton}
            onPress={handleQuickEntry}
            disabled={inputText.trim().length === 0 || isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator size="small" color={theme.colors.onPrimary} />
            ) : (
              <Text style={styles.quickEntryButtonText}>Hızlı Ekle</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.advancedEntryButton}
            onPress={handleAdvancedEntry}
          >
            <Text style={styles.advancedEntryButtonText}>Gelişmiş</Text>
          </TouchableOpacity>
        </View>
      )}

      {isAnalyzing && !isInputFocused && (
        <Modal
          transparent={true}
          visible={isAnalyzing && !isInputFocused}
          animationType="fade"
        >
          <View style={styles.modalBackground}>
            <View style={styles.globalLoading}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Yemek Analiz Ediliyor...</Text>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.dark ? theme.colors.surfaceVariant : '#F8E8F0',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  containerExpanded: {
    paddingBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    height: 54,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.onSurface,
    paddingVertical: 8,
    paddingLeft: 5,
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    height: 36,
  },
  icon: {
    fontSize: 20,
  },
  quickEntryContainer: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  quickEntryButton: {
    backgroundColor: theme.colors.primary,
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  quickEntryButtonText: {
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
  advancedEntryButton: {
    backgroundColor: theme.dark ? theme.colors.surfaceDisabled : '#E0E0E0',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  advancedEntryButtonText: {
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  globalLoading: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loadingText: {
    color: theme.colors.onSurface,
    marginTop: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});

export default FoodEntryBar; 