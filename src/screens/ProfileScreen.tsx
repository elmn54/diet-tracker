import React, { useState } from 'react';
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
import { colors, spacing, typography, metrics } from '../constants/theme';

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
  
  // Tema ayarları
  const { isDarkMode, isSystemTheme, toggleDarkMode, setUseSystemTheme } = useThemeStore();
  
  const { control, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      dailyCalorieGoal: '2000',
      proteinGoal: '100',
      carbsGoal: '250',
      fatGoal: '70',
    },
  });

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

  const onSubmit = (data: ProfileFormData) => {
    // Normalde burada verileri saklama işlemi yapılır
    console.log('Profil verileri:', data);
    
    Alert.alert(
      'Başarılı',
      'Profil bilgileriniz güncellendi',
      [{ text: 'Tamam' }]
    );
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
    
    Alert.alert(
      'Başarılı',
      'API anahtarı kaydedildi',
      [{ text: 'Tamam' }]
    );
  };

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    setShowApiKeyInput(true);
  };

  const handleLogout = () => {
    // Çıkış işlemi burada yapılacak
    Alert.alert(
      'Çıkış',
      'Çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
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
  }
});

export default ProfileScreen; 