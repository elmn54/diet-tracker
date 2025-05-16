import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Text, useTheme, Card, TextInput, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Button from '../components/Button';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { spacing, typography } from '../constants/theme';

type PaymentScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Payment'>;
type PaymentScreenRouteProp = RouteProp<RootStackParamList, 'Payment'>;

const PaymentScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<PaymentScreenNavigationProp>();
  const route = useRoute<PaymentScreenRouteProp>();
  const { planId, planName, price } = route.params;
  const { selectPlan } = useSubscriptionStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  
  // Kredi kartı numarasını formatlama
  const formatCardNumber = (text: string) => {
    // Sadece rakamları al
    const numbers = text.replace(/\D/g, '');
    // 16 karakterden uzun olmasını engelle
    const truncated = numbers.slice(0, 16);
    // Her 4 rakamdan sonra boşluk ekle
    const formatted = truncated.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };
  
  // Son kullanma tarihini formatlama
  const formatExpiryDate = (text: string) => {
    // Sadece rakamları al
    const numbers = text.replace(/\D/g, '');
    // 4 karakterden uzun olmasını engelle
    const truncated = numbers.slice(0, 4);
    // MM/YY formatı için bölme
    if (truncated.length > 2) {
      setExpiryDate(`${truncated.slice(0, 2)}/${truncated.slice(2)}`);
    } else {
      setExpiryDate(truncated);
    }
  };
  
  // Ödeme işlemini yap
  const handlePayment = async () => {
    // Form doğrulama
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Bu kısımda gerçek bir ödeme işlemi yapılacaktır
      // Örnek amacıyla, %80 başarılı ödeme simülasyonu
      const isSuccess = Math.random() > 0.2;
      
      // İşlem simülasyonu için gecikme
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (isSuccess) {
        // Başarılı ödeme
        // Seçilen planı store'a kaydet
        selectPlan(planId);
        
        // Başarılı ekranına yönlendir
        navigation.navigate('PaymentSuccess', {
          planId,
          transactionId: `TRX-${Date.now()}`
        });
      } else {
        // Başarısız ödeme
        navigation.navigate('PaymentFailure', {
          error: 'Ödeme işlemi reddedildi. Lütfen kart bilgilerinizi kontrol ediniz.',
          planId
        });
      }
    } catch (error) {
      // Hata durumunda
      navigation.navigate('PaymentFailure', {
        error: 'Ödeme işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.',
        planId
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Form doğrulama
  const validateForm = () => {
    if (!cardNumber.trim() || cardNumber.replace(/\s/g, '').length < 16) {
      Alert.alert('Hata', 'Lütfen geçerli bir kart numarası giriniz.');
      return false;
    }
    
    if (!expiryDate.trim() || expiryDate.length < 5) {
      Alert.alert('Hata', 'Lütfen geçerli bir son kullanma tarihi giriniz.');
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
              <Text style={[styles.summaryValue, styles.priceValue]}>{price} TL / ay</Text>
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
              maxLength={19} // 16 rakam + 3 boşluk
              placeholder="1234 5678 9012 3456"
            />
            
            <View style={styles.rowInputs}>
              <TextInput
                label="Son Kullanma Tarihi"
                value={expiryDate}
                onChangeText={formatExpiryDate}
                style={[styles.input, styles.halfInput]}
                keyboardType="numeric"
                maxLength={5} // MM/YY
                placeholder="MM/YY"
              />
              
              <TextInput
                label="CVV"
                value={cvv}
                onChangeText={setCvv}
                style={[styles.input, styles.halfInput]}
                keyboardType="numeric"
                maxLength={3}
                placeholder="123"
                secureTextEntry
              />
            </View>
            
            <TextInput
              label="Kart Sahibinin Adı"
              value={cardHolderName}
              onChangeText={setCardHolderName}
              style={styles.input}
              placeholder="AHMET YILMAZ"
              autoCapitalize="characters"
            />
          </Card.Content>
        </Card>
        
        <Button
          title={`${price} TL Öde`}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.m,
  },
  header: {
    marginBottom: spacing.m,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.medium,
  },
  summaryCard: {
    marginBottom: spacing.m,
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
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontWeight: '500',
  },
  priceValue: {
    fontSize: typography.fontSize.large,
    fontWeight: 'bold',
  },
  paymentCard: {
    marginBottom: spacing.m,
  },
  paymentTitle: {
    fontSize: typography.fontSize.large,
    fontWeight: 'bold',
    marginBottom: spacing.s,
  },
  input: {
    marginBottom: spacing.s,
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
    marginBottom: spacing.m,
  },
  securityInfo: {
    marginBottom: spacing.m,
  },
  securityText: {
    fontSize: typography.fontSize.small,
    textAlign: 'center',
    opacity: 0.7,
  },
  divider: {
    marginBottom: spacing.m,
  },
  otherPaymentOptions: {
    marginBottom: spacing.l,
  },
  otherPaymentTitle: {
    fontSize: typography.fontSize.medium,
    fontWeight: 'bold',
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  otherPaymentButton: {
    marginBottom: spacing.s,
  },
});

export default PaymentScreen; 