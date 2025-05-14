import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useActivityStore } from '../store/activityStore';
import { ActivityItem, ActivityType, ActivityIntensity } from '../types/activity';
import Input from '../components/Input';
import Button from '../components/Button';
import { Text, ActivityIndicator, Divider, useTheme, MD3Theme, SegmentedButtons } from 'react-native-paper';
import { spacing, typography, metrics } from '../constants/theme';
import { calculateCaloriesBurned } from '../store/activityStore';

// Aktivite formu validasyon şeması
const activitySchema = z.object({
  name: z.string().min(1, { message: 'Aktivite adı gereklidir' }),
  duration: z.string().min(1, { message: 'Süre değeri gereklidir' })
    .refine((val) => !isNaN(Number(val)), { message: 'Geçerli bir sayı girin' })
    .refine((val) => Number(val) > 0, { message: 'Süre 0\'dan büyük olmalıdır' }),
});

type ActivityFormData = z.infer<typeof activitySchema>;

type ActivityEntryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ActivityEntry'>;
type ActivityEntryScreenRouteProp = RouteProp<RootStackParamList, 'ActivityEntry'>;

const ActivityEntryScreen = () => {
  const navigation = useNavigation<ActivityEntryScreenNavigationProp>();
  const route = useRoute<ActivityEntryScreenRouteProp>();
  const theme = useTheme();
  const styles = makeStyles(theme);
  
  const { addActivity, updateActivity } = useActivityStore();
  
  // Route parametrelerinden editMode ve activityItem al
  const editMode = route.params?.editMode || false;
  const existingActivity = route.params?.activityItem;
  const selectedDate = route.params?.selectedDate || new Date();
  
  // Aktivite türü ve yoğunluğu için state
  const [activityType, setActivityType] = useState<ActivityType>(existingActivity?.activityType || 'walking');
  const [intensity, setIntensity] = useState<ActivityIntensity>(existingActivity?.intensity || ActivityIntensity.Medium);
  const [caloriesBurned, setCaloriesBurned] = useState<number>(existingActivity?.calories || 0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // activityType değiştiğinde başlangıç kalori değerini ayarla
  useEffect(() => {
    if (activityType === 'other' && !existingActivity) {
      // "Diğer" seçildiğinde varsayılan değer
      setCaloriesBurned(100);
    }
  }, [activityType]);
  
  // Form yönetimi
  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      name: existingActivity?.name || '',
      duration: existingActivity?.duration.toString() || '',
    }
  });
  
  // Watch değerlerini kullanarak yakılan kalori hesapla
  const durationValue = watch('duration');
  
  useEffect(() => {
    // Süre, aktivite türü veya yoğunluk değiştiğinde kalori hesapla
    if (durationValue && !isNaN(Number(durationValue)) && activityType !== 'other') {
      const duration = Number(durationValue);
      const calculatedCalories = calculateCaloriesBurned(activityType, intensity, duration);
      setCaloriesBurned(calculatedCalories);
    }
  }, [durationValue, activityType, intensity]);
  
  // Kalori değeri manuel girişi
  const handleCaloriesChange = (value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      setCaloriesBurned(numValue);
    }
  };
  
  // Aktivite ekleme/güncelleme fonksiyonu
  const onSubmit = useCallback(async (data: ActivityFormData) => {
    try {
      setIsLoading(true);
      
      const activityData: ActivityItem = {
        id: editMode && existingActivity ? existingActivity.id : Date.now().toString(),
        name: data.name,
        calories: caloriesBurned,
        activityType: activityType,
        duration: Number(data.duration),
        intensity: intensity,
        date: selectedDate.toISOString(),
        imageUri: undefined // İleride eklenebilir
      };
      
      if (editMode && existingActivity) {
        // Mevcut aktiviteyi güncelle
        await updateActivity(activityData);
        Alert.alert('Başarılı', 'Aktivite güncellendi');
      } else {
        // Yeni aktivite ekle
        await addActivity(activityData);
        Alert.alert('Başarılı', 'Aktivite eklendi');
      }
      
      // Ana ekrana geri dön
      navigation.goBack();
    } catch (error) {
      console.error('Aktivite kaydedilirken hata oluştu:', error);
      Alert.alert('Hata', 'Aktivite kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  }, [editMode, existingActivity, navigation, addActivity, updateActivity, selectedDate, activityType, intensity, caloriesBurned]);
  
  // Aktivite türü seçenekleri
  const activityTypeOptions = [
    { value: 'walking', label: '🚶 Yürüyüş' },
    { value: 'running', label: '🏃 Koşu' },
    { value: 'cycling', label: '🚲 Bisiklet' },
    { value: 'swimming', label: '🏊 Yüzme' },
    { value: 'workout', label: '💪 Egzersiz' },
    { value: 'other', label: '⚡ Diğer' }
  ];
  
  // Yoğunluk seçenekleri
  const intensityOptions = [
    { value: ActivityIntensity.Low, label: 'Düşük' },
    { value: ActivityIntensity.Medium, label: 'Orta' },
    { value: ActivityIntensity.High, label: 'Yüksek' }
  ];
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {editMode ? 'Aktiviteyi Düzenle' : 'Yeni Aktivite Ekle'}
      </Text>
      
      <View style={styles.formContainer}>
        {/* Aktivite adı */}
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Aktivite Adı"
              placeholder="Örn: Tempolu Yürüyüş"
              onChangeText={onChange}
              value={value}
              error={errors.name?.message}
            />
          )}
        />
        
        {/* Süre (dakika) */}
        <Controller
          control={control}
          name="duration"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Süre (dakika)"
              placeholder="Örn: 30"
              onChangeText={onChange}
              value={value}
              error={errors.duration?.message}
              keyboardType="numeric"
            />
          )}
        />
        
        {/* Aktivite Türü */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Aktivite Türü</Text>
          <View style={styles.activityTypeContainer}>
            {activityTypeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.activityTypeButton,
                  activityType === option.value && styles.activityTypeButtonSelected
                ]}
                onPress={() => setActivityType(option.value as ActivityType)}
              >
                <Text 
                  style={[
                    styles.activityTypeButtonText,
                    activityType === option.value && styles.activityTypeButtonTextSelected
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Aktivite Yoğunluğu - Sadece "Diğer" kategorisi seçili değilse göster */}
        {activityType !== 'other' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Yoğunluk</Text>
            <SegmentedButtons
              value={intensity}
              onValueChange={(value) => setIntensity(value as ActivityIntensity)}
              buttons={intensityOptions}
            />
          </View>
        )}
        
        {/* Tahmini yakılan kalori */}
        <View style={styles.calorieContainer}>
          <Text style={styles.sectionTitle}>Yakılan Kalori</Text>
          {activityType === 'other' ? (
            <Input
              label="Yakılan kalori (kcal)"
              placeholder="Örn: 150"
              onChangeText={handleCaloriesChange}
              value={caloriesBurned.toString()}
              keyboardType="numeric"
              style={styles.calorieInput}
            />
          ) : (
            <Text style={styles.calorieValue}>{caloriesBurned} kcal</Text>
          )}
        </View>
        
        {/* Kaydetme butonu */}
        <Button
          style={styles.button}
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          disabled={isLoading}
          title={editMode ? 'Güncelle' : 'Kaydet'}
        />
        
        {/* İptal etme butonu */}
        <Button
          style={styles.cancelButton}
          mode="outlined"
          onPress={() => navigation.goBack()}
          disabled={isLoading}
          title="İptal"
        />
      </View>
    </ScrollView>
  );
};

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.onBackground,
    marginVertical: spacing.m,
    marginHorizontal: spacing.m,
  },
  formContainer: {
    padding: spacing.m,
  },
  sectionContainer: {
    marginVertical: spacing.s,
  },
  sectionTitle: {
    fontSize: typography.fontSize.medium,
    color: theme.colors.onBackground,
    marginBottom: spacing.xs,
  },
  calorieContainer: {
    marginVertical: spacing.m,
    alignItems: 'center',
    padding: spacing.m,
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: 8,
  },
  calorieValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onPrimaryContainer,
  },
  button: {
    marginTop: spacing.m,
  },
  cancelButton: {
    marginTop: spacing.s,
  },
  activityTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  activityTypeButton: {
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: 8,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  activityTypeButtonSelected: {
    backgroundColor: theme.colors.primary,
  },
  activityTypeButtonText: {
    fontSize: typography.fontSize.medium,
    color: theme.colors.onBackground,
  },
  activityTypeButtonTextSelected: {
    fontWeight: 'bold',
    color: theme.colors.onPrimary,
  },
  calorieInput: {
    marginTop: spacing.xs,
    alignSelf: 'stretch',
  },
});

export default ActivityEntryScreen; 