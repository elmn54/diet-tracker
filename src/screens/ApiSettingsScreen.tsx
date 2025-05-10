import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, useTheme, Card, IconButton, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../components/Input';
import Button from '../components/Button';
import { useApiKeyStore } from '../store/apiKeyStore';
import { AI_PROVIDERS, AI_PROVIDER_NAMES, AI_PROVIDER_ICONS } from '../constants/aiProviders';
import { spacing, typography } from '../constants/theme';

const ApiSettingsScreen = () => {
  const theme = useTheme();
  const { apiKeys, preferredProvider, setApiKey, setPreferredProvider, loadApiKeys } = useApiKeyStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentApiKey, setCurrentApiKey] = useState('');
  const [currentProvider, setCurrentProvider] = useState(preferredProvider);
  
  // API Keys store'unu yükle
  useEffect(() => {
    const loadKeys = async () => {
      await loadApiKeys();
      if (apiKeys[preferredProvider]) {
        setCurrentApiKey(apiKeys[preferredProvider] || '');
      }
      setCurrentProvider(preferredProvider);
    };
    
    loadKeys();
  }, [loadApiKeys, apiKeys, preferredProvider]);
  
  // API anahtarını güncelle
  const handleSaveApiKey = async () => {
    setIsLoading(true);
    try {
      await setApiKey(currentProvider, currentApiKey.trim());
    } catch (error) {
      console.error('API anahtarı kaydedilirken hata oluştu:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
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
  
  // API kullanımı için talimatları oluştur
  const renderInstructions = () => {
    switch (currentProvider) {
      case AI_PROVIDERS.OPENAI:
        return (
          <Text style={[styles.instructions, { color: theme.colors.onSurfaceVariant }]}>
            OpenAI API anahtarınızı oluşturmak için <Text style={{ fontWeight: 'bold' }}>platform.openai.com</Text> adresine gidin 
            ve API &gt; API Keys bölümünden yeni bir anahtar oluşturun.
          </Text>
        );
      case AI_PROVIDERS.GEMINI:
        return (
          <Text style={[styles.instructions, { color: theme.colors.onSurfaceVariant }]}>
            Google Gemini API anahtarınızı oluşturmak için <Text style={{ fontWeight: 'bold' }}>makersuite.google.com</Text> adresine gidin 
            ve API Key bölümünden yeni bir anahtar oluşturun.
          </Text>
        );
      case AI_PROVIDERS.CLAUDE:
        return (
          <Text style={[styles.instructions, { color: theme.colors.onSurfaceVariant }]}>
            Claude API anahtarınızı oluşturmak için <Text style={{ fontWeight: 'bold' }}>claude.ai/console</Text> adresine gidin 
            ve API Keys bölümünden yeni bir anahtar oluşturun.
          </Text>
        );
      default:
        return null;
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            AI Sağlayıcıları
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
          
          <Input
            label="API Anahtarı"
            value={currentApiKey}
            onChangeText={setCurrentApiKey}
            secureTextEntry
            placeholder="sk-xxxxxxxxxxxxxxxxxxxx"
            style={styles.inputContainer}
            testID="api-key-input"
          />
          
          <Button
            title="Kaydet"
            onPress={handleSaveApiKey}
            loading={isLoading}
            fullWidth
            variant="primary"
            disabled={!currentApiKey.trim()}
            style={styles.saveButton}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            API Kullanımı Hakkında
          </Text>
          <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
            Yemek tanıma özelliği, her fotoğraf gönderiminde API kullanımı tüketir. Her AI sağlayıcısının kendi fiyatlandırma modeli ve kullanım limitleri bulunmaktadır.
          </Text>
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Önemli Notlar:</Text>
            <Text style={styles.infoPoint}>• API anahtarlarınız güvenli bir şekilde sadece cihazınızda saklanır.</Text>
            <Text style={styles.infoPoint}>• API kullanım ücretleri ve limitler doğrudan AI sağlayıcısı tarafından belirlenir.</Text>
            <Text style={styles.infoPoint}>• Ücretsiz katmanların sınırlarına dikkat edin.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.m,
  },
  section: {
    marginBottom: spacing.xl,
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
    backgroundColor: '#f5f5f5',
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