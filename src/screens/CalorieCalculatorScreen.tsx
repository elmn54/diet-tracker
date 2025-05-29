import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Input from '../components/Input';
import Button from '../components/Button';
import { useUIStore } from '../store/uiStore';
import { spacing, typography } from '../constants/theme';

// Activity level multipliers for calorie calculations - revised values
const ACTIVITY_LEVELS = [
  { label: 'Sedentary (No exercise)', value: 'sedentary', multiplier: 1.2 },
  { label: 'Lightly Active (1-3 days of exercise per week)', value: 'light', multiplier: 1.375 },
  { label: 'Moderately Active (3-5 days of exercise per week)', value: 'moderate', multiplier: 1.55 },
  { label: 'Very Active (6-7 days of exercise per week)', value: 'active', multiplier: 1.725 },
  { label: 'Extremely Active (Physical job or 2x exercise per day)', value: 'veryActive', multiplier: 1.9 },
];

// Goal-based adjustment factors - revised values
const GOAL_FACTORS = {
  weightLoss: 0.85,    // %15 kalori açığı (daha gerçekçi)
  maintenance: 1.0,    // Calories dengesi
  weightGain: 1.1,     // %10 kalori fazlası (daha gerçekçi)
};

interface Props {
  route: {
    params?: {
      onCalculate?: (calories: number) => void;
    }
  }
}

const CalorieCalculatorScreen = ({ route }: Props) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { showToast } = useUIStore();

  // Form state
  const [formState, setFormState] = useState({
    gender: 'male',  // Varsayılan değer: erkek
    age: '',
    weight: '',
    height: '',
    activityLevel: 'moderate',  // Varsayılan değer: orta aktivite
    goal: 'maintenance',  // Varsayılan değer: kilo koruma
  });

  // Validation errors
  const [errors, setErrors] = useState({
    age: '',
    weight: '',
    height: '',
  });

  // Gender selection handler
  const handleGenderSelect = (gender: 'male' | 'female') => {
    setFormState(prev => ({ ...prev, gender }));
  };

  // Activity level selection handler
  const handleActivitySelect = (activityLevel: string) => {
    setFormState(prev => ({ ...prev, activityLevel }));
  };

  // Goal selection handler
  const handleGoalSelect = (goal: string) => {
    setFormState(prev => ({ ...prev, goal }));
  };

  // Input change handler
  const handleInputChange = (field: keyof typeof formState, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error if exists
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors = { ...errors };
    let isValid = true;

    // Age validation
    if (!formState.age) {
      newErrors.age = 'Yaş gereklidir';
      isValid = false;
    } else if (isNaN(Number(formState.age)) || Number(formState.age) <= 0 || Number(formState.age) > 120) {
      newErrors.age = 'Geçerli bir yaş değeri giriniz (1-120)';
      isValid = false;
    }

    // Weight validation
    if (!formState.weight) {
      newErrors.weight = 'Kilo gereklidir';
      isValid = false;
    } else if (isNaN(Number(formState.weight)) || Number(formState.weight) <= 0) {
      newErrors.weight = 'Geçerli bir kilo değeri giriniz';
      isValid = false;
    }

    // Height validation
    if (!formState.height) {
      newErrors.height = 'Boy gereklidir';
      isValid = false;
    } else if (isNaN(Number(formState.height)) || Number(formState.height) <= 0) {
      newErrors.height = 'Geçerli bir boy değeri giriniz';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Calculate calorie needs using the revised Mifflin-St Jeor formula (more accurate than Harris-Benedict)
  const calculateCalories = () => {
    if (!validateForm()) return;

    const age = Number(formState.age);
    const weight = Number(formState.weight); // kg
    const height = Number(formState.height); // cm
    
    // Mifflin-St Jeor formülü (daha doğru sonuçlar için)
    let bmr = 0;
    
    if (formState.gender === 'male') {
      // Erkek formülü: (10 × ağırlık) + (6.25 × boy) - (5 × yaş) + 5
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      // Kadın formülü: (10 × ağırlık) + (6.25 × boy) - (5 × yaş) - 161
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
    
    // Aktivite seviyesine göre TDEE (Toplam Günlük Enerji Tüketimi) hesapla
    const activityLevel = ACTIVITY_LEVELS.find(level => level.value === formState.activityLevel);
    const tdee = bmr * (activityLevel?.multiplier || 1.55);
    
    // Hedefe göre kalori ayarlaması
    const goalFactor = GOAL_FACTORS[formState.goal as keyof typeof GOAL_FACTORS];
    const adjustedCalories = Math.round(tdee * goalFactor);
    
    // Debug
    console.log({
      inputValues: { ...formState, age, weight, height },
      bmr,
      activityMultiplier: activityLevel?.multiplier,
      tdee,
      goalFactor,
      adjustedCalories
    });

    // Sonucu ana ekrana gönder ve geri dön
    if (route.params?.onCalculate) {
      route.params.onCalculate(adjustedCalories);
      showToast(`${adjustedCalories} kalori olarak hesaplandı`, 'info');
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['left', 'right', 'bottom']}
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
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.primary }]}>
              Calorie Needs Calculator
            </Text>
            
            <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
              Enter your information to calculate your daily calorie needs
            </Text>
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>Gender</Text>
            <View style={styles.optionsContainer}>
              <Button
                title="Male"
                variant={formState.gender === 'male' ? 'primary' : 'outline'}
                onPress={() => handleGenderSelect('male')}
                style={styles.optionButton}
              />
              <Button
                title="Female"
                variant={formState.gender === 'female' ? 'primary' : 'outline'}
                onPress={() => handleGenderSelect('female')}
                style={styles.optionButton}
              />
            </View>
          </View>
          
          <View style={styles.row}>
            <View style={styles.column}>
              <Input
                label="Age"
                value={formState.age}
                onChangeText={value => handleInputChange('age', value)}
                keyboardType="numeric"
                error={errors.age}
                style={styles.inputContainer}
              />
            </View>
            
            <View style={styles.column}>
              <Input
                label="Weight (kg)"
                value={formState.weight}
                onChangeText={value => handleInputChange('weight', value)}
                keyboardType="numeric"
                error={errors.weight}
                style={styles.inputContainer}
              />
            </View>
          </View>
          
          <Input
            label="Height (cm)"
            value={formState.height}
            onChangeText={value => handleInputChange('height', value)}
            keyboardType="numeric"
            error={errors.height}
            style={styles.inputContainer}
          />
          
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>Activity Level</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activityOptions}
            >
              {ACTIVITY_LEVELS.map(level => (
                <Button
                  key={level.value}
                  title={level.label.split(' ')[0]}
                  variant={formState.activityLevel === level.value ? 'primary' : 'outline'}
                  onPress={() => handleActivitySelect(level.value)}
                  style={styles.activityButton}
                />
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>Goal</Text>
            <View style={styles.optionsContainer}>
              <Button
                title="Weight Loss"
                variant={formState.goal === 'weightLoss' ? 'primary' : 'outline'}
                onPress={() => handleGoalSelect('weightLoss')}
                style={styles.optionButton}
              />
              <Button
                title="Maintenance"
                variant={formState.goal === 'maintenance' ? 'primary' : 'outline'}
                onPress={() => handleGoalSelect('maintenance')}
                style={styles.optionButton}
              />
              <Button
                title="Weight Gain"
                variant={formState.goal === 'weightGain' ? 'primary' : 'outline'}
                onPress={() => handleGoalSelect('weightGain')}
                style={styles.optionButton}
              />
            </View>
          </View>
          
          <View style={styles.buttonContainer}>
            <Button
              title="Calculate calorie needs"
              onPress={calculateCalories}
              variant="primary"
              fullWidth
            />
          </View>

          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="outline"
            fullWidth
            style={styles.cancelButton}
          />
          
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
    paddingTop: spacing.m,
  },
  header: {
    marginBottom: spacing.l,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.fontSize.medium,
    marginBottom: spacing.m,
  },
  formSection: {
    marginBottom: spacing.m,
  },
  sectionLabel: {
    fontSize: typography.fontSize.medium,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.s,
  },
  optionButton: {
    marginRight: spacing.s,
    marginBottom: spacing.s,
    minWidth: 80,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
    marginRight: spacing.s,
  },
  inputContainer: {
    marginBottom: spacing.m,
  },
  activityOptions: {
    paddingRight: spacing.m,
  },
  activityButton: {
    marginRight: spacing.s,
    marginVertical: spacing.s,
  },
  buttonContainer: {
    marginVertical: spacing.l,
  },
  cancelButton: {
    marginBottom: spacing.l,
  },
  extraSpace: {
    height: 60,
  },
});

export default CalorieCalculatorScreen; 