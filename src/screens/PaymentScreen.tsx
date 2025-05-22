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
    
    // DÜZELTME: planId'nin geçerli bir tip olduğundan emin ol
    const validPlanId = planId as 'free' | 'basic' | 'premium';
    if (!plans.some(p => p.id === validPlanId)) {
        Alert.alert("Hata", "Geçersiz abonelik planı seçildi.");
        setIsProcessing(false);
        return;
    }

    setIsProcessing(true);
    
    try {
      const isSuccess = Math.random() > 0.2;
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (isSuccess) {
        const newEndDate = new Date();
        newEndDate.setMonth(newEndDate.getMonth() + 1);
        await activateSubscribedPlan(validPlanId, newEndDate); // Düzeltilmiş planId kullanıldı
        
        navigation.replace('PaymentSuccess', {
          planId: validPlanId, // Düzeltilmiş planId kullanıldı
          transactionId: `TRX-${Date.now()}`
        });
      } else {
        navigation.navigate('PaymentFailure', {
          error: 'Ödeme işlemi reddedildi. Lütfen kart bilgilerinizi kontrol ediniz.',
          planId: validPlanId // Düzeltilmiş planId kullanıldı
        });
      }
    } catch (error) {
      navigation.navigate('PaymentFailure', {
        error: 'Ödeme işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.',
        planId: validPlanId // Düzeltilmiş planId kullanıldı
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const validateForm = () => {
    // ... (validateForm içeriği öncekiyle aynı)
    if (!cardNumber.trim() || cardNumber.replace(/\s/g, '').length < 16) {
      Alert.alert('Hata', 'Lütfen geçerli bir kart numarası giriniz.');
      return false;
    }
    if (!expiryDate.trim() || expiryDate.length < 5 || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
      Alert.alert('Hata', 'Lütfen geçerli bir son kullanma tarihi giriniz (MM/YY).');
      return false;
    }
    const [month, year] = expiryDate.split('/');
    const currentYearLastTwoDigits = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    if (parseInt(year,10) < currentYearLastTwoDigits || (parseInt(year,10) === currentYearLastTwoDigits && parseInt(month,10) < currentMonth) || parseInt(month,10) < 1 || parseInt(month,10) > 12) {
        Alert.alert('Hata', 'Geçersiz son kullanma tarihi.');
        return false;
    }
    if (!cvv.trim() || cvv.length < 3) {
      Alert.alert('Hata', 'Lütfen geçerli bir güvenlik kodu giriniz.');
      return false;
    }
    if (!cardHolderName.trim()) {
      Alert.alert('Hata', 'Lütfen kart sahibinin adını giriniz.');
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
        {/* ... (JSX içeriği öncekiyle aynı, price ve planId doğru kullanılıyor) ... */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>
            Ödeme
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            {planName} aboneliği için ödeme bilgilerinizi giriniz
          </Text>
        </View>
        
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryTitle}>Ödeme Özeti</Text>
            <View style={styles.summaryRow}>
              <Text>Plan:</Text>
              <Text style={styles.summaryValue}>{planName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>Tutar:</Text>
              <Text style={[styles.summaryValue, styles.priceValue]}>{price.toFixed(2)} TL / ay</Text>
            </View>
          </Card.Content>
        </Card>
        
        <Card style={styles.paymentCard}>
          <Card.Content>
            <Text style={styles.paymentTitle}>Kart Bilgileri</Text>
            
            <TextInput
              label="Kart Numarası"
              value={cardNumber}
              onChangeText={formatCardNumber}
              style={styles.input}
              keyboardType="numeric"
              maxLength={19}
              placeholder="0000 0000 0000 0000"
            />
            
            <View style={styles.rowInputs}>
              <TextInput
                label="Son Kul. Tarihi"
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
              label="Kart Sahibinin Adı Soyadı"
              value={cardHolderName}
              onChangeText={setCardHolderName}
              style={styles.input}
              placeholder="AD SOYAD"
              autoCapitalize="characters"
            />
          </Card.Content>
        </Card>
        
        <Button
          title={`${price.toFixed(2)} TL Öde`}
          onPress={handlePayment}
          loading={isProcessing}
          disabled={isProcessing}
          fullWidth
          variant="primary"
          style={styles.payButton}
        />
        
        <View style={styles.securityInfo}>
          <Text style={styles.securityText}>
            🔒 Ödeme bilgileriniz güvenli bir şekilde iletilir ve saklanmaz.
          </Text>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.otherPaymentOptions}>
          <Text style={styles.otherPaymentTitle}>Diğer Ödeme Seçenekleri</Text>
          
          <Button
            title={Platform.OS === 'ios' ? 'Apple Pay ile Öde' : 'Google Pay ile Öde'}
            onPress={() => Alert.alert('Bilgi', 'Bu ödeme yöntemi henüz aktif değildir.')}
            variant="outline"
            style={styles.otherPaymentButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles öncekiyle aynı
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