import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFoodStore, FoodItem } from '../store/foodStore';
import { useApiKeyStore } from '../store/apiKeyStore';
import { useSubscriptionStore, SubscriptionPlan } from '../store/subscriptionStore';
import Input from '../components/Input';
import Button from '../components/Button';
import { Text, ActivityIndicator, Divider, useTheme, MD3Theme } from 'react-native-paper';
import { spacing, typography, metrics } from '../constants/theme';
import * as ImagePicker from 'expo-image-picker';
import { identifyFood } from '../services/foodRecognitionService';
import { AI_PROVIDERS } from '../constants/aiProviders';

// Yemek formu validasyon şeması
const foodSchema = z.object({
  name: z.string().min(1, { message: 'Food name is required' }),
  calories: z.string().min(1, { message: 'Calorie value is required' })
    .refine((val) => !isNaN(Number(val)), { message: 'Enter a valid number' }),
  protein: z.string().min(1, { message: 'Protein value is required' })
    .refine((val) => !isNaN(Number(val)), { message: 'Enter a valid number' }),
  carbs: z.string().min(1, { message: 'Carbs value is required' })
    .refine((val) => !isNaN(Number(val)), { message: 'Enter a valid number' }),
  fat: z.string().min(1, { message: 'Fat value is required' })
    .refine((val) => !isNaN(Number(val)), { message: 'Enter a valid number' }),
});

type FoodFormData = z.infer<typeof foodSchema>;
type FoodEntryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FoodEntry'>;
type FoodEntryScreenRouteProp = RouteProp<RootStackParamList, 'FoodEntry'>;

const FoodEntryScreen = () => {
  const navigation = useNavigation<FoodEntryScreenNavigationProp>();
  const route = useRoute<FoodEntryScreenRouteProp>();
  const theme = useTheme();
  
  // Stable references to state functions
  const addFood = useFoodStore(useCallback(state => state.addFood, []));
  const updateFood = useFoodStore(useCallback(state => state.updateFood, []));
  
  // Use static store access to avoid subscription updates for rarely changing values
  const getApiKey = (provider: string) => {
    return useApiKeyStore.getState().apiKeys[provider];
  };
  
  const getPreferredProvider = () => {
    return useApiKeyStore.getState().preferredProvider;
  };
  
  const isFeatureAvailable = useCallback((feature: keyof Pick<SubscriptionPlan, 'isAdFree' | 'cloudSyncEnabled'>) => {
    return useSubscriptionStore.getState().isFeatureAvailable(feature);
  }, []);
  
  // Premium özelliklerine erişim kontrolü için yardımcı fonksiyon
  const isPremiumFeatureAvailable = useCallback(() => {
    // Premium özelliği cloudSyncEnabled ile kontrol ediyoruz
    return isFeatureAvailable('cloudSyncEnabled');
  }, [isFeatureAvailable]);
  
  const getRemainingRequests = useCallback(() => {
    // Eğer böyle bir fonksiyon yoksa, geçici bir değer döndürelim
    // İlgili fonksiyonun API isteklerinin limitini kontrol ettiğini varsayarak sınırsız döndürüyoruz
    return 100; // İhtiyaca göre düzeltilmeli
  }, []);
  
  // Memoized route params
  const editMode = useMemo(() => route.params?.editMode || false, [route.params]);
  const existingFood = useMemo(() => route.params?.foodItem, [route.params]);
  const openCamera = useMemo(() => route.params?.openCamera || false, [route.params]);
  const openGallery = useMemo(() => route.params?.openGallery || false, [route.params]);
  
  // Local state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState<string | null>(existingFood?.imageUri || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Yemeğin bir fotoğrafa sahip olup olmadığına veya fotoğraf/kamera ile başlatılıp başlatılmadığına göre fotoğraf bölümünü göster
  const [showPhotoSection, setShowPhotoSection] = useState(() => {
    // Eğer düzenleme modundaysak ve mevcut yemeğin fotoğrafı varsa veya
    // kamera/galeri ile açıldıysa fotoğraf bölümünü göster
    return image !== null || openCamera || openGallery;
  });
  
  const styles = makeStyles(theme);
  
  // Form yönetimi
  const { control, handleSubmit, formState: { errors }, setValue, reset } = useForm<FoodFormData>({
    resolver: zodResolver(foodSchema),
    defaultValues: {
      name: existingFood ? existingFood.name : '',
      calories: existingFood ? String(existingFood.calories) : '',
      protein: existingFood ? String(existingFood.protein) : '',
      carbs: existingFood ? String(existingFood.carbs) : '',
      fat: existingFood ? String(existingFood.fat) : ''
    }
  });
  
  // Otomatik olarak kamera veya galeri açma
  useEffect(() => {
    if (openCamera) {
      takePicture();
    } else if (openGallery) {
      pickImage();
    }
  }, [openCamera, openGallery]);
  
  // Resim seçme fonksiyonu
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        setImage(selectedImage.uri);
        
        // Eğer düzenleme modu değilse ve yemek bilgileri girilmemişse analiz et
        if (!editMode && !existingFood && isPremiumFeatureAvailable()) {
          analyzeImage(selectedImage.uri);
        }
      }
    } catch (error) {
      console.error('Resim seçilirken hata oluştu:', error);
      Alert.alert('Error', 'An error occurred while selecting the image.');
    }
  };
  
  // Resim çekme fonksiyonu
  const takePicture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required.');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const capturedImage = result.assets[0];
        setImage(capturedImage.uri);
        
        // Eğer düzenleme modu değilse ve yemek bilgileri girilmemişse analiz et
        if (!editMode && !existingFood && isPremiumFeatureAvailable()) {
          analyzeImage(capturedImage.uri);
        }
      }
    } catch (error) {
      console.error('Fotoğraf çekilirken hata oluştu:', error);
      Alert.alert('Error', 'An error occurred while taking the photo.');
    }
  };
  
  // Görüntü analizi fonksiyonu
  const analyzeImage = async (imageUri: string) => {
    // API anahtarı kontrolü
    const apiKey = getApiKey(getPreferredProvider());
    if (!apiKey) {
      Alert.alert(
        'API Key Missing',
        'An API key is required for food recognition. You can add it in API settings.',
        [
          { text: 'Cancel' },
          { 
            text: 'API Settings', 
            onPress: () => navigation.navigate('ApiSettings')
          }
        ]
      );
      return;
    }
    
    // Kalan istek sayısı kontrolü
    const remainingRequests = getRemainingRequests();
    if (remainingRequests <= 0) {
      Alert.alert(
        'Request Limit Exceeded',
        'You have reached your daily AI analysis limit. You can make more requests with a premium subscription.',
        [
          { text: 'Cancel' },
          { 
            text: 'Subscription Plans', 
            onPress: () => navigation.navigate('Pricing')
          }
        ]
      );
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      // Yemek tanıma servisini çağır
      const result = await identifyFood(
        { uri: imageUri }, 
        getPreferredProvider(),
        apiKey
      );
      
      // Form alanlarını doldur
      setValue('name', result.foodName);
      setValue('calories', String(result.nutritionFacts.calories));
      setValue('protein', String(result.nutritionFacts.protein));
      setValue('carbs', String(result.nutritionFacts.carbs));
      setValue('fat', String(result.nutritionFacts.fat));
      
      Alert.alert('Analysis Completed', 'Food information has been automatically filled. You can edit if needed.');
    } catch (error) {
      console.error('Görüntü analiz edilirken hata oluştu:', error);
      
      // Hata mesajını özelleştir
      let errorMessage = 'Food could not be recognized. Please enter information manually or try again.';
      if (error instanceof Error) {
        console.error('Error details:', error.message, error.stack);
        if (error.message.includes('API anahtarı')) {
          errorMessage = 'Invalid or missing API key. Check your API settings.';
        }
      }
      
      Alert.alert('Analysis Error', errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createFoodData = useCallback((data: FoodFormData): FoodItem => {
    return {
      id: editMode && existingFood ? existingFood.id : Date.now().toString(),
      name: data.name,
      calories: Number(data.calories),
      protein: Number(data.protein),
      carbs: Number(data.carbs),
      fat: Number(data.fat),
      date: editMode && existingFood 
        ? existingFood.date 
        : (route.params?.selectedDate ? route.params.selectedDate : new Date().toISOString()),
      mealType: editMode && existingFood ? existingFood.mealType : 'lunch',
      imageUri: image || null
    };
  }, [editMode, existingFood, image, route.params?.selectedDate]);

  const onSubmit = async (data: FoodFormData) => {
    try {
      setIsSubmitting(true);
      
      const foodData = createFoodData(data);

      if (editMode) {
        await updateFood(foodData);
        Alert.alert(
          'Success',
          'Food updated',
          [{ text: 'OK', onPress: () => {
            reset();
            setImage(null);
            navigation.goBack();
          }}]
        );
      } else {
        await addFood(foodData);
        Alert.alert(
          'Success',
          'Food saved',
          [{ text: 'OK', onPress: () => {
            reset();
            setImage(null);
            navigation.navigate('Ana Sayfa');
          }}]
        );
      }
    } catch (error) {
      console.error('Yemek işlemi sırasında hata oluştu:', error);
      Alert.alert('Error', 'An error occurred during the process. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Fotoğraf Alanı - Koşullu gösterim */}
      {showPhotoSection && (
        <>
          <View style={styles.imageSection}>
            {image ? (
              <Image source={{ uri: image }} style={styles.previewImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>No Photo</Text>
              </View>
            )}
            
            <View style={styles.imageButtons}>
              <TouchableOpacity 
                style={styles.imageButton} 
                onPress={takePicture}
                disabled={isAnalyzing}
              >
                <Text style={styles.imageButtonText}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.imageButton} 
                onPress={pickImage}
                disabled={isAnalyzing}
              >
                <Text style={styles.imageButtonText}>Select from Gallery</Text>
              </TouchableOpacity>
            </View>
            
            {isAnalyzing && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Analyzing Food...</Text>
              </View>
            )}
          </View>
          
          <Divider style={styles.divider} />
        </>
      )}
      
      {/* Yemek Verileri Formu */}
      <Text style={styles.sectionTitle}>Food Information</Text>
      
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Food Name"
            placeholder="E.g: Grilled Chicken"
            value={value}
            onChangeText={onChange}
            error={errors.name?.message}
          />
        )}
      />
      
      <Controller
        control={control}
        name="calories"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Calories (kcal)"
            placeholder="E.g: 250"
            value={value}
            onChangeText={onChange}
            error={errors.calories?.message}
            keyboardType="numeric"
          />
        )}
      />
      
      <Controller
        control={control}
        name="protein"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Protein (g)"
            placeholder="E.g: 20"
            value={value}
            onChangeText={onChange}
            error={errors.protein?.message}
            keyboardType="numeric"
          />
        )}
      />
      
      <Controller
        control={control}
        name="carbs"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Carbohydrates (g)"
            placeholder="E.g: 30"
            value={value}
            onChangeText={onChange}
            error={errors.carbs?.message}
            keyboardType="numeric"
          />
        )}
      />
      
      <Controller
        control={control}
        name="fat"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Fat (g)"
            placeholder="E.g: 5"
            value={value}
            onChangeText={onChange}
            error={errors.fat?.message}
            keyboardType="numeric"
          />
        )}
      />
      
      <Button 
        title={editMode ? "Update" : "Save"}
        onPress={handleSubmit(onSubmit)}
        style={styles.button}
        loading={isSubmitting}
        disabled={isSubmitting || isAnalyzing}
      />
    </ScrollView>
  );
};

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.m,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: 'bold',
    marginBottom: spacing.xl,
    textAlign: 'center',
    color: theme.colors.onBackground,
  },
  sectionTitle: {
    fontSize: typography.fontSize.large,
    fontWeight: 'bold',
    marginTop: spacing.m,
    marginBottom: spacing.s,
    color: theme.colors.onBackground,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: metrics.borderRadius.medium,
    marginBottom: spacing.s,
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    borderRadius: metrics.borderRadius.medium,
    backgroundColor: theme.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  placeholderText: {
    color: theme.colors.onSurfaceVariant,
    fontSize: typography.fontSize.medium,
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  imageButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: metrics.borderRadius.medium,
    minWidth: 150,
    alignItems: 'center',
  },
  imageButtonText: {
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
  loadingContainer: {
    marginTop: spacing.m,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.s,
    color: theme.colors.onSurfaceVariant,
    fontSize: typography.fontSize.medium,
  },
  divider: {
    marginVertical: spacing.m,
  },
  button: {
    marginTop: spacing.l,
    marginBottom: spacing.xl,
  }
});

export default FoodEntryScreen; 