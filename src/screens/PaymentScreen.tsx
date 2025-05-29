// src/screens/PaymentScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Text, useTheme, Card, TextInput, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Button from '../components/Button';
import { useSubscriptionStore, SubscriptionPlan } from '../store/subscriptionStore';
import { spacing, typography } from '../constants/theme';

type PaymentScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Payment'>;
type PaymentScreenRouteProp = RouteProp<RootStackParamList, 'Payment'>;

const PaymentScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<PaymentScreenNavigationProp>();
  const route = useRoute<PaymentScreenRouteProp>();
  const { planId, planName, price } = route.params;
  const { activateSubscribedPlan, plans } = useSubscriptionStore(); 
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  
  // Check if the plan is yearly
  const isYearlyPlan = planId.includes('yearly');
  const billingPeriod = isYearlyPlan ? 'year' : 'month';
  
  const formatCardNumber = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    const truncated = numbers.slice(0, 16);
    const formatted = truncated.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };
  
  const formatExpiryDate = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    const truncated = numbers.slice(0, 4);
    if (truncated.length > 2) {
      setExpiryDate(`${truncated.slice(0, 2)}/${truncated.slice(2)}`);
    } else {
      setExpiryDate(truncated);
    }
  };
  
  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }
    
    const validPlanId = planId as 'free' | 'basic' | 'premium' | 'basic_yearly' | 'premium_yearly';
    if (!plans.some(p => p.id === validPlanId)) {
        Alert.alert("Error", "Invalid subscription plan selected.");
        return;
    }

    setIsProcessing(true);
    
    try {
      // const isSuccess = Math.random() > 0.2; // Başarı/başarısızlık simülasyonu
      const isSuccess = true; // Başarılı senaryoyu test ediyoruz
      
      console.log(`Payment simulation for plan ${planId}: Simulating ${isSuccess ? 'success' : 'failure'}.`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isSuccess) {
        const newEndDate = new Date();
        // Set end date based on plan type
        if (isYearlyPlan) {
          newEndDate.setFullYear(newEndDate.getFullYear() + 1);
        } else {
          newEndDate.setMonth(newEndDate.getMonth() + 1);
        }
        
        try {
          await activateSubscribedPlan(validPlanId, newEndDate);
          
          navigation.replace('PaymentSuccess', {
            planId: validPlanId,
            transactionId: `TRX-${Date.now()}`
          });
        } catch (subscriptionError) {
          console.error('Error activating subscription:', subscriptionError);
          navigation.replace('PaymentFailure', {
            error: 'Payment successful but there was an error when saving the subscription. Please contact our customer service.',
            planId: validPlanId
          });
        }
      } else {
        console.log('Payment failed, navigating to PaymentFailureScreen.');
        navigation.replace('PaymentFailure', {
          error: 'Simulated payment rejected. Please check your card information.',
          planId: validPlanId
        });
      }
    } catch (error) {
      console.error('Error during payment processing:', error);
      navigation.replace('PaymentFailure', {
        error: 'An unexpected error occurred during the payment process.',
        planId: validPlanId
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const validateForm = () => {
    if (!cardNumber.trim() || cardNumber.replace(/\s/g, '').length < 16) {
      Alert.alert('Error', 'Please enter a valid card number.');
      return false;
    }
    if (!expiryDate.trim() || expiryDate.length < 5 || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
      Alert.alert('Error', 'Please enter a valid expiration date (MM/YY).');
      return false;
    }
    const [monthStr, yearStr] = expiryDate.split('/');
    const month = parseInt(monthStr,10);
    const year = parseInt(yearStr,10);
    const currentYearLastTwoDigits = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (year < currentYearLastTwoDigits || (year === currentYearLastTwoDigits && month < currentMonth) || month < 1 || month > 12) {
        Alert.alert('Error', 'Invalid expiration date.');
        return false;
    }
    if (!cvv.trim() || cvv.length < 3) {
      Alert.alert('Error', 'Please enter a valid security code.');
      return false;
    }
    if (!cardHolderName.trim()) {
      Alert.alert('Error', 'Please enter the cardholder\'s name.');
      return false;
    }
    return true;
  };
  
  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['left', 'right', 'bottom']}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>
            Payment
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Enter your payment information for the {planName} subscription
          </Text>
        </View>
        
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryTitle}>Payment Summary</Text>
            <View style={styles.summaryRow}>
              <Text>Plan:</Text>
              <Text style={styles.summaryValue}>{planName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>Amount:</Text>
              <Text style={[styles.summaryValue, styles.priceValue]}>{price.toFixed(2)} Dollar / {billingPeriod}</Text>
            </View>
          </Card.Content>
        </Card>
        
        <Card style={styles.paymentCard}>
          <Card.Content>
            <Text style={styles.paymentTitle}>Card Information</Text>
            
            <TextInput
              label="Card Number"
              value={cardNumber}
              onChangeText={formatCardNumber}
              style={styles.input}
              keyboardType="numeric"
              maxLength={19}
              placeholder="0000 0000 0000 0000"
            />
            
            <View style={styles.rowInputs}>
              <TextInput
                label="Expiration Date"
                value={expiryDate}
                onChangeText={formatExpiryDate}
                style={[styles.input, styles.halfInput]}
                keyboardType="numeric"
                maxLength={5}
                placeholder="MM/YY"
              />
              
              <TextInput
                label="CVV"
                value={cvv}
                onChangeText={setCvv}
                style={[styles.input, styles.halfInput]}
                keyboardType="numeric"
                maxLength={Platform.OS === 'ios' ? 4 : 3}
                placeholder="123"
                secureTextEntry
              />
            </View>
            
            <TextInput
              label="Cardholder's Name"
              value={cardHolderName}
              onChangeText={setCardHolderName}
              style={styles.input}
              placeholder="NAME SURNAME"
              autoCapitalize="characters"
            />
          </Card.Content>
        </Card>
        
        <Button
          title={`${price.toFixed(2)} Dollar / ${billingPeriod}`}
          onPress={handlePayment}
          loading={isProcessing}
          disabled={isProcessing}
          fullWidth
          variant="primary"
          style={styles.payButton}
        />
        
        <View style={styles.securityInfo}>
          <Text style={styles.securityText}>
            🔒 Your payment information is securely transmitted and not stored.
          </Text>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.otherPaymentOptions}>
          <Text style={styles.otherPaymentTitle}>Other Payment Options</Text>
          
          <Button
            title={Platform.OS === 'ios' ? 'Pay with Apple Pay' : 'Pay with Google Pay'}
            onPress={() => Alert.alert('Information', 'This payment method is not currently available.')}
            variant="outline"
            style={styles.otherPaymentButton}
          />
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
    marginBottom: spacing.m,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: typography.fontSize.medium,
    marginTop: spacing.xs,
    textAlign: 'center'
  },
  summaryCard: {
    marginBottom: spacing.m,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: typography.fontSize.large,
    fontWeight: 'bold',
    marginBottom: spacing.s,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
    paddingVertical: spacing.xs,
  },
  summaryValue: {
    fontWeight: '500',
    fontSize: typography.fontSize.medium,
  },
  priceValue: {
    fontSize: typography.fontSize.large,
    fontWeight: 'bold',
  },
  paymentCard: {
    marginBottom: spacing.m,
    elevation: 2,
  },
  paymentTitle: {
    fontSize: typography.fontSize.large,
    fontWeight: 'bold',
    marginBottom: spacing.m,
  },
  input: {
    marginBottom: spacing.m,
    backgroundColor: 'transparent',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  payButton: {
    marginTop: spacing.s,
    marginBottom: spacing.l,
    paddingVertical: spacing.s,
  },
  securityInfo: {
    marginBottom: spacing.l,
    alignItems: 'center',
  },
  securityText: {
    fontSize: typography.fontSize.small,
    textAlign: 'center',
    opacity: 0.7,
  },
  divider: {
    marginVertical: spacing.m,
  },
  otherPaymentOptions: {
    marginBottom: spacing.l,
  },
  otherPaymentTitle: {
    fontSize: typography.fontSize.medium,
    fontWeight: 'bold',
    marginBottom: spacing.m,
    textAlign: 'center',
  },
  otherPaymentButton: {
    marginBottom: spacing.s,
  },
});

export default PaymentScreen;