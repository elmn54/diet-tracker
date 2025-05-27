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
import { useAdManager } from '../hooks/useAdManager';

// Aktivite formu validasyon şeması
const activitySchema = z.object({
  name: z.string().min(1, { message: 'Activity name is required' }),
  duration: z.string().min(1, { message: 'Duration value is required' })
    .refine((val) => !isNaN(Number(val)), { message: 'Enter a valid number' })
    .refine((val) => Number(val) > 0, { message: 'Duration must be greater than 0' }),
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
  
  // Reklam yöneticisini kullan
  const { trackUserEntry, showAdManually, remainingEntries, isAdFree, isLoading: isAdLoading } = useAdManager();
  
  // Route parametrelerinden editMode ve activityItem al
  const editMode = route.params?.editMode || false;
  const existingActivity = route.params?.activityItem;
  const selectedDate = route.params?.selectedDate 
    ? new Date(route.params.selectedDate) 
    : new Date();
  
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
    // Duration, aktivite türü veya yoğunluk değiştiğinde kalori hesapla
    if (durationValue && !isNaN(Number(durationValue)) && activityType !== 'other') {
      const duration = Number(durationValue);
      const calculatedCalories = calculateCaloriesBurned(activityType, intensity, duration);
      setCaloriesBurned(calculatedCalories);
    }
  }, [durationValue, activityType, intensity]);
  
  // Calories değeri manuel girişi
  const handleCaloriesChange = (value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      setCaloriesBurned(numValue);
    }
  };
  
  // Kalan giriş sayısını kullanıcıya göster
  useEffect(() => {
    if (!isAdFree && remainingEntries <= 1) {
      // Kullanıcıya kalan giriş hakkını bildir
      Alert.alert(
        'Bilgilendirme',
        remainingEntries === 0 
          ? 'Ücretsiz kullanım hakkınız bitti. Uygulamayı kullanmaya devam etmek için bir reklam izlemeniz gerekecek.'
          : `Ücretsiz hesabınızda ${remainingEntries} giriş hakkınız kaldı. Sonraki kullanımınızda reklam gösterilecek.`,
        [{ text: 'Anladım' }]
      );
    }
  }, [remainingEntries, isAdFree]);
  
  // Aktivite ekleme/güncelleme fonksiyonu
  const onSubmit = useCallback(async (data: ActivityFormData) => {
    try {
      setIsLoading(true);
      
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
          setIsLoading(false);
          return;
        }
      }
      
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
      } else {
        // Yeni aktivite ekle
        await addActivity(activityData);
        // Ücretsiz kullanıcı için giriş sayacını artır
        await trackUserEntry();
      }
      
      // Ana ekrana geri dön
      navigation.goBack();
    } catch (error) {
      console.error('Error saving activity:', error);
      Alert.alert('Error', 'Error saving activity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [editMode, existingActivity, navigation, addActivity, updateActivity, selectedDate, activityType, intensity, caloriesBurned, isAdFree, remainingEntries, showAdManually, trackUserEntry]);
  
  // Aktivite türü seçenekleri
  const activityTypeOptions = [
    { value: 'walking', label: '🚶 Walking' },
    { value: 'running', label: '🏃 Running' },
    { value: 'cycling', label: '🚲 Cycling' },
    { value: 'swimming', label: '🏊 Swimming' },
    { value: 'workout', label: '💪 Workout' },
    { value: 'other', label: '⚡ Other' }
  ];
  
  // Intensity seçenekleri
  const intensityOptions = [
    { value: ActivityIntensity.Low, label: 'Low' },
    { value: ActivityIntensity.Medium, label: 'Medium' },
    { value: ActivityIntensity.High, label: 'High' }
  ];
  
  return (
    <ScrollView style={styles.container}>  
      <View style={styles.formContainer}>
        {/* Aktivite adı */}
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Activity Name"
              placeholder="Example: Running"
              onChangeText={onChange}
              value={value}
              error={errors.name?.message}
            />
          )}
        />
        
        {/* Duration (dakika) */}
        <Controller
          control={control}
          name="duration"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Duration (minutes)"
              placeholder="Example: 30"
              onChangeText={onChange}
              value={value}
              error={errors.duration?.message}
              keyboardType="numeric"
            />
          )}
        />
        
        {/* Aktivite Türü */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Activity Type</Text>
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
            <Text style={styles.sectionTitle}>Intensity</Text>
            <SegmentedButtons
              value={intensity}
              onValueChange={(value) => setIntensity(value as ActivityIntensity)}
              buttons={intensityOptions}
            />
          </View>
        )}
        
        {/* Tahmini yakılan kalori */}
        <View style={styles.calorieContainer}>
          <Text style={styles.sectionTitle}>Burned Calories</Text>
          {activityType === 'other' ? (
            <Input
              label="Burned Calories (kcal)"
              placeholder="Example: 150"
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
          title={editMode ? 'Update' : 'Save'}
        />
        
        {/* İptal etme butonu */}
        <Button
          style={styles.cancelButton}
          mode="outlined"
          onPress={() => navigation.goBack()}
          disabled={isLoading}
          title="Cancel"
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