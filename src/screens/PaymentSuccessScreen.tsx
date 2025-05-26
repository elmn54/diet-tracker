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

type PaymentSuccessScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PaymentSuccess'>;
type PaymentSuccessScreenRouteProp = RouteProp<RootStackParamList, 'PaymentSuccess'>;

const PaymentSuccessScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<PaymentSuccessScreenNavigationProp>();
  const route = useRoute<PaymentSuccessScreenRouteProp>();
  const { planId, transactionId } = route.params;
  const { plans } = useSubscriptionStore();
  
  // Seçilen planı bul
  const selectedPlan = plans.find(plan => plan.id === planId);
  
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
        <View style={styles.successContainer}>
          <IconButton
            icon="check-circle"
            size={100}
            iconColor={theme.colors.primary}
            style={styles.successIcon}
          />
          
          <Text style={[styles.successTitle, { color: theme.colors.primary }]}>
            Payment Successful
          </Text>
          
          <Text style={styles.successMessage}>
            {selectedPlan?.name} subscription has been activated successfully.
          </Text>
        </View>
        
        <Card style={styles.detailsCard}>
          <Card.Content>
            <Text style={styles.detailsTitle}>Transaction Details</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction Number:</Text>
              <Text style={styles.detailValue}>{transactionId}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Subscription Planı:</Text>
              <Text style={styles.detailValue}>{selectedPlan?.name}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount:</Text>
              <Text style={styles.detailValue}>{selectedPlan?.price} Dollar / month</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={[styles.detailValue, styles.statusActive]}>Active</Text>
            </View>
          </Card.Content>
        </Card>
        
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>You can now do the following:</Text>
          
          {selectedPlan?.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <IconButton
                icon="check"
                size={16}
                iconColor={theme.colors.primary}
                style={styles.featureIcon}
              />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
        
        <Button
          title="Go to Home"
          onPress={handleGoHome}
          fullWidth
          variant="primary"
          style={styles.homeButton}
        />
        
        <Text style={styles.supportText}>
          If you have any questions, please contact our support team.
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
  successContainer: {
    alignItems: 'center',
    marginVertical: spacing.l,
  },
  successIcon: {
    marginBottom: spacing.m,
  },
  successTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: 'bold',
    marginBottom: spacing.s,
  },
  successMessage: {
    fontSize: typography.fontSize.large,
    textAlign: 'center',
    marginBottom: spacing.s,
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.s,
  },
  detailLabel: {
    fontSize: typography.fontSize.medium,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: typography.fontSize.medium,
    fontWeight: '500',
  },
  statusActive: {
    color: 'green',
    fontWeight: 'bold',
  },
  featuresContainer: {
    width: '100%',
    marginBottom: spacing.l,
  },
  featuresTitle: {
    fontSize: typography.fontSize.large,
    fontWeight: 'bold',
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
  homeButton: {
    marginBottom: spacing.m,
  },
  supportText: {
    fontSize: typography.fontSize.small,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: spacing.l,
  },
});

export default PaymentSuccessScreen; 