import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, Keyboard, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme, MD3Theme } from 'react-native-paper';
import { useFoodStore, FoodItem } from '../store/foodStore';
import { useApiKeyStore } from '../store/apiKeyStore';
// Gerçek API hizmetini ekle
import { AI_PROVIDERS } from '../constants/aiProviders';
import { createCompletion } from '../services/aiService.js';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Ana Sayfa'>;

const FoodEntryBar: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [inputText, setInputText] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const theme = useTheme();
  const { addFood } = useFoodStore();
  
  // Store'dan API bilgilerini al
  const apiKeys = useApiKeyStore(state => state.apiKeys);
  const preferredProvider = useApiKeyStore(state => state.preferredProvider);
  
  const styles = makeStyles(theme);

  // Gelişmiş yemek eklemeye git
  const handleAdvancedEntry = () => {
    setIsInputFocused(false);
    Keyboard.dismiss();
    navigation.navigate('FoodEntry');
  };

  // API anahtarı kontrolü
  const checkApiKey = (): boolean => {
    const apiKey = apiKeys[preferredProvider];
    if (!apiKey) {
      Alert.alert(
        'API Anahtarı Gerekli', 
        'Hızlı yemek analizi için bir API anahtarı gereklidir. API ayarlarına gitmek ister misiniz?',
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
          date: new Date().toISOString(),
          mealType: 'lunch', // Varsayılan öğün tipi
        };
        
        await addFood(newFood);
        
        Alert.alert('Başarılı', `${newFood.name} eklendi (${newFood.calories} kcal)`);
        
        // Input temizle
        setInputText('');
        setIsInputFocused(false);
        Keyboard.dismiss();
      } catch (error) {
        console.error('Yemek eklenirken hata oluştu:', error);
        Alert.alert('Hata', 'Yemek eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ne yediniz?"
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={inputText}
          onChangeText={setInputText}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
        />
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={handleAdvancedEntry}>
            <Text style={styles.icon}>⏱️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleAdvancedEntry}>
            <Text style={styles.icon}>🖼️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleAdvancedEntry}>
            <Text style={styles.icon}>📷</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {isInputFocused && (
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.onSurface,
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
});

export default FoodEntryBar; 