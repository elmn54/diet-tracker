import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, useTheme, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../components/Input';
import Button from '../components/Button';
import { useCalorieGoalStore } from '../store/calorieGoalStore';
import { useUIStore } from '../store/uiStore';
import { spacing, typography } from '../constants/theme';

// Besin değerleri için kalori sabitleri
const PROTEIN_CALORIES_PER_GRAM = 4;
const CARBS_CALORIES_PER_GRAM = 4;
const FAT_CALORIES_PER_GRAM = 9;

// Varsayılan makro besin dağılımı oranları
const DEFAULT_PROTEIN_RATIO = 0.30; // %30
const DEFAULT_FAT_RATIO = 0.25;     // %25
const DEFAULT_CARBS_RATIO = 0.45;   // %45

const CalorieGoalScreen = () => {
  const theme = useTheme();
  const { calorieGoal, nutrientGoals, setCalorieGoal, setNutrientGoals, loadGoals } = useCalorieGoalStore();
  const { showToast } = useUIStore();
  
  // Form state
  const [formState, setFormState] = useState({
    calories: calorieGoal.toString(),
    protein: nutrientGoals.protein.toString(),
    carbs: nutrientGoals.carbs.toString(),
    fat: nutrientGoals.fat.toString(),
  });
  
  // Validation errors
  const [errors, setErrors] = useState({
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  // Load stored goals when component mounts
  useEffect(() => {
    const initializeGoals = async () => {
      await loadGoals();
      setFormState({
        calories: calorieGoal.toString(),
        protein: nutrientGoals.protein.toString(),
        carbs: nutrientGoals.carbs.toString(),
        fat: nutrientGoals.fat.toString(),
      });
    };
    
    initializeGoals();
  }, []);  // Only run this effect once on mount
  
  // Update form state when store values change
  useEffect(() => {
    setFormState(prev => ({
      ...prev,
      calories: calorieGoal.toString(),
      protein: nutrientGoals.protein.toString(),
      carbs: nutrientGoals.carbs.toString(),
      fat: nutrientGoals.fat.toString(),
    }));
  }, [calorieGoal, nutrientGoals]);
  
  // Kaloriye göre makro besinleri hesapla
  const calculateMacros = (calories: number) => {
    // Toplam kalori miktarından protein, karbonhidrat ve yağ gramajlarını hesapla
    const proteinCalories = calories * DEFAULT_PROTEIN_RATIO;
    const carbsCalories = calories * DEFAULT_CARBS_RATIO;
    const fatCalories = calories * DEFAULT_FAT_RATIO;
    
    // Kaloriden gram cinsine çevir
    const proteinGrams = Math.round(proteinCalories / PROTEIN_CALORIES_PER_GRAM);
    const carbsGrams = Math.round(carbsCalories / CARBS_CALORIES_PER_GRAM);
    const fatGrams = Math.round(fatCalories / FAT_CALORIES_PER_GRAM);
    
    return {
      protein: proteinGrams,
      carbs: carbsGrams,
      fat: fatGrams
    };
  };
  
  // Makro besinlerden kalori hesapla
  const calculateCaloriesFromMacros = (protein: number, carbs: number, fat: number) => {
    return (protein * PROTEIN_CALORIES_PER_GRAM) + 
           (carbs * CARBS_CALORIES_PER_GRAM) + 
           (fat * FAT_CALORIES_PER_GRAM);
  };
  
  // Input değişikliklerini işle
  const handleInputChange = (field: keyof typeof formState, value: string) => {
    // Değeri state'e kaydet
    setFormState(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Eğer kalori değiştiriliyorsa, makro besinleri otomatik olarak güncelle
    if (field === 'calories') {
      const calorieValue = Number(value);
      if (!isNaN(calorieValue) && calorieValue > 0) {
        const newMacros = calculateMacros(calorieValue);
        setFormState(prev => ({
          ...prev,
          protein: newMacros.protein.toString(),
          carbs: newMacros.carbs.toString(),
          fat: newMacros.fat.toString(),
        }));
      }
    } 
    // Eğer protein, karbonhidrat veya yağ değiştiriliyorsa, kaloriyi otomatik olarak güncelle
    else if (field === 'protein' || field === 'carbs' || field === 'fat') {
      const proteinValue = field === 'protein' ? Number(value) : Number(formState.protein);
      const carbsValue = field === 'carbs' ? Number(value) : Number(formState.carbs);
      const fatValue = field === 'fat' ? Number(value) : Number(formState.fat);
      
      // Geçerli değerler ise kaloriyi güncelle
      if (!isNaN(proteinValue) && !isNaN(carbsValue) && !isNaN(fatValue) &&
          proteinValue >= 0 && carbsValue >= 0 && fatValue >= 0) {
        const calculatedCalories = calculateCaloriesFromMacros(proteinValue, carbsValue, fatValue);
        setFormState(prev => ({
          ...prev,
          calories: Math.round(calculatedCalories).toString()
        }));
      }
    }
    
    // Hata mesajını temizle
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };
  
  // Form doğrulama
  const validateForm = (): boolean => {
    const newErrors = { ...errors };
    let isValid = true;
    
    // Kalori doğrulama
    if (!formState.calories) {
      newErrors.calories = 'Kalori hedefi gereklidir';
      isValid = false;
    } else if (isNaN(Number(formState.calories)) || Number(formState.calories) <= 0) {
      newErrors.calories = 'Geçerli bir kalori değeri giriniz';
      isValid = false;
    }
    
    // Protein doğrulama
    if (!formState.protein) {
      newErrors.protein = 'Protein hedefi gereklidir';
      isValid = false;
    } else if (isNaN(Number(formState.protein)) || Number(formState.protein) < 0) {
      newErrors.protein = 'Geçerli bir protein değeri giriniz';
      isValid = false;
    }
    
    // Karbonhidrat doğrulama
    if (!formState.carbs) {
      newErrors.carbs = 'Karbonhidrat hedefi gereklidir';
      isValid = false;
    } else if (isNaN(Number(formState.carbs)) || Number(formState.carbs) < 0) {
      newErrors.carbs = 'Geçerli bir karbonhidrat değeri giriniz';
      isValid = false;
    }
    
    // Yağ doğrulama
    if (!formState.fat) {
      newErrors.fat = 'Yağ hedefi gereklidir';
      isValid = false;
    } else if (isNaN(Number(formState.fat)) || Number(formState.fat) < 0) {
      newErrors.fat = 'Geçerli bir yağ değeri giriniz';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Hedefleri kaydet
  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const calorieValue = Number(formState.calories);
      console.log('Input calorie value:', formState.calories);
      console.log('Parsed calorie value:', calorieValue);
      
      // Kalori hedefini güncelle
      await setCalorieGoal(calorieValue);
      
      // Makro besin hedeflerini güncelle
      await setNutrientGoals({
        protein: Number(formState.protein),
        carbs: Number(formState.carbs),
        fat: Number(formState.fat),
      });
      
      // Değerler başarıyla kaydedildikten sonra, yeni değerleri yükle
      await loadGoals();
      
      console.log('Calorie goal after reload:', calorieGoal);
      console.log('Updated nutrient goals:', nutrientGoals);
      
      // Başarı animasyonunu göster
      setShowSuccessAnimation(true);
      
      // Başarılı mesajını göster
      showToast('Hedefleriniz başarıyla kaydedildi', 'success');
      
      // Animasyon bittikten sonra success durumunu resetle
      setTimeout(() => {
        setShowSuccessAnimation(false);
      }, 2000);
      
    } catch (error) {
      console.error('Hedefler kaydedilirken hata oluştu:', error);
      showToast('Hedefler kaydedilirken bir hata oluştu', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['left', 'right', 'bottom']}  // Exclude 'top' to prevent extra padding
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Günlük Kalori Hedefi
            </Text>
            <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
              Günlük hedeflediğiniz kalori miktarını belirleyin
            </Text>
            
            <Input
              label="Kalori Hedefi"
              value={formState.calories}
              onChangeText={value => handleInputChange('calories', value)}
              keyboardType="numeric"
              error={errors.calories}
              style={styles.inputContainer}
              accessibilityHint="Günlük kalori hedefini girin"
              testID="calorie-input"
            />
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Makro Besin Hedefleri
            </Text>
            <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
              Dengeli beslenme için günlük makro besin hedeflerinizi ayarlayın
            </Text>
            
            <Input
              label="Protein (g)"
              value={formState.protein}
              onChangeText={value => handleInputChange('protein', value)}
              keyboardType="numeric"
              error={errors.protein}
              style={styles.inputContainer}
              testID="protein-input"
            />
            
            <Input
              label="Karbonhidrat (g)"
              value={formState.carbs}
              onChangeText={value => handleInputChange('carbs', value)}
              keyboardType="numeric"
              error={errors.carbs}
              style={styles.inputContainer}
              testID="carbs-input"
            />
            
            <Input
              label="Yağ (g)"
              value={formState.fat}
              onChangeText={value => handleInputChange('fat', value)}
              keyboardType="numeric"
              error={errors.fat}
              style={styles.inputContainer}
              testID="fat-input"
            />
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Mevcut Hedefleriniz
            </Text>
            
            <View style={styles.goalDisplay}>
              <Text style={styles.goalTitle}>Günlük Kalori:</Text>
              <Text testID="calorie-goal" style={styles.goalValue}>{calorieGoal}</Text>
            </View>
            
            <View style={styles.goalDisplay}>
              <Text style={styles.goalTitle}>Protein:</Text>
              <Text testID="protein-goal" style={styles.goalValue}>{nutrientGoals.protein}g</Text>
            </View>
            
            <View style={styles.goalDisplay}>
              <Text style={styles.goalTitle}>Karbonhidrat:</Text>
              <Text testID="carbs-goal" style={styles.goalValue}>{nutrientGoals.carbs}g</Text>
            </View>
            
            <View style={styles.goalDisplay}>
              <Text style={styles.goalTitle}>Yağ:</Text>
              <Text testID="fat-goal" style={styles.goalValue}>{nutrientGoals.fat}g</Text>
            </View>
          </View>
          
          <View style={styles.buttonContainer}>
            <Button
              title="Kaydet"
              onPress={handleSave}
              loading={isLoading}
              fullWidth
              variant="primary"
              showSuccessAnimation={showSuccessAnimation}
            />
          </View>
          
          {/* Ekstra boşluk ekleyerek, kaydırma sırasında butonun ekranın dışına çıkıp gizlenmesini önle */}
          <View style={styles.extraSpace} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.xl,
    paddingTop: 0,
  },
  section: {
    marginBottom: spacing.l,
  },
  sectionTitle: {
    fontSize: typography.fontSize.large,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.fontSize.small,
    marginBottom: spacing.m,
  },
  inputContainer: {
    marginBottom: spacing.s,
  },
  divider: {
    marginVertical: spacing.m,
  },
  buttonContainer: {
    marginTop: spacing.m,
    marginBottom: spacing.l,
  },
  goalDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  goalTitle: {
    fontSize: typography.fontSize.medium,
    fontWeight: '500',
  },
  goalValue: {
    fontSize: typography.fontSize.medium,
  },
  extraSpace: {
    height: 60, // Ekran alt kısmında ek bir boşluk bırak, böylece kaydırma sırasında buton görünür kalır
  },
});

export default CalorieGoalScreen; 