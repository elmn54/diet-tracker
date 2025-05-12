import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput as RNTextInput, Linking, StatusBar } from 'react-native';
import { Text, useTheme, Card, IconButton, Divider, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { useApiKeyStore } from '../store/apiKeyStore';
import { AI_PROVIDERS, AI_PROVIDER_NAMES, AI_PROVIDER_ICONS } from '../constants/aiProviders';
import { spacing, typography } from '../constants/theme';
import { useUIStore } from '../store/uiStore';

const ApiSettingsScreen = () => {
  const theme = useTheme();
  const { apiKeys, preferredProvider, setApiKey, setPreferredProvider, loadApiKeys } = useApiKeyStore();
  const { showToast } = useUIStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentApiKey, setCurrentApiKey] = useState('');
  const [currentProvider, setCurrentProvider] = useState(preferredProvider);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  // API Keys store'unu yükle
  useEffect(() => {
    const loadKeys = async () => {
      await loadApiKeys();
      if (apiKeys[preferredProvider]) {
        setCurrentApiKey(apiKeys[preferredProvider] || '');
      } else {
        setCurrentApiKey('');
      }
      setCurrentProvider(preferredProvider);
    };
    
    loadKeys();
  }, [loadApiKeys, preferredProvider]);
  
  // Update API key value only when apiKeys object changes
  useEffect(() => {
    if (apiKeys[currentProvider]) {
      setCurrentApiKey(apiKeys[currentProvider]);
    }
  }, [apiKeys, currentProvider]);
  
  // API anahtarını güncelle
  const handleSaveApiKey = async () => {
    setIsLoading(true);
    try {
      // currentApiKey boş string olabileceği için null kontrolü yapmadan direkt olarak kullan
      await setApiKey(currentProvider, currentApiKey);
      
      // Başarı animasyonunu göster
      setShowSuccessAnimation(true);
      
      // Başarılı mesajını göster
      showToast('API anahtarı başarıyla kaydedildi', 'success');
      
      // Animasyon bittikten sonra success durumunu resetle
      setTimeout(() => {
        setShowSuccessAnimation(false);
      }, 1500);
    } catch (error) {
      console.error('API anahtarı kaydedilirken hata oluştu:', error);
      showToast('API anahtarı kaydedilirken bir hata oluştu', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // API key değişikliklerini yönet
  const handleApiKeyChange = useCallback((text: string) => {
    setCurrentApiKey(text);
  }, []);
  
  // API key'i temizle
  const handleClearApiKey = useCallback(() => {
    setCurrentApiKey('');
  }, []);
  
  // Sağlayıcı değiştir
  const handleProviderChange = async (provider: string) => {
    setCurrentProvider(provider);
    
    // Yeni sağlayıcı için varsa API anahtarını göster
    if (apiKeys[provider]) {
      setCurrentApiKey(apiKeys[provider]);
    } else {
      setCurrentApiKey('');
    }
    
    // Tercih edilen sağlayıcıyı güncelle
    try {
      await setPreferredProvider(provider);
    } catch (error) {
      console.error('Tercih edilen sağlayıcı güncellenirken hata oluştu:', error);
    }
  };
  
  // Link açma işlevi
  const handleOpenLink = useCallback((url: string) => {
    Linking.openURL(url);
  }, []);
  
  // API kullanımı için talimatları oluştur
  const renderInstructions = () => {
    switch (currentProvider) {
      case AI_PROVIDERS.OPENAI:
        return (
          <Text style={[styles.instructions, { color: theme.colors.onSurfaceVariant }]}>
            OpenAI API anahtarınızı oluşturmak için{' '}
            <Text 
              style={{ fontWeight: 'bold', color: theme.colors.primary }}
              onPress={() => handleOpenLink('https://platform.openai.com/api-keys')}
            >
              platform.openai.com/api-keys
            </Text>{' '}
            adresine gidin ve API Keys bölümünden yeni bir anahtar oluşturun.
          </Text>
        );
      case AI_PROVIDERS.GEMINI:
        return (
          <Text style={[styles.instructions, { color: theme.colors.onSurfaceVariant }]}>
            Gemini API anahtarınızı oluşturmak için{' '}
            <Text 
              style={{ fontWeight: 'bold', color: theme.colors.primary }}
              onPress={() => handleOpenLink('https://aistudio.google.com/apikey')}
            >
              aistudio.google.com/apikey
            </Text>{' '}
            adresine gidin ve API Key bölümünden yeni bir anahtar oluşturun.
          </Text>
        );
      case AI_PROVIDERS.CLAUDE:
        return (
          <Text style={[styles.instructions, { color: theme.colors.onSurfaceVariant }]}>
            Claude API anahtarınızı oluşturmak için{' '}
            <Text 
              style={{ fontWeight: 'bold', color: theme.colors.primary }}
              onPress={() => handleOpenLink('https://console.anthropic.com/keys')}
            >
              console.anthropic.com/keys
            </Text>{' '}
            adresine gidin ve API Keys bölümünden yeni bir anahtar oluşturun.
          </Text>
        );
      default:
        return null;
    }
  };
  
  return (
    <>
      <StatusBar backgroundColor={theme.dark ? '#121822' : '#F7F9FC'} barStyle={theme.dark ? 'light-content' : 'dark-content'} />
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={[styles.screenTitle, { color: theme.colors.primary }]}>
              API Ayarları
            </Text>
            <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
              Yemek tanıma için kullanmak istediğiniz AI sağlayıcısını seçin
            </Text>
            
            <View style={styles.providerCardContainer}>
              {Object.values(AI_PROVIDERS).map((provider) => (
                <TouchableOpacity 
                  key={provider}
                  testID={`provider-${provider}`}
                  onPress={() => handleProviderChange(provider)}
                  style={styles.providerCardWrapper}
                >
                  <Card
                    style={[
                      styles.providerCard,
                      currentProvider === provider && { 
                        borderColor: theme.colors.primary,
                        borderWidth: 2
                      },
                      { backgroundColor: theme.colors.surfaceVariant }
                    ]}
                  >
                    <Card.Content style={styles.providerCardContent}>
                      <IconButton
                        icon={AI_PROVIDER_ICONS[provider]}
                        size={24}
                        iconColor={theme.colors.primary}
                        style={styles.providerIcon}
                      />
                      <Text style={styles.providerName}>
                        {AI_PROVIDER_NAMES[provider]}
                      </Text>
                      {apiKeys[provider] && (
                        <IconButton
                          icon="check-circle"
                          size={16}
                          iconColor={theme.colors.primary}
                        />
                      )}
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              API Anahtarı
            </Text>
            <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
              {AI_PROVIDER_NAMES[currentProvider]} için API anahtarınızı girin
            </Text>
            
            {renderInstructions()}
            
            {/* React Native Paper'ın TextInput'unu doğrudan kullanıyoruz, custom Input component yerine  */}
            <TextInput
              label="API Anahtarı"
              value={currentApiKey}
              onChangeText={handleApiKeyChange}
              secureTextEntry
              mode="outlined"
              placeholder="sk-xxxxxxxxxxxxxxxxxxxx"
              style={styles.inputContainer}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              testID="api-key-input"
              right={
                currentApiKey ? (
                  <TextInput.Icon 
                    icon="close-circle" 
                    onPress={handleClearApiKey}
                    forceTextInputFocus={false}
                  />
                ) : null
              }
            />
            
            <Button
              title="Kaydet"
              onPress={handleSaveApiKey}
              loading={isLoading}
              fullWidth
              variant="primary"
              disabled={false} // Boş API anahtarıyla kaydetmeye izin ver (silme işlemi için)
              style={styles.saveButton}
              showSuccessAnimation={showSuccessAnimation}
            />
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              API Kullanımı Hakkında
            </Text>
            <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
              Yemek tanıma özelliği, her fotoğraf gönderiminde API kullanımı tüketir. Her AI sağlayıcısının kendi fiyatlandırma modeli ve kullanım limitleri bulunmaktadır.
            </Text>
            <View style={[styles.infoContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text style={[styles.infoTitle, { color: theme.colors.onSurfaceVariant }]}>Önemli Notlar:</Text>
              <Text style={[styles.infoPoint, { color: theme.colors.onSurfaceVariant }]}>• API anahtarlarınız güvenli bir şekilde sadece cihazınızda saklanır.</Text>
              <Text style={[styles.infoPoint, { color: theme.colors.onSurfaceVariant }]}>• API kullanım ücretleri ve limitler doğrudan AI sağlayıcısı tarafından belirlenir.</Text>
              <Text style={[styles.infoPoint, { color: theme.colors.onSurfaceVariant }]}>• Ücretsiz katmanların sınırlarına dikkat edin.</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.m,
  },
  section: {
    marginBottom: spacing.xl,
  },
  screenTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    marginBottom: spacing.m,
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
  providerCardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.s,
  },
  providerCardWrapper: {
    width: '50%',
    padding: spacing.s,
  },
  providerCard: {
    marginBottom: spacing.s,
    elevation: 2,
  },
  providerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerIcon: {
    margin: 0,
    marginRight: spacing.s,
  },
  providerName: {
    flex: 1,
    fontSize: typography.fontSize.medium,
    fontWeight: '500',
  },
  divider: {
    marginVertical: spacing.m,
  },
  inputContainer: {
    marginBottom: spacing.m,
  },
  saveButton: {
    marginTop: spacing.s,
  },
  instructions: {
    fontSize: typography.fontSize.small,
    marginBottom: spacing.m,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  infoContainer: {
    padding: spacing.m,
    borderRadius: 8,
    marginTop: spacing.s,
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: spacing.s,
  },
  infoPoint: {
    marginBottom: spacing.xs,
    fontSize: typography.fontSize.small,
  },
});

export default ApiSettingsScreen; 