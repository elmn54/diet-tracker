import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, Keyboard, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme, MD3Theme } from 'react-native-paper';
import { useFoodStore, FoodItem } from '../store/foodStore';
import { useApiKeyStore } from '../store/apiKeyStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Ana Sayfa'>;

const FoodEntryBar: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [inputText, setInputText] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const theme = useTheme();
  const { addFood } = useFoodStore();
  const { apiKeys, preferredProvider } = useApiKeyStore();
  
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

  // Basit giriş için
  const handleQuickEntry = async () => {
    if (inputText.trim().length > 0) {
      // API anahtarı kontrolü
      if (!checkApiKey()) {
        return;
      }
      
      try {
        // Normalde burada API çağrısı yapılırdı
        // Şimdilik simüle ediyoruz
        const newFood: FoodItem = {
          id: Date.now().toString(),
          name: inputText,
          calories: 150, // Varsayılan değerler
          protein: 5,
          carbs: 20,
          fat: 7,
          date: new Date().toISOString(),
          mealType: 'lunch', // Varsayılan öğün tipi
        };
        
        // API anahtarı var ama simülasyon amaçlı temel kelime analizi
        const lowerText = inputText.toLowerCase();
        if (lowerText.includes('pilav') || lowerText.includes('rice')) {
          newFood.name = 'Pilav';
          newFood.calories = 240;
          newFood.protein = 4.5;
          newFood.carbs = 50;
          newFood.fat = 3.2;
        } else if (lowerText.includes('tavuk') || lowerText.includes('chicken')) {
          newFood.name = 'Tavuk Göğsü';
          newFood.calories = 165;
          newFood.protein = 31;
          newFood.carbs = 0;
          newFood.fat = 3.6;
        } else if (lowerText.includes('salata') || lowerText.includes('salad')) {
          newFood.name = 'Karışık Salata';
          newFood.calories = 45;
          newFood.protein = 2;
          newFood.carbs = 8;
          newFood.fat = 0.5;
        }
        
        await addFood(newFood);
        
        // Input temizle
        setInputText('');
        setIsInputFocused(false);
        Keyboard.dismiss();
      } catch (error) {
        console.error('Yemek eklenirken hata oluştu:', error);
        Alert.alert('Hata', 'Yemek eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
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
            disabled={inputText.trim().length === 0}
          >
            <Text style={styles.quickEntryButtonText}>Hızlı Ekle</Text>
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