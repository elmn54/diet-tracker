import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, Keyboard, Alert, ActivityIndicator, BackHandler, KeyboardEvent, Platform, KeyboardAvoidingView } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme, MD3Theme } from 'react-native-paper';
import { useFoodStore, FoodItem } from '../store/foodStore';
import { useActivityStore } from '../store/activityStore';
import { ActivityItem, ActivityType, ActivityIntensity } from '../types/activity';
import { useApiKeyStore } from '../store/apiKeyStore';
import { useUIStore } from '../store/uiStore';
// Gerçek API hizmetini ekle
import { AI_PROVIDERS } from '../constants/aiProviders';
import { createCompletion } from '../services/aiService.js';
// Fotoğraf işlemleri için
import * as ImagePicker from 'expo-image-picker';
import { identifyFood } from '../services/foodRecognitionService';
import { useSubscriptionStore, SubscriptionPlan } from '../store/subscriptionStore';
import { useAdManager } from '../hooks/useAdManager';
import Svg, { Path, Rect } from 'react-native-svg';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Ana Sayfa'>;

interface FoodEntryBarProps {
  selectedDate?: Date;
  hideCaloriesAndMacros?: boolean;
  onFocusChange?: (isFocused: boolean) => void;
}

// Input type determination enum
enum InputType {
  Food = 'food',
  Activity = 'activity',
  Unknown = 'unknown'
}

const FoodEntryBar: React.FC<FoodEntryBarProps> = ({ 
  selectedDate = new Date(),
  hideCaloriesAndMacros = true,
  onFocusChange
}) => {
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused(); // Track if the screen is active
  const [inputText, setInputText] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inputType, setInputType] = useState<InputType>(InputType.Unknown); // State to track input type
  const [showEntryTypeModal, setShowEntryTypeModal] = useState(false); // Advanced entry type selection modal
  const theme = useTheme();
  const { addFood } = useFoodStore();
  const { addActivity } = useActivityStore();
  const { showToast } = useUIStore();
  const { trackUserEntry, remainingEntries, isAdFree, showAdManually } = useAdManager();
  const inputRef = useRef<TextInput>(null);
  
  // Get API information from store
  const apiKeys = useApiKeyStore(state => state.apiKeys);
  const preferredProvider = useApiKeyStore(state => state.preferredProvider);
  
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  const styles = makeStyles(theme);
  
  // Reset focus when screen changes or back button is pressed
  useEffect(() => {
    if (!isFocused) {
      // Reset input and focus state when screen is not active
      setIsInputFocused(false);
      if (onFocusChange) {
        onFocusChange(false);
      }
    }
  }, [isFocused, onFocusChange]);

  // Listen for navigation events
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      // Remove focus when navigating away from screen
      handleFocusChange(false);
      Keyboard.dismiss();
    });

    return unsubscribe;
  }, [navigation]);
  
  // Listen for keyboard events
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
        
        // When keyboard is hidden, e.g. when Android back button is pressed
        // reset focus and buttons (user is canceling operation)
        if (isInputFocused) {
          handleFocusChange(false);
          if (inputRef.current) {
            inputRef.current.blur();
          }
        }
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, [isInputFocused]);

  // Klavye olaylarını dinle
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e: KeyboardEvent) => {
        // Klavye yüksekliğine küçük bir boşluk ekle
        setKeyboardHeight(e.endCoordinates.height + (Platform.OS === 'ios' ? 10 : 0));
      }
    );
    
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );
    
    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // Handle input focus change
  const handleFocusChange = (focused: boolean) => {
    setIsInputFocused(focused);
    if (onFocusChange) {
      onFocusChange(focused);
    }
  };

  // Show advanced entry selection modal
  const handleAdvancedEntry = () => {
    setShowEntryTypeModal(true);
  };

  // Advanced food entry
  const handleAdvancedFoodEntry = () => {
    setShowEntryTypeModal(false);
    handleFocusChange(false);
    Keyboard.dismiss();
    
    navigation.navigate('FoodEntry', { selectedDate: selectedDate.toISOString() });
  };

  // Advanced activity entry (redirect to ActivityEntryScreen)
  const handleAdvancedActivityEntry = () => {
    setShowEntryTypeModal(false);
    handleFocusChange(false);
    Keyboard.dismiss();
    
    // ActivityEntry screen will be created in the next step
    navigation.navigate('ActivityEntry', { selectedDate: selectedDate.toISOString() });
  };

  // Camera permission request
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is required.');
      return false;
    }
    return true;
  };

  // Gallery permission request
  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Gallery permission is required.');
      return false;
    }
    return true;
  };

  // Analyze with image API
  const analyzeImageWithAI = async (imageUri: string): Promise<any> => {
    const apiKey = apiKeys[preferredProvider];
    if (!apiKey) {
      throw new Error('API key not found');
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
      console.error('API call error:', error);
      throw error;
    }
  };

  // Take photo with camera and analyze
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
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Photo could not be taken. Please try again.');
    }
  };

  // Select photo from gallery and analyze
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
      console.error('Error selecting photo:', error);
      Alert.alert('Error', 'Photo could not be selected. Please try again.');
    }
  };

  // API key check
  const checkApiKey = (): boolean => {
    const apiKey = apiKeys[preferredProvider];
    if (!apiKey) {
      Alert.alert(
        'API Key Required', 
        'An API key is required for food analysis. Would you like to go to API settings?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Go to API Settings',
            onPress: () => navigation.navigate('ApiSettings')
          }
        ]
      );
      return false;
    }
    return true;
  };

  // Analyze image and save
  const analyzeAndSaveImage = async (imageUri: string) => {
    setIsAnalyzing(true);
    
    try {
      // API key check
      if (!checkApiKey()) {
        setIsAnalyzing(false);
        return;
      }
      
      // Ücretsiz kullanıcı için reklam kontrolü
      if (!isAdFree && remainingEntries === 0) {
        const adWatched = await showAdManually();
        if (!adWatched) {
          // Kullanıcı reklamı izlemediyse (reklam yüklenemedi veya kapatıldı)
          Alert.alert(
            'Limit Reached',
            'You have reached your limit. Please watch an ad to continue.',
            [{ text: 'I understand' }]
          );
          setIsAnalyzing(false);
          return;
        }
      }
      
      // Get data from API
      const result = await analyzeImageWithAI(imageUri);
      console.log('Raw result:', JSON.stringify(result));
      
      // Check API response structure and use accordingly
      let foodName = 'Unknown Food';
      let calories = 0;
      let protein = 0;
      let carbs = 0;
      let fat = 0;
      let hasCompleteData = true;
      
      // Check name or foodName fields
      if (typeof result === 'object' && result !== null) {
        foodName = result.name || result.foodName || 'Unknown Food';
        
        // Nutrition values check - support for various response structures
        if (result.nutritionFacts) {
          calories = result.nutritionFacts.calories || 0;
          protein = result.nutritionFacts.protein || 0;
          carbs = result.nutritionFacts.carbs || 0;
          fat = result.nutritionFacts.fat || 0;
          
          // Check if data is missing
          if (result.nutritionFacts.protein === null || 
              result.nutritionFacts.carbs === null || 
              result.nutritionFacts.fat === null) {
            hasCompleteData = false;
          }
        } else {
          // Might be directly in the main object
          calories = result.calories || 0;
          protein = result.protein || 0;
          carbs = result.carbs || 0;
          fat = result.fat || 0;
          
          // Check missing data in main object
          if (result.protein === null || result.carbs === null || result.fat === null) {
            hasCompleteData = false;
          }
        }
      }
      
      // Ask user if there are missing nutritional values
      if (!hasCompleteData) {
        Alert.alert(
          'Missing Nutritional Values',
          `Some nutritional values for "${foodName}" are missing. What would you like to do?`,
          [
            { 
              text: 'Save with Missing Values', 
              onPress: () => {
                // Save with current values
                saveFood(foodName, calories, protein, carbs, fat, imageUri);
              }
            },
            { 
              text: 'Edit Manually', 
              onPress: () => {
                // Go to detailed edit screen
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
                  selectedDate: selectedDate.toISOString()
                });
                setIsAnalyzing(false);
              },
              style: 'default'
            }
          ]
        );
      } else {
        // Save food with complete data directly
        saveFood(foodName, calories, protein, carbs, fat, imageUri);
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      
      // Hata mesajını özelleştir
      let errorMessage = 'Food could not be recognized. Please add manually or try again.';
      if (error instanceof Error) {
        console.error('Error details:', error.message, error.stack);
        if (error.message.includes('API key')) {
          errorMessage = 'Invalid or missing API key. Please check your API settings.';
        }
      }
      
      Alert.alert('Analysis Error', errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Food saving helper function
  const saveFood = async (name: string, calories: number, protein: number, carbs: number, fat: number, imageUri?: string) => {
    try {
      // Ücretsiz kullanıcı için reklam kontrolü
      if (!isAdFree && remainingEntries === 0) {
        const adWatched = await showAdManually();
        if (!adWatched) {
          // Kullanıcı reklamı izlemediyse (reklam yüklenemedi veya kapatıldı)
          Alert.alert(
            'Limit Reached',
            'You have reached your limit. Please watch an ad to continue.',
            [{ text: 'I understand' }]
          );
          return;
        }
      }

      // Create new food
      const newFood: FoodItem = {
        id: Date.now().toString(),
        name: name,
        calories: Number(calories),
        protein: Number(protein),
        carbs: Number(carbs),
        fat: Number(fat),
        date: selectedDate.toISOString(),
        mealType: 'lunch', // Default meal type
        imageUri: imageUri
      };
      
      console.log('Created food:', newFood);
      
      // Save the food
      await addFood(newFood);
      
      // Ücretsiz kullanıcı için giriş sayacını artır
      await trackUserEntry();
      
      // Show success message
      showToast(`${newFood.name} added (${newFood.calories} kcal)`, 'success');
    } catch (error) {
      console.error('Error saving food:', error);
      Alert.alert('Error', 'An error occurred while saving food. Please try again.');
    }
  };

  // Metin analizi ile giriş tipini belirle
  const detectInputType = (text: string): InputType => {
    // Aktivite-ilişkili anahtar kelimeler
    const activityKeywords = [
      'walked', 'walk', 'run', 'running', 'bike', 'biking', 'swim', 'swimming',
      'exercise', 'sport', 'training', 'workout', 'fitness', 'gym', 'gymnastics',
      'yoga', 'pilates', 'aerobic', 'dance', 'football', 'basketball', 'volleyball', 'tennis',
      'minutes', 'hours', 'km', 'steps', 'step', 'workout', 'gym', 'exercise', 'walking',
      'running', 'swimming', 'cycling', 'diving'
    ];

    // Yaygın yemek kelimeleri - bu kelimeler varsa, muhtemelen yemektir
    const foodKeywords = [
      'bread', 'food', 'ate', 'eat', 'drink', 'breakfast', 'lunch', 'dinner',
      'meal', 'plate', 'portion', 'slice', 'piece', 'count',
      'soup', 'salad', 'fruit', 'vegetable', 'meat', 'chicken', 'fish', 'milk', 'yogurt',
      'cheese', 'egg', 'pasta', 'rice', 'pastry', 'dessert', 'chocolate', 'cake',
      'cookie', 'drank', 'water', 'tea', 'coffee', 'juice', 'soda'
    ];

    // Giriş metni küçük harflere çevir
    const lowerText = text.toLowerCase();

    // Önce yaygın yemek kelimeleriyle eşleşme kontrolü
    for (const keyword of foodKeywords) {
      if (lowerText.includes(keyword)) {
        return InputType.Food;
      }
    }

    // Aktivite anahtar kelimelerinden herhangi birini içeriyor mu kontrol et
    for (const keyword of activityKeywords) {
      if (lowerText.includes(keyword)) {
        return InputType.Activity;
      }
    }

    // Hiçbir özel belirteç yoksa, varsayılan olarak yemek kabul et
    return InputType.Food;
  };

  // Arama besin değeri verilerini çıkar
  const extractNutritionData = (result: any): { foodData?: any, activityData?: any } => {
    try {
      // Yanıt boş veya geçersizse
      if (!result || typeof result !== 'object') {
        console.error('Invalid AI response:', result);
        return {};
      }
      
      // Yemek analizi olma durumu
      if (result.nutritionFacts || 
          (result.calories !== undefined && 
          (result.protein !== undefined || result.carbs !== undefined || result.fat !== undefined))) {
        
        let name = result.name || 'Unknown Food';
        let calories = 0;
        let protein = 0;
        let carbs = 0;
        let fat = 0;
        
        // Besin değerleri nutritionFacts içinde mi yoksa direkt objede mi
        if (result.nutritionFacts) {
          calories = result.nutritionFacts.calories || 0;
          protein = result.nutritionFacts.protein || 0;
          carbs = result.nutritionFacts.carbs || 0;
          fat = result.nutritionFacts.fat || 0;
        } else {
          // Direkt objede
          calories = result.calories || 0;
          protein = result.protein || 0;
          carbs = result.carbs || 0;
          fat = result.fat || 0;
        }
        
        return {
          foodData: {
            name,
            calories,
            protein,
            carbs,
            fat
          }
        };
      }
      
      // Aktivite analizi olma durumu
      if (result.activityType !== undefined || 
          result.duration !== undefined || 
          result.caloriesBurned !== undefined) {
        
        return {
          activityData: {
            name: result.name || 'Unknown Activity',
            activityType: result.activityType || 'other',
            duration: result.duration || 30,
            intensity: result.intensity || ActivityIntensity.Medium,
            caloriesBurned: result.caloriesBurned || 100
          }
        };
      }
      
      // Belirlenemedi, boş döndür
      return {};
      
    } catch (error) {
      console.error('Data extraction error:', error);
      return {};
    }
  };

  // Tek bir AI isteği ile girdi analizi 
  const analyzeInputWithAI = async (text: string): Promise<{ type: InputType, data: any }> => {
    const apiKey = apiKeys[preferredProvider];
    if (!apiKey) {
      throw new Error('API key not found');
    }
    
    console.log(`Analyzing input with AI: "${text}"`);
    
    try {
      // Hem yemek hem aktivite analizi için birleştirilmiş prompt
      const prompt = `Analyze the input below and determine if it's a food or physical activity:
      
      "${text}"
      
      If it's a food or beverage, respond with this JSON format:
      {
        "name": "Food name",
        "nutritionFacts": {
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number
        }
      }
      
      If it's a physical activity or exercise, respond with this JSON format:
      {
        "name": "Activity name",
        "activityType": "walking or running or cycling or swimming or workout or other",
        "duration": duration (in minutes),
        "intensity": "low or medium or high",
        "caloriesBurned": amount of calories burned
      }
      
      Provide your response in JSON format only, without any additional explanation.`;
      
      // createCompletion fonksiyonunu kullan
      const completion = await createCompletion(
        preferredProvider,
        prompt,
        apiKey
      );
      
      console.log("AI unified response:", completion);
      
      // JSON yanıtını çıkar - daha sağlam bir yaklaşım
      let parsedResult;
      try {
        // Önce direkt olarak yanıtın kendisini JSON olarak ayrıştırmayı dene
        parsedResult = JSON.parse(completion.trim());
      } catch (parseError) {
        // Direkt parse başarısız olursa, regex ile JSON'ı bulmayı dene
        const jsonMatch = completion.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsedResult = JSON.parse(jsonMatch[0]);
          } catch (nestedParseError) {
            console.error("Found JSON could not be parsed:", nestedParseError);
            throw new Error("JSON response could not be parsed");
          }
        } else {
          throw new Error("Valid JSON response not found");
        }
      }
      
      // Veri çıkarma ve tür belirleme
      const extractedData = extractNutritionData(parsedResult);
      
      if (extractedData.foodData) {
        return { type: InputType.Food, data: extractedData.foodData };
      } else if (extractedData.activityData) {
        return { type: InputType.Activity, data: extractedData.activityData };
      }
      
      // Tür belirlenemezse basit algılama fonksiyonuna geri dön
      console.log("Type could not be determined from AI response, using simple detection");
      const backupType = detectInputType(text);
      
      // Varsayılan veriler
      if (backupType === InputType.Food) {
        return { 
          type: InputType.Food, 
          data: {
            name: text,
            calories: 100,
            protein: 5,
            carbs: 15,
            fat: 2
          } 
        };
      } else {
        return { 
          type: InputType.Activity, 
          data: {
            name: text,
            activityType: "other",
            duration: 30,
            intensity: ActivityIntensity.Medium,
            caloriesBurned: 100
          } 
        };
      }
      
    } catch (error) {
      console.error('Error during AI analysis:', error);
      
      // Hata durumunda basit algılama ve varsayılan değerler
      const fallbackType = detectInputType(text);
      
      if (fallbackType === InputType.Food) {
        return { 
          type: InputType.Food, 
          data: {
            name: text,
            calories: 100,
            protein: 5,
            carbs: 15,
            fat: 2
          } 
        };
      } else {
        return { 
          type: InputType.Activity, 
          data: {
            name: text,
            activityType: "other",
            duration: 30,
            intensity: ActivityIntensity.Medium,
            caloriesBurned: 100
          } 
        };
      }
    }
  };

  // Basit girişi değerlendir ve doğru işlemi yap (yemek veya aktivite)
  const handleQuickEntry = async () => {
    if (inputText.trim().length > 0) {
      // API anahtarı kontrolü
      if (!checkApiKey()) {
        return;
      }
      
      // Ücretsiz kullanıcı için reklam kontrolü
      if (!isAdFree && remainingEntries === 0) {
        const adWatched = await showAdManually();
        if (!adWatched) {
          // Kullanıcı reklamı izlemediyse (reklam yüklenemedi veya kapatıldı)
          Alert.alert(
            'Kullanım Sınırı',
            'Ücretsiz kullanım hakkınız bitti. Devam etmek için reklam izlemeniz gerekiyor.',
            [{ text: 'Anladım' }]
          );
          
          // Input durumunu temizle
          setInputText('');
          handleFocusChange(false);
          Keyboard.dismiss();
          return;
        }
      }
      
      try {
        setIsAnalyzing(true);
        
        // Tek seferde girdiyi analiz et
        const analysisResult = await analyzeInputWithAI(inputText);
        setInputType(analysisResult.type);
        
        if (analysisResult.type === InputType.Activity) {
          // Aktivite girişi
          console.log("Activity analysis result:", analysisResult.data);
          
          // AI sonuçlarını kullanarak yeni aktivite oluştur
          const newActivity: ActivityItem = {
            id: Date.now().toString(),
            name: analysisResult.data.name || inputText,
            calories: analysisResult.data.caloriesBurned || 0,
            activityType: analysisResult.data.activityType || 'other',
            duration: analysisResult.data.duration || 30,
            intensity: analysisResult.data.intensity || ActivityIntensity.Medium,
            date: selectedDate.toISOString(),
          };
          
          await addActivity(newActivity);
          
          // Ücretsiz kullanıcı için giriş sayacını artır
          await trackUserEntry();
          
          // Toast ile bildir
          showToast(`${newActivity.name} added (-${newActivity.calories} kcal)`, 'success');
        } else {
          // Yemek girişi
          console.log("Food analysis result:", analysisResult.data);
          
          // AI sonuçlarını kullanarak yeni yemek oluştur
          const newFood: FoodItem = {
            id: Date.now().toString(),
            name: analysisResult.data.name || inputText,
            calories: analysisResult.data.calories || 0,
            protein: analysisResult.data.protein || 0,
            carbs: analysisResult.data.carbs || 0,
            fat: analysisResult.data.fat || 0,
            date: selectedDate.toISOString(),
            mealType: 'lunch', // Varsayılan öğün tipi
          };
          
          await addFood(newFood);
          
          // Ücretsiz kullanıcı için giriş sayacını artır
          await trackUserEntry();
          
          // Alert yerine toast kullan
          showToast(`${newFood.name} added (${newFood.calories} kcal)`, 'success');
        }
        
        // Input temizle
        setInputText('');
        handleFocusChange(false);
        Keyboard.dismiss();
      } catch (error) {
        console.error('Error analyzing input:', error);
        Alert.alert('Error', 'An error occurred during analysis. Please try again.');
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  // Klavye ve focus durumuna göre butonları gösterme durumu
  const shouldShowButtons = isKeyboardVisible;

  return (
    <View 
      style={[
        styles.container,
        shouldShowButtons && styles.containerExpanded,
        { bottom: keyboardHeight > 0 ? keyboardHeight : 0 }
      ]}
    >
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Enter food or activity."
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
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Rect x="3" y="5" width="18" height="14" rx="2" stroke={theme.colors.onSurface} strokeWidth="2"/>
              <Path d="M3 17l5-5 3 3 5-5 5 5" stroke={theme.colors.onSurface} strokeWidth="2" strokeLinecap="round"/>
              <Path d="M8 10a1 1 0 100-2 1 1 0 000 2z" fill={theme.colors.onSurface}/>
            </Svg>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={handleCameraCapture}
            disabled={isAnalyzing}
          >
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke={theme.colors.onSurface} strokeWidth="2"/>
              <Path d="M12 17a4 4 0 100-8 4 4 0 000 8z" stroke={theme.colors.onSurface} strokeWidth="2"/>
            </Svg>
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
              <Text style={styles.quickEntryButtonText}>Quick Add</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.advancedEntryButton}
            onPress={handleAdvancedEntry}
          >
            <Text style={styles.advancedEntryButtonText}>Advanced</Text>
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
              <Text style={styles.loadingText}>
                {inputType === InputType.Activity ? 'Analyzing Activity...' : 'Analyzing Food...'}
              </Text>
            </View>
          </View>
        </Modal>
      )}

      {/* Entry Type Selection Modal */}
      <Modal
        transparent={true}
        visible={showEntryTypeModal}
        animationType="fade"
        onRequestClose={() => setShowEntryTypeModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.entryTypeModal}>
            <Text style={styles.entryTypeTitle}>What would you like to add?</Text>
            
            <TouchableOpacity 
              style={styles.entryTypeButton}
              onPress={handleAdvancedFoodEntry}
            >
              <Text style={styles.entryTypeButtonText}>🍔 Food</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.entryTypeButton}
              onPress={handleAdvancedActivityEntry}
            >
              <Text style={styles.entryTypeButtonText}>🏃 Activity</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.entryTypeCancelButton}
              onPress={() => setShowEntryTypeModal(false)}
            >
              <Text style={styles.entryTypeCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    zIndex: 9999,
    ...(Platform.OS === 'android' ? { 
      paddingBottom: 5,
      marginBottom: 0
    } : {}),
  },
  containerExpanded: {
    paddingBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    height: 50,
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
    marginTop: 5,
    marginBottom: 5,
    justifyContent: 'space-between',
    paddingBottom: 5,
  },
  quickEntryButton: {
    backgroundColor: theme.colors.primary,
    padding: 10,
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
    padding: 10,
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
  },
  entryTypeModal: {
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
  entryTypeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: 20,
    textAlign: 'center',
  },
  entryTypeButton: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  entryTypeButtonText: {
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  entryTypeCancelButton: {
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 5,
  },
  entryTypeCancelText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
});

export default FoodEntryBar; 