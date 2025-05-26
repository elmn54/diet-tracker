// src/screens/PricingScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { Text, useTheme, Card, IconButton, Badge, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Button from '../components/Button';
import { useSubscriptionStore, SubscriptionPlan } from '../store/subscriptionStore';
import { spacing, typography } from '../constants/theme';
import { RootStackParamList } from '../navigation/AppNavigator';

type PricingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Pricing'>;

const PricingScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<PricingScreenNavigationProp>();
  const { 
    plans, 
    activePlanId,
    selectedPlanForPayment,
    isSubscribed, 
    setSelectedPlanForPaymentLocally,
    cancelUserSubscription,
    // Deneme sürümüyle ilgili kısımlar kaldırıldı
    // isTrialActive, 
    // getRemainingTrialDays,
    // startTrial,
  } = useSubscriptionStore();
  
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (isSubscribed && plans.some(p => p.id === activePlanId)) {
      setSelectedPlanForPaymentLocally(activePlanId);
    } else if (!plans.some(p => p.id === selectedPlanForPayment)) {
      setSelectedPlanForPaymentLocally('basic');
    }
  }, [activePlanId, isSubscribed, plans, selectedPlanForPayment, setSelectedPlanForPaymentLocally]);
  
  const renderSubscriptionStatus = () => {
    if (isSubscribed) {
      const currentActivePlanDetails = plans.find(plan => plan.id === activePlanId);
      return (
        <View style={[styles.statusContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          <IconButton icon="check-circle" size={24} iconColor={theme.colors.primary} />
          <Text style={[styles.statusText, { color: theme.colors.primary }]}>
            Active Subscription: {currentActivePlanDetails?.name || activePlanId}
          </Text>
        </View>
      );
    }
    // Deneme sürümüyle ilgili kısım kaldırıldı
    // if (isTrialActive) { ... }
    
    // Deneme sürümü butonu yerine standart mesaj
    return (
      <View style={[styles.statusContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
        <IconButton
          icon="information-outline" // information-outline daha uygun olabilir
          size={24}
          iconColor={theme.colors.onSurfaceVariant}
        />
        <Text style={[styles.statusText, { color: theme.colors.onSurfaceVariant }]}>
          Şu anda aktif aboneliğiniz bulunmuyor.
        </Text>
      </View>
    );
  };
  
  const handleProceedToPayment = (planToPay: SubscriptionPlan) => {
    if (isSubscribed && activePlanId === planToPay.id) {
        Alert.alert("Information", "You are already subscribed to this plan.");
        return;
    }
    setSelectedPlanForPaymentLocally(planToPay.id);
    navigation.navigate('Payment', {
      planId: planToPay.id,
      planName: planToPay.name,
      price: planToPay.price
    });
  };
  
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
            Subscription Plans
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Choose the plan that best suits your needs for premium features
          </Text>
        </View>
    
        {renderSubscriptionStatus()}
        
        <View style={styles.plansContainer}>
          {plans.map((plan) => {
            if (plan.id === 'free') return null;
            const isPremiumCard = plan.id === 'premium';
            const isSelectedForPayment = selectedPlanForPayment === plan.id;
            
            return (
              <TouchableOpacity
                key={plan.id}
                onPress={() => {
                    if (!isSubscribed || activePlanId !== plan.id) {
                        setSelectedPlanForPaymentLocally(plan.id);
                    }
                }}
                testID={`plan-${plan.id}`}
              >
                <Card
                  style={[
                    styles.planCard,
                    isPremiumCard && styles.premiumPlanCard,
                    isSelectedForPayment && { 
                      borderColor: theme.colors.primary,
                      borderWidth: 2.5,
                      elevation: 6,
                    }
                  ]}
                >
                  {isPremiumCard && (
                    <View style={[styles.popularBadgeContainer, { backgroundColor: theme.colors.primary }]}>
                      <Text style={styles.popularBadgeText}>Most Popular</Text>
                    </View>
                  )}
                  
                  <Card.Content style={isPremiumCard ? styles.premiumCardContent : styles.cardContent}>
                    <View style={styles.planHeader}>
                      <Text style={[
                        styles.planName, 
                        isPremiumCard && { color: theme.colors.primary }
                      ]}>
                        {plan.name}
                      </Text>
                    </View>
                    
                    <View style={styles.priceContainer}>
                      <Text style={[
                        styles.price,
                        isPremiumCard && { color: theme.colors.primary }
                      ]}>
                        {plan.price.toFixed(2)} $
                      </Text>
                      <Text style={styles.pricePeriod}>/ month</Text>
                    </View>
                    
                    <Divider style={styles.divider} />
                    
                    <View style={styles.featuresContainer}>
                      {renderFeatures(plan.features)}
                    </View>
                    
                    {(!isSubscribed || activePlanId !== plan.id) && (
                      <Button
                        title={isSubscribed ? (activePlanId === 'basic' && plan.id === 'premium' ? "Upgrade to Premium" : "Switch to this Plan") : "Subscribe"}
                        onPress={() => handleProceedToPayment(plan)}
                        style={styles.planButton}
                        variant={isPremiumCard || isSelectedForPayment ? "primary" : "outline"}
                        disabled={isLoading || (isSubscribed && activePlanId === plan.id)}
                      />
                    )}
                    {(isSubscribed && activePlanId === plan.id) && (
                        <View style={styles.currentPlanIndicator}>
                            <Text style={[styles.currentPlanText, {color: theme.colors.primary}]}>Your Current Plan</Text>
                        </View>
                    )}
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>
        
        {isSubscribed && activePlanId !== 'free' && (
          <View style={styles.subscribeButtonContainer}>
            <Button
              title="Subscription Details"
              onPress={() => navigation.navigate('Profile')}
              style={styles.manageSubscriptionButton}
              variant="outline"
            />
            
            <TouchableOpacity 
              style={styles.cancelLink}
              onPress={() => {
                Alert.alert(
                  'Cancel Subscription',
                  'Are you sure you want to cancel your subscription? You can continue to access premium features until the end of your current billing period.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Confirm Cancellation', 
                      onPress: async () => {
                        try {
                          await cancelUserSubscription();
                          Alert.alert('Success', 'Your subscription has been canceled. It will not renew in the next billing period.');
                        } catch (error) {
                          console.error('Subscription iptal edilirken hata oluştu:', error);
                          Alert.alert('Error', 'An error occurred during the process. Please try again.');
                        }
                      },
                      style: 'destructive'
                    }
                  ]
                );
              }}
            >
              <Text style={[styles.cancelText, { color: theme.colors.error }]}>
                Cancel Subscription
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={[styles.infoContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text style={[styles.infoTitle, { color: theme.colors.onSurface }]}>About Subscriptions:</Text>
          <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>• Subscriptions are billed monthly</Text>
          <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>• Automatically renews unless canceled</Text>
          <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>• Managed through {Platform.OS === 'ios' ? 'App Store' : 'Google Play'}</Text>
          <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>• You can cancel your subscription anytime</Text>
          <Text style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>• Contact our support team for any questions</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles (styles.trialButtonContainer kaldırıldı, statusContainer'daki ikon değişti)
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
    marginTop: spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.l,
    padding: spacing.s,
    borderRadius: 8,
  },
  // trialButtonContainer kaldırıldı
  statusText: {
    fontSize: typography.fontSize.medium,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  plansContainer: {
    marginBottom: spacing.l,
  },
  planCard: {
    marginBottom: spacing.m,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
  },
  premiumPlanCard: {
    elevation: 4,
  },
  premiumCardContent: {
    paddingTop: spacing.l,
    padding: spacing.m,
  },
  cardContent: {
    padding: spacing.m,
  },
  popularBadgeContainer: {
    position: 'absolute',
    top: 0,
    left:0,
    right:0,
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
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  planName: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: spacing.m,
    marginTop: spacing.xs,
  },
  price: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: 'bold',
  },
  pricePeriod: {
    fontSize: typography.fontSize.medium,
    marginLeft: spacing.xs,
    color: '#666'
  },
  divider: {
    marginVertical: spacing.m,
  },
  featuresContainer: {
    marginBottom: spacing.l,
    minHeight: 100,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  featureIcon: {
    margin: 0,
    marginRight: spacing.s,
  },
  featureText: {
    fontSize: typography.fontSize.medium,
    flexShrink: 1,
  },
  planButton: {
    marginTop: 'auto',
    paddingVertical: spacing.s,
  },
  currentPlanIndicator: {
    marginTop: 'auto',
    paddingVertical: spacing.m,
    alignItems: 'center',
  },
  currentPlanText: {
    fontSize: typography.fontSize.medium,
    fontWeight: 'bold',
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
    padding: spacing.xs,
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
    lineHeight: typography.fontSize.small * 1.5,
  },
});

export default PricingScreen;