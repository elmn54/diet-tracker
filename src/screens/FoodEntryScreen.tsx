import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFoodStore, FoodItem } from '../store/foodStore';
import Input from '../components/Input';
import Button from '../components/Button';
import { RadioButton, Text, ActivityIndicator, Divider } from 'react-native-paper';
import { colors, spacing, typography, metrics } from '../constants/theme';
import * as ImagePicker from 'expo-image-picker';

// Yemek formu validasyon şeması
const foodSchema = z.object({
  name: z.string().min(1, { message: 'Yemek adı gereklidir' }),
  calories: z.string().min(1, { message: 'Kalori değeri gereklidir' })
    .refine((val) => !isNaN(Number(val)), { message: 'Geçerli bir sayı girin' }),
  protein: z.string().min(1, { message: 'Protein değeri gereklidir' })
    .refine((val) => !isNaN(Number(val)), { message: 'Geçerli bir sayı girin' }),
  carbs: z.string().min(1, { message: 'Karbonhidrat değeri gereklidir' })
    .refine((val) => !isNaN(Number(val)), { message: 'Geçerli bir sayı girin' }),
  fat: z.string().min(1, { message: 'Yağ değeri gereklidir' })
    .refine((val) => !isNaN(Number(val)), { message: 'Geçerli bir sayı girin' }),
});

type FoodFormData = z.infer<typeof foodSchema>;
type FoodEntryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FoodEntry'>;

// Bu API çağrı fonksiyonu mockup olarak düşünülmelidir
// Gerçek API entegrasyonu yapılacaktır
const analyzeImageWithAI = async (imageUri: string): Promise<any> => {
  // Bu sadece bir mock - gerçek API'den veri gelene kadar gecikme simüle ediliyor
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: 'Karışık Meyve Salatası',
        nutritionFacts: {
          calories: 120,
          protein: 1.5,
          carbs: 30,
          fat: 0.2
        }
      });
    }, 2000);
  });
};

const FoodEntryScreen = () => {
  const navigation = useNavigation<FoodEntryScreenNavigationProp>();
  const addFood = useFoodStore((state) => state.addFood);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { control, handleSubmit, formState: { errors }, setValue, reset } = useForm<FoodFormData>({
    resolver: zodResolver(foodSchema),
    defaultValues: {
      name: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
    },
  });

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Kamerayı kullanmak için izin gereklidir.');
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Galeriyi kullanmak için izin gereklidir.');
      return false;
    }
    return true;
  };

  const takePicture = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
        analyzeImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Fotoğraf çekerken hata oluştu:', error);
      Alert.alert('Hata', 'Fotoğraf çekilemedi. Lütfen tekrar deneyin.');
    }
  };

  const pickImage = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
        analyzeImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Fotoğraf seçerken hata oluştu:', error);
      Alert.alert('Hata', 'Fotoğraf seçilemedi. Lütfen tekrar deneyin.');
    }
  };

  const analyzeImage = async (imageUri: string) => {
    setIsAnalyzing(true);
    try {
      // API'den veri alma - burada mock kullanıyoruz
      const result = await analyzeImageWithAI(imageUri);
      
      // Form değerlerini AI analiz sonuçlarıyla doldur
      setValue('name', result.name);
      setValue('calories', String(result.nutritionFacts.calories));
      setValue('protein', String(result.nutritionFacts.protein));
      setValue('carbs', String(result.nutritionFacts.carbs));
      setValue('fat', String(result.nutritionFacts.fat));
      
      Alert.alert('Analiz Tamamlandı', 'Yemek bilgileri otomatik olarak dolduruldu. Gerekirse düzenleyebilirsiniz.');
    } catch (error) {
      console.error('Görüntü analiz edilirken hata oluştu:', error);
      Alert.alert('Analiz Hatası', 'Yemek tanınamadı. Lütfen bilgileri manuel olarak girin veya tekrar deneyin.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onSubmit = async (data: FoodFormData) => {
    try {
      setIsSubmitting(true);
      
      // Verileri sayısal değerlere dönüştürme
      const newFood: FoodItem = {
        id: Date.now().toString(),
        name: data.name,
        calories: Number(data.calories),
        protein: Number(data.protein),
        carbs: Number(data.carbs),
        fat: Number(data.fat),
        date: new Date().toISOString(),
        mealType: mealType,
        imageUri: image || undefined // Eğer varsa yemek fotoğrafını da sakla, yoksa undefined olsun
      };

      // Yemeği store'a ekleme
      await addFood(newFood);
      
      // Başarı mesajı gösterme
      Alert.alert(
        'Başarılı',
        'Yemek kaydedildi',
        [{ text: 'Tamam', onPress: () => {
          reset(); // Formu sıfırla
          setImage(null); // Resmi temizle
          navigation.navigate('Ana Sayfa');
        }}]
      );
    } catch (error) {
      console.error('Yemek eklenirken hata oluştu:', error);
      Alert.alert('Hata', 'Yemek kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Yemek Ekle</Text>
      
      {/* Fotoğraf Alanı */}
      <View style={styles.imageSection}>
        {image ? (
          <Image source={{ uri: image }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>Fotoğraf Yok</Text>
          </View>
        )}
        
        <View style={styles.imageButtons}>
          <TouchableOpacity 
            style={styles.imageButton} 
            onPress={takePicture}
            disabled={isAnalyzing}
          >
            <Text style={styles.imageButtonText}>Fotoğraf Çek</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.imageButton} 
            onPress={pickImage}
            disabled={isAnalyzing}
          >
            <Text style={styles.imageButtonText}>Galeriden Seç</Text>
          </TouchableOpacity>
        </View>
        
        {isAnalyzing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Yemek Analiz Ediliyor...</Text>
          </View>
        )}
      </View>
      
      <Divider style={styles.divider} />
      
      <Text style={styles.sectionTitle}>Öğün Tipi</Text>
      <RadioButton.Group
        onValueChange={(value) => setMealType(value as any)}
        value={mealType}
      >
        <View style={styles.radioRow}>
          <RadioButton.Item label="Kahvaltı" value="breakfast" />
          <RadioButton.Item label="Öğle Yemeği" value="lunch" />
        </View>
        <View style={styles.radioRow}>
          <RadioButton.Item label="Akşam Yemeği" value="dinner" />
          <RadioButton.Item label="Atıştırmalık" value="snack" />
        </View>
      </RadioButton.Group>
      
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Yemek Adı"
            placeholder="Örn: Yulaf Ezmesi"
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
            label="Kalori (kcal)"
            placeholder="Örn: 250"
            value={value}
            onChangeText={onChange}
            error={errors.calories?.message}
            keyboardType="numeric"
          />
        )}
      />
      
      <Text style={styles.sectionTitle}>Besin Değerleri (gram)</Text>
      
      <Controller
        control={control}
        name="protein"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Protein (g)"
            placeholder="Örn: 10"
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
            label="Karbonhidrat (g)"
            placeholder="Örn: 30"
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
            label="Yağ (g)"
            placeholder="Örn: 5"
            value={value}
            onChangeText={onChange}
            error={errors.fat?.message}
            keyboardType="numeric"
          />
        )}
      />
      
      <Button 
        title="Kaydet"
        onPress={handleSubmit(onSubmit)}
        style={styles.button}
        loading={isSubmitting}
        disabled={isSubmitting || isAnalyzing}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.m,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: 'bold',
    marginBottom: spacing.xl,
    textAlign: 'center',
    color: colors.text,
  },
  sectionTitle: {
    fontSize: typography.fontSize.large,
    fontWeight: 'bold',
    marginTop: spacing.m,
    marginBottom: spacing.s,
    color: colors.text,
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
    backgroundColor: colors.divider,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  placeholderText: {
    color: colors.textLight,
    fontSize: typography.fontSize.medium,
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  imageButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: metrics.borderRadius.medium,
    minWidth: 150,
    alignItems: 'center',
  },
  imageButtonText: {
    color: colors.surface,
    fontWeight: 'bold',
  },
  loadingContainer: {
    marginTop: spacing.m,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.s,
    color: colors.textLight,
    fontSize: typography.fontSize.medium,
  },
  button: {
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
    backgroundColor: colors.primary,
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.m,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioLabel: {
    fontSize: typography.fontSize.medium,
    color: colors.text,
    marginLeft: spacing.xs,
  },
  divider: {
    marginVertical: spacing.m,
  },
});

export default FoodEntryScreen; 