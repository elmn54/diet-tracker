import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme, Card, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Button from '../components/Button';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { spacing, typography } from '../constants/theme';

type PaymentFailureScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PaymentFailure'>;
type PaymentFailureScreenRouteProp = RouteProp<RootStackParamList, 'PaymentFailure'>;

const PaymentFailureScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<PaymentFailureScreenNavigationProp>();
  const route = useRoute<PaymentFailureScreenRouteProp>();
  const { error, planId } = route.params;
  const { plans } = useSubscriptionStore();
  
  // Seçilen planı bul (eğer varsa)
  const selectedPlan = planId ? plans.find(plan => plan.id === planId) : null;
  
  // Check if the plan is yearly
  const isYearlyPlan = planId?.includes('yearly') || false;
  
  // Ödeme sayfasına geri dön (tekrar deneme)
  const handleTryAgain = () => {
    if (selectedPlan) {
      navigation.navigate('Payment', {
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        price: selectedPlan.price
      });
    } else {
      // Plan bilgisi yoksa fiyatlandırma sayfasına dön
      navigation.navigate('Pricing');
    }
  };
  
  // Ana sayfaya dön
  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Ana Sayfa' }],
    });
  };
  
  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['left', 'right', 'bottom']}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.errorContainer}>
          <IconButton
            icon="alert-circle"
            size={100}
            iconColor={theme.colors.error}
            style={styles.errorIcon}
          />
          
          <Text style={[styles.errorTitle, { color: theme.colors.error }]}>
            Payment Failed
          </Text>
          
          <Text style={styles.errorMessage}>
            {error || 'Your transaction could not be completed. Please try again later.'}
          </Text>
        </View>
        
        <Card style={styles.detailsCard}>
          <Card.Content>
            <Text style={styles.detailsTitle}>Possible Reasons:</Text>
            
            <View style={styles.reasonItem}>
              <IconButton
                icon="information"
                size={16}
                iconColor={theme.colors.onSurface}
                style={styles.reasonIcon}
              />
              <Text style={styles.reasonText}>Your card information may be incorrect or incomplete</Text>
            </View>
            
            <View style={styles.reasonItem}>
              <IconButton
                icon="information"
                size={16}
                iconColor={theme.colors.onSurface}
                style={styles.reasonIcon}
              />
              <Text style={styles.reasonText}>Your card may have insufficient balance</Text>
            </View>
            
            <View style={styles.reasonItem}>
              <IconButton
                icon="information"
                size={16}
                iconColor={theme.colors.onSurface}
                style={styles.reasonIcon}
              />
              <Text style={styles.reasonText}>Your bank may not be approving the transaction</Text>
            </View>
            
            <View style={styles.reasonItem}>
              <IconButton
                icon="information"
                size={16}
                iconColor={theme.colors.onSurface}
                style={styles.reasonIcon}
              />
              <Text style={styles.reasonText}>There may be a temporary connection issue</Text>
            </View>
          </Card.Content>
        </Card>
        
        <View style={styles.buttonsContainer}>
          <Button
            title="Try Again"
            onPress={handleTryAgain}
            fullWidth
            variant="primary"
            style={styles.tryAgainButton}
          />
          
          <Button
            title="Go to Home"
            onPress={handleGoHome}
            fullWidth
            variant="outline"
          />
        </View>
        
        <Text style={styles.supportText}>
          If the problem persists, please try another payment method or contact our support team.
        </Text>
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
    alignItems: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    marginVertical: spacing.l,
  },
  errorIcon: {
    marginBottom: spacing.m,
  },
  errorTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: 'bold',
    marginBottom: spacing.s,
  },
  errorMessage: {
    fontSize: typography.fontSize.medium,
    textAlign: 'center',
    marginBottom: spacing.s,
    paddingHorizontal: spacing.m,
  },
  detailsCard: {
    width: '100%',
    marginBottom: spacing.l,
  },
  detailsTitle: {
    fontSize: typography.fontSize.large,
    fontWeight: 'bold',
    marginBottom: spacing.m,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  reasonIcon: {
    margin: 0,
    marginRight: spacing.xs,
  },
  reasonText: {
    fontSize: typography.fontSize.medium,
    flex: 1,
  },
  buttonsContainer: {
    width: '100%',
    marginBottom: spacing.l,
  },
  tryAgainButton: {
    marginBottom: spacing.s,
  },
  supportText: {
    fontSize: typography.fontSize.small,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: spacing.l,
    paddingHorizontal: spacing.m,
  },
});

export default PaymentFailureScreen; 