import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { Text, useTheme, Card, IconButton, Badge, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Button from '../components/Button';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { spacing, typography } from '../constants/theme';
import { RootStackParamList } from '../navigation/AppNavigator';

// TypeScript için navigasyon tipi tanımı
type PricingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PricingScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<PricingScreenNavigationProp>();
  const { 
    plans, 
    selectedPlan, 
    isSubscribed,
    isTrialActive, 
    selectPlan, 
    subscribe, 
    getRemainingTrialDays,
    cancelSubscription
  } = useSubscriptionStore();
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Başlangıçta seçili planı 'basic' olarak ayarla
  useEffect(() => {
    if (!selectedPlan || !plans.some(p => p.id === selectedPlan)) {
      selectPlan('basic');
    }
  }, []);
  
  // Abonelik durumunu göster
  const renderSubscriptionStatus = () => {
    if (isSubscribed) {
      const activePlan = plans.find(plan => plan.id === selectedPlan);
      return (
        <View style={[styles.statusContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          <IconButton
            icon="check-circle"
            size={24}
            iconColor={theme.colors.primary}
          />
          <Text style={[styles.statusText, { color: theme.colors.primary }]}>
            Aktif Abonelik: {activePlan?.name}
          </Text>
        </View>
      );
    }
    
    if (isTrialActive) {
      const remainingDays = getRemainingTrialDays();
      return (
        <View style={[styles.statusContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          <IconButton
            icon="timer-sand"
            size={24}
            iconColor={theme.colors.tertiary}
          />
          <Text style={[styles.statusText, { color: theme.colors.tertiary }]}>
            Deneme Sürümü: {remainingDays} gün kaldı
          </Text>
        </View>
      );
    }
    
    return (
      <View style={[styles.statusContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
        <IconButton
          icon="information"
          size={24}
          iconColor={theme.colors.onSurfaceVariant}
        />
        <Text style={[styles.statusText, { color: theme.colors.onSurfaceVariant }]}>
          Şu anda aktif aboneliğiniz bulunmuyor
        </Text>
      </View>
    );
  };
  
  // Abone ol
  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const selectedPlanObj = plans.find(plan => plan.id === selectedPlan);
      if (!selectedPlanObj) {
        throw new Error('Seçili plan bulunamadı');
      }
      
      // Ödeme ekranına yönlendir
      navigation.navigate('Payment', {
        planId: selectedPlan,
        planName: selectedPlanObj.name,
        price: selectedPlanObj.price
      });
    } catch (error) {
      console.error('Abonelik işlemi sırasında hata oluştu:', error);
      Alert.alert('Hata', 'İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Özellik listesi oluştur
  const renderFeatures = (features: string[]) => {
    return features.map((feature, index) => (
      <View key={index} style={styles.featureItem}>
        <IconButton
          icon="check"
          size={16}
          iconColor={theme.colors.primary}
          style={styles.featureIcon}
        />
        <Text style={styles.featureText}>{feature}</Text>
      </View>
    ));
  };
  
  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['left', 'right', 'bottom']}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>
            Abonelik Planları
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Premium özelliklere erişim için size en uygun planı seçin
          </Text>
        </View>
    
        {renderSubscriptionStatus()}
        
        <View style={styles.plansContainer}>
          {plans.map((plan) => {
            const isPremium = plan.id === 'premium';
            const isSelected = selectedPlan === plan.id;
            
            return (
              <TouchableOpacity
                key={plan.id}
                onPress={() => selectPlan(plan.id)}
                testID={`plan-${plan.id}`}
                disabled={isSubscribed}
              >
                <Card
                  style={[
                    styles.planCard,
                    isPremium && styles.premiumPlanCard,
                    isSelected && { 
                      borderColor: theme.colors.primary,
                      borderWidth: 2
                    }
                  ]}
                >
                  {isPremium && (
                    <View style={[styles.popularBadgeContainer, { backgroundColor: theme.colors.primary }]}>
                      <Text style={styles.popularBadgeText}>En Popüler</Text>
                    </View>
                  )}
                  
                  <Card.Content style={isPremium ? styles.premiumCardContent : styles.cardContent}>
                    <View style={styles.planHeader}>
                      <Text style={[
                        styles.planName, 
                        isPremium && { color: theme.colors.primary }
                      ]}>
                        {plan.name}
                      </Text>
                    </View>
                    
                    <View style={styles.priceContainer}>
                      <Text style={[
                        styles.price,
                        isPremium && { color: theme.colors.primary }
                      ]}>
                        {plan.price} TL
                      </Text>
                      <Text style={styles.pricePeriod}>/ ay</Text>
                    </View>
                    
                    <Divider style={styles.divider} />
                    
                    <View style={styles.featuresContainer}>
                      {renderFeatures(plan.features)}
                    </View>
                    
                    {!isSubscribed && (
                      <Button
                        title="Abone Ol"
                        onPress={() => {
                          selectPlan(plan.id);
                          handleSubscribe();
                        }}
                        style={styles.planButton}
                        variant={isPremium ? "primary" : "outline"}
                      />
                    )}
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>
        
        {isSubscribed && (
          <View style={styles.subscribeButtonContainer}>
            <Button
              title="Abonelik Ayrıntıları"
              onPress={() => navigation.navigate('Profile')}
              style={styles.manageSubscriptionButton}
              variant="outline"
            />
            
            <TouchableOpacity 
              style={styles.cancelLink}
              onPress={() => {
                Alert.alert(
                  'Abonelik İptali',
                  'Aboneliğinizi iptal etmek istediğinize emin misiniz?',
                  [
                    { text: 'Vazgeç', style: 'cancel' },
                    { 
                      text: 'İptal Et', 
                      onPress: async () => {
                        try {
                          await cancelSubscription();
                          Alert.alert('Başarılı', 'Aboneliğiniz iptal edildi.');
                        } catch (error) {
                          console.error('Abonelik iptal edilirken hata oluştu:', error);
                          Alert.alert('Hata', 'İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.');
                        }
                      },
                      style: 'destructive'
                    }
                  ]
                );
              }}
            >
              <Text style={[styles.cancelText, { color: theme.colors.error }]}>
                Aboneliği İptal Et
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={[styles.infoContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text style={[styles.infoTitle, { color: theme.colors.onSurface }]}>Abonelik Hakkında:</Text>
          <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>• Abonelikler aylık olarak ücretlendirilir</Text>
          <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>• İptal edilmediği sürece otomatik olarak yenilenir</Text>
          <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>• {Platform.OS === 'ios' ? 'App Store' : 'Google Play'} üzerinden yönetilir</Text>
          <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>• Aboneliği istediğiniz zaman iptal edebilirsiniz</Text>
          <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>• Sorularınız için destek ekibimizle iletişime geçebilirsiniz</Text>
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
  header: {
    marginBottom: spacing.l,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: typography.fontSize.medium,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.l,
    padding: spacing.s,
    borderRadius: 8,
  },
  statusText: {
    fontSize: typography.fontSize.medium,
    fontWeight: '500',
    flex: 1,
  },
  plansContainer: {
    marginBottom: spacing.l,
  },
  premiumPlanContainer: {
    marginVertical: spacing.m,
  },
  planCard: {
    marginBottom: spacing.m,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
    minHeight: 300,
  },
  premiumPlanCard: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderColor: '#5D5FEF',
    borderWidth: 1.5,
  },
  premiumCardContent: {
    paddingTop: spacing.l,
  },
  cardContent: {
    paddingTop: spacing.s,
  },
  popularBadgeContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    zIndex: 2,
  },
  popularBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: typography.fontSize.small,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  planName: {
    fontSize: typography.fontSize.large,
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.m,
  },
  price: {
    fontSize: typography.fontSize.xxl,
    fontWeight: 'bold',
  },
  pricePeriod: {
    fontSize: typography.fontSize.small,
    marginLeft: spacing.xs,
  },
  divider: {
    marginBottom: spacing.m,
  },
  featuresContainer: {
    marginBottom: spacing.m,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  featureIcon: {
    margin: 0,
    marginRight: spacing.xs,
  },
  featureText: {
    fontSize: typography.fontSize.medium,
  },
  planButton: {
    marginTop: spacing.s,
  },
  subscribeButtonContainer: {
    marginBottom: spacing.xl,
  },
  manageSubscriptionButton: {
    marginBottom: spacing.s,
  },
  cancelLink: {
    alignItems: 'center',
    marginTop: spacing.s,
  },
  cancelText: {
    fontSize: typography.fontSize.medium,
    fontWeight: '500',
  },
  infoContainer: {
    padding: spacing.m,
    borderRadius: 8,
    marginBottom: spacing.l,
  },
  infoTitle: {
    fontSize: typography.fontSize.medium,
    fontWeight: 'bold',
    marginBottom: spacing.s,
  },
  infoText: {
    fontSize: typography.fontSize.small,
    marginBottom: spacing.xs,
  },
});

export default PricingScreen; 