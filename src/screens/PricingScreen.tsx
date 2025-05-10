import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, useTheme, Card, IconButton, Badge, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { spacing, typography } from '../constants/theme';

const PricingScreen = () => {
  const theme = useTheme();
  const { 
    plans, 
    selectedPlan, 
    isSubscribed,
    isTrialActive, 
    selectPlan, 
    subscribe, 
    getRemainingTrialDays 
  } = useSubscriptionStore();
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Abonelik durumunu göster
  const renderSubscriptionStatus = () => {
    if (isSubscribed) {
      const activePlan = plans.find(plan => plan.id === selectedPlan);
      return (
        <View style={styles.statusContainer}>
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
        <View style={styles.statusContainer}>
          <IconButton
            icon="timer-sand"
            size={24}
            iconColor={theme.colors.primary}
          />
          <Text style={[styles.statusText, { color: theme.colors.primary }]}>
            Deneme Sürümü: {remainingDays} gün kaldı
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.statusContainer}>
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
      await subscribe();
    } catch (error) {
      console.error('Abonelik işlemi sırasında hata oluştu:', error);
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>
            Abonelik Planları
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Beslenme hedeflerinize ulaşmak için size en uygun planı seçin
          </Text>
        </View>
        
        {renderSubscriptionStatus()}
        
        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              onPress={() => selectPlan(plan.id)}
              testID={`plan-${plan.id}`}
              disabled={isSubscribed}
            >
              <Card
                style={[
                  styles.planCard,
                  selectedPlan === plan.id && { 
                    borderColor: theme.colors.primary,
                    borderWidth: 2
                  }
                ]}
              >
                <Card.Content>
                  <View style={styles.planHeader}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    {plan.id === 'premium' && (
                      <Badge style={{ backgroundColor: theme.colors.primary }}>
                        Popüler
                      </Badge>
                    )}
                  </View>
                  
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>
                      {plan.price} TL
                    </Text>
                    <Text style={styles.pricePeriod}>/ ay</Text>
                  </View>
                  
                  <Divider style={styles.divider} />
                  
                  <View style={styles.featuresContainer}>
                    {renderFeatures(plan.features)}
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.subscribeButtonContainer}>
          <Button
            title={isSubscribed ? "Mevcut Plan" : "Abone Ol"}
            onPress={handleSubscribe}
            loading={isLoading}
            disabled={isSubscribed}
            fullWidth
            variant="primary"
          />
          
          {isSubscribed && (
            <TouchableOpacity style={styles.cancelLink}>
              <Text style={[styles.cancelText, { color: theme.colors.error }]}>
                Aboneliği İptal Et
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Abonelik Hakkında:</Text>
          <Text style={styles.infoText}>• Abonelikler aylık olarak ücretlendirilir</Text>
          <Text style={styles.infoText}>• İptal edilmediği sürece otomatik olarak yenilenir</Text>
          <Text style={styles.infoText}>• App Store / Google Play üzerinden yönetilir</Text>
          <Text style={styles.infoText}>• Aboneliği istediğiniz zaman iptal edebilirsiniz</Text>
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
    marginBottom: spacing.xs,
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
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  statusText: {
    fontSize: typography.fontSize.medium,
    fontWeight: '500',
  },
  plansContainer: {
    marginBottom: spacing.l,
  },
  planCard: {
    marginBottom: spacing.m,
    elevation: 2,
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
    marginBottom: spacing.s,
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
  subscribeButtonContainer: {
    marginBottom: spacing.xl,
  },
  cancelLink: {
    alignItems: 'center',
    marginTop: spacing.m,
  },
  cancelText: {
    fontSize: typography.fontSize.medium,
    fontWeight: '500',
  },
  infoContainer: {
    backgroundColor: '#f5f5f5',
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