import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Switch, Divider, List, IconButton } from 'react-native-paper';
import Button from '../components/Button';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../components/Input';
import { useThemeStore } from '../store/themeStore';
import { useCalorieGoalStore } from '../store/calorieGoalStore';
import { colors, spacing, typography, metrics } from '../constants/theme';
import { useUIStore } from '../store/uiStore';

// Besin değerleri için kalori sabitleri
const PROTEIN_CALORIES_PER_GRAM = 4;
const CARBS_CALORIES_PER_GRAM = 4;
const FAT_CALORIES_PER_GRAM = 9;

// Varsayılan makro besin dağılımı oranları
const DEFAULT_PROTEIN_RATIO = 0.30; // %30
const DEFAULT_FAT_RATIO = 0.25;     // %25
const DEFAULT_CARBS_RATIO = 0.45;   // %45

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

// Kişisel bilgiler validasyon şeması
const profileSchema = z.object({
  dailyCalorieGoal: z.string()
    .min(1, { message: 'Kalori hedefi gereklidir' })
    .refine((val) => !isNaN(Number(val)), { message: 'Geçerli bir sayı girin' }),
  proteinGoal: z.string()
    .min(1, { message: 'Protein hedefi gereklidir' })
    .refine((val) => !isNaN(Number(val)), { message: 'Geçerli bir sayı girin' }),
  carbsGoal: z.string()
    .min(1, { message: 'Karbonhidrat hedefi gereklidir' })
    .refine((val) => !isNaN(Number(val)), { message: 'Geçerli bir sayı girin' }),
  fatGoal: z.string()
    .min(1, { message: 'Yağ hedefi gereklidir' })
    .refine((val) => !isNaN(Number(val)), { message: 'Geçerli bir sayı girin' }),
});

// API anahtarı validasyon şeması
const apiKeySchema = z.object({
  apiKey: z.string().min(1, { message: 'API anahtarı gereklidir' }),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type ApiKeyFormData = z.infer<typeof apiKeySchema>;

// AI sağlayıcılar listesi
const AI_PROVIDERS = [
  { id: 'openai', name: 'OpenAI', icon: 'brain' },
  { id: 'gemini', name: 'Google Gemini', icon: 'google' },
  { id: 'claude', name: 'Claude', icon: 'robot' },
];

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [notifications, setNotifications] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(AI_PROVIDERS[0].id);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [showProfileSuccessAnimation, setShowProfileSuccessAnimation] = useState(false);
  const [showApiKeySuccessAnimation, setShowApiKeySuccessAnimation] = useState(false);
  
  // Tema ayarları
  const { isDarkMode, isSystemTheme, toggleDarkMode, setUseSystemTheme } = useThemeStore();
  
  // UI State
  const { showToast, showAlert } = useUIStore();
  
  // Kalori hedefi ayarları
  const { calorieGoal, nutrientGoals, setCalorieGoal, setNutrientGoals } = useCalorieGoalStore();
  
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
  
  const { control, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      dailyCalorieGoal: calorieGoal.toString(),
      proteinGoal: nutrientGoals.protein.toString(),
      carbsGoal: nutrientGoals.carbs.toString(),
      fatGoal: nutrientGoals.fat.toString(),
    },
  });
  
  // Tüm form değerlerini izle
  const formValues = watch();
  
  // Kalori değeri değiştiğinde makro besinleri otomatik hesapla
  useEffect(() => {
    const dailyCalorieGoal = formValues.dailyCalorieGoal;
    const previousCalorieGoal = calorieGoal.toString();
    
    // Değer değişti ve geçerli bir sayı ise işlem yap
    if (dailyCalorieGoal !== previousCalorieGoal) {
      const calorieValue = Number(dailyCalorieGoal);
      if (!isNaN(calorieValue) && calorieValue > 0) {
        const newMacros = calculateMacros(calorieValue);
        setValue('proteinGoal', newMacros.protein.toString(), { shouldValidate: true });
        setValue('carbsGoal', newMacros.carbs.toString(), { shouldValidate: true });
        setValue('fatGoal', newMacros.fat.toString(), { shouldValidate: true });
      }
    }
  }, [formValues.dailyCalorieGoal, setValue, calorieGoal]);
  
  // Makro besin değerleri değiştiğinde kaloriyi otomatik hesapla
  useEffect(() => {
    // Kalori değeri manuel olarak değiştirildiğinde tetiklenmesini önle
    if (!formValues.proteinGoal || !formValues.carbsGoal || !formValues.fatGoal) return;
    
    const proteinValue = Number(formValues.proteinGoal);
    const carbsValue = Number(formValues.carbsGoal);
    const fatValue = Number(formValues.fatGoal);
    
    // Geçerli değerler ise kaloriyi güncelle
    if (!isNaN(proteinValue) && !isNaN(carbsValue) && !isNaN(fatValue) &&
        proteinValue >= 0 && carbsValue >= 0 && fatValue >= 0) {
      const calculatedCalories = calculateCaloriesFromMacros(proteinValue, carbsValue, fatValue);
      
      // Yeni hesaplanan kalori değeri farklıysa güncelle
      if (Math.round(calculatedCalories).toString() !== formValues.dailyCalorieGoal) {
        setValue('dailyCalorieGoal', Math.round(calculatedCalories).toString(), { shouldValidate: true });
      }
    }
  }, [formValues.proteinGoal, formValues.carbsGoal, formValues.fatGoal, setValue, formValues.dailyCalorieGoal]);
  
  // Mevcut kalori hedeflerini form değerlerine yükle
  useEffect(() => {
    reset({
      dailyCalorieGoal: calorieGoal.toString(),
      proteinGoal: nutrientGoals.protein.toString(),
      carbsGoal: nutrientGoals.carbs.toString(),
      fatGoal: nutrientGoals.fat.toString(),
    });
  }, [calorieGoal, nutrientGoals, reset]);

  const { 
    control: apiKeyControl, 
    handleSubmit: handleApiKeySubmit, 
    formState: { errors: apiKeyErrors },
    reset: resetApiKeyForm
  } = useForm<ApiKeyFormData>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      apiKey: '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const calorieValue = Number(data.dailyCalorieGoal);
      console.log('Setting calorie goal:', data.dailyCalorieGoal, '→', calorieValue);
      
      // Check for valid number
      if (isNaN(calorieValue) || calorieValue <= 0) {
        showAlert(
          'Hata',
          'Geçerli bir kalori hedefi girmelisiniz',
          'error',
          [{ text: 'Tamam', onPress: () => {}, style: 'default' }]
        );
        return;
      }
      
      // Kalori hedefini güncelle
      await setCalorieGoal(calorieValue);
      
      // Makro besin hedeflerini güncelle
      const proteinValue = Number(data.proteinGoal);
      const carbsValue = Number(data.carbsGoal);
      const fatValue = Number(data.fatGoal);
      
      console.log('Setting nutrient goals:', {
        protein: proteinValue,
        carbs: carbsValue,
        fat: fatValue
      });
      
      if (
        isNaN(proteinValue) || proteinValue < 0 ||
        isNaN(carbsValue) || carbsValue < 0 ||
        isNaN(fatValue) || fatValue < 0
      ) {
        showAlert(
          'Hata',
          'Geçerli besin değerleri hedefleri girmelisiniz',
          'error',
          [{ text: 'Tamam', onPress: () => {}, style: 'default' }]
        );
        return;
      }
      
      await setNutrientGoals({
        protein: proteinValue,
        carbs: carbsValue,
        fat: fatValue,
      });
      
      // Store'dan yeni değerleri alalım
      console.log('Updated goals in store:', {
        calorieGoal,
        nutrientGoals
      });
      
      // Başarı animasyonunu göster
      setShowProfileSuccessAnimation(true);
      
      // Başarılı mesajını göster
      showToast('Profil bilgileriniz başarıyla güncellendi', 'success');
      
      // Animasyon bittikten sonra success durumunu resetle
      setTimeout(() => {
        setShowProfileSuccessAnimation(false);
      }, 2000);
      
    } catch (error) {
      console.error('Hedefler kaydedilirken hata oluştu:', error);
      showAlert(
        'Hata',
        'Profil bilgileriniz güncellenirken bir hata oluştu',
        'error',
        [{ text: 'Tamam', onPress: () => {}, style: 'default' }]
      );
    }
  };

  const onApiKeySubmit = (data: ApiKeyFormData) => {
    // API anahtarını seçilen sağlayıcı için saklama
    const updatedApiKeys = {
      ...apiKeys,
      [selectedProvider]: data.apiKey
    };
    
    setApiKeys(updatedApiKeys);
    setShowApiKeyInput(false);
    resetApiKeyForm();
    
    // Başarı animasyonunu göster
    setShowApiKeySuccessAnimation(true);
    
    // Başarılı mesajını göster
    showToast('API anahtarı başarıyla kaydedildi', 'success');
    
    // Animasyon bittikten sonra success durumunu resetle
    setTimeout(() => {
      setShowApiKeySuccessAnimation(false);
    }, 2000);
  };

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    setShowApiKeyInput(true);
  };

  const handleLogout = () => {
    // Çıkış işlemi burada yapılacak
    showAlert(
      'Çıkış',
      'Çıkış yapmak istediğinize emin misiniz?',
      'warning',
      [
        { text: 'İptal', onPress: () => {}, style: 'cancel' },
        { 
          text: 'Çıkış Yap', 
          onPress: () => {
            // Çıkış işlemleri (token silme vb.)
            navigation.navigate('Login');
          },
          style: 'destructive' 
        }
      ]
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={true}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Profil</Text>
      </View>
      
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Hedefleriniz</Text>
          
          <Controller
            control={control}
            name="dailyCalorieGoal"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Günlük Kalori Hedefi (kcal)"
                placeholder="2000"
                value={value}
                onChangeText={onChange}
                error={errors.dailyCalorieGoal?.message}
                keyboardType="numeric"
              />
            )}
          />
          
          <Controller
            control={control}
            name="proteinGoal"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Protein Hedefi (g)"
                placeholder="100"
                value={value}
                onChangeText={onChange}
                error={errors.proteinGoal?.message}
                keyboardType="numeric"
              />
            )}
          />
          
          <Controller
            control={control}
            name="carbsGoal"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Karbonhidrat Hedefi (g)"
                placeholder="250"
                value={value}
                onChangeText={onChange}
                error={errors.carbsGoal?.message}
                keyboardType="numeric"
              />
            )}
          />
          
          <Controller
            control={control}
            name="fatGoal"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Yağ Hedefi (g)"
                placeholder="70"
                value={value}
                onChangeText={onChange}
                error={errors.fatGoal?.message}
                keyboardType="numeric"
              />
            )}
          />
          
          <Button
            title="Kaydet"
            onPress={handleSubmit(onSubmit)}
            style={styles.saveButton}
            variant="primary"
            showSuccessAnimation={showProfileSuccessAnimation}
          />
        </Card.Content>
      </Card>
      
      {/* AI API Ayarları Kartı */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>AI API Ayarları</Text>
          <Text style={styles.sectionDescription}>
            Fotoğraftan yemek tanıma için AI hizmeti seçin ve API anahtarınızı girin
          </Text>
          
          {AI_PROVIDERS.map((provider) => (
            <React.Fragment key={provider.id}>
              <List.Item
                title={provider.name}
                description={apiKeys[provider.id] ? "API anahtarı ayarlandı" : "API anahtarı girilmedi"}
                left={props => <List.Icon {...props} icon={provider.icon} />}
                right={props => (
                  <IconButton
                    {...props}
                    icon="key"
                    onPress={() => handleProviderSelect(provider.id)}
                  />
                )}
              />
              <Divider />
            </React.Fragment>
          ))}
          
          {showApiKeyInput && (
            <View style={styles.apiKeyInputContainer}>
              <Text style={styles.providerLabel}>
                {AI_PROVIDERS.find(p => p.id === selectedProvider)?.name} API Anahtarı
              </Text>
              
              <Controller
                control={apiKeyControl}
                name="apiKey"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="API Anahtarı"
                    placeholder="API anahtarınızı girin"
                    value={value}
                    onChangeText={onChange}
                    error={apiKeyErrors.apiKey?.message}
                    secureTextEntry
                  />
                )}
              />
              
              <Button
                title="API Anahtarını Kaydet"
                onPress={handleApiKeySubmit(onApiKeySubmit)}
                style={styles.saveButton}
                showSuccessAnimation={showApiKeySuccessAnimation}
              />
            </View>
          )}
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Uygulama Ayarları</Text>
          
          <List.Item
            title="Karanlık Mod"
            description={isSystemTheme ? "Sistem temasını kullan" : (isDarkMode ? "Açık" : "Kapalı")}
            left={props => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                color={colors.primary}
                disabled={isSystemTheme}
              />
            )}
          />
          
          <Divider style={styles.divider} />
          
          <List.Item
            title="Sistem Temasını Kullan"
            description="Cihazınızın tema ayarlarına göre otomatik değişir"
            left={props => <List.Icon {...props} icon="cellphone-cog" />}
            right={() => (
              <Switch
                value={isSystemTheme}
                onValueChange={setUseSystemTheme}
                color={colors.primary}
              />
            )}
          />
          
          <Divider style={styles.divider} />
          
          <List.Item
            title="Bildirimler"
            left={props => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                color={colors.primary}
              />
            )}
          />
          
          <Divider style={styles.divider} />
          
          <List.Item
            title="Uygulama Hakkında"
            left={props => <List.Icon {...props} icon="information" />}
            onPress={() => Alert.alert('Diyet Takip', 'Sürüm 1.0.0\n© 2023 Tüm Hakları Saklıdır')}
          />
          
          <Divider style={styles.divider} />
          
          <List.Item
            title="Gizlilik Politikası"
            left={props => <List.Icon {...props} icon="shield-account" />}
            onPress={() => {}}
          />
          
          <Divider style={styles.divider} />
          
          <List.Item
            title="Çıkış Yap"
            left={props => <List.Icon {...props} icon="logout" color={colors.error} />}
            onPress={handleLogout}
            titleStyle={{ color: colors.error }}
          />
        </Card.Content>
      </Card>
      
      {/* Ekstra boşluk ekleyerek, kaydırma sırasında butonların görünür olmasını sağla */}
      <View style={styles.extraSpace} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.m,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
  },
  card: {
    marginHorizontal: spacing.m,
    marginBottom: spacing.m,
    elevation: 2,
    backgroundColor: colors.surface,
    borderRadius: metrics.borderRadius.medium,
  },
  sectionTitle: {
    fontSize: typography.fontSize.large,
    fontWeight: 'bold',
    marginBottom: spacing.s,
    color: colors.text,
  },
  sectionDescription: {
    fontSize: typography.fontSize.medium,
    color: colors.textLight,
    marginBottom: spacing.m,
  },
  saveButton: {
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  apiKeyInputContainer: {
    marginTop: spacing.m,
    padding: spacing.m,
    backgroundColor: colors.surfaceVariant,
    borderRadius: metrics.borderRadius.small,
  },
  providerLabel: {
    fontSize: typography.fontSize.large,
    fontWeight: 'bold',
    marginBottom: spacing.s,
    color: colors.text,
  },
  divider: {
    backgroundColor: colors.divider,
  },
  extraSpace: {
    height: 60, // Ekran alt kısmında ek bir boşluk bırak
  },
});

export default ProfileScreen; 