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
            Ödeme Başarısız
          </Text>
          
          <Text style={styles.errorMessage}>
            {error || 'İşleminiz tamamlanamadı. Lütfen daha sonra tekrar deneyin.'}
          </Text>
        </View>
        
        <Card style={styles.detailsCard}>
          <Card.Content>
            <Text style={styles.detailsTitle}>Olası Nedenler:</Text>
            
            <View style={styles.reasonItem}>
              <IconButton
                icon="information"
                size={16}
                iconColor={theme.colors.onSurface}
                style={styles.reasonIcon}
              />
              <Text style={styles.reasonText}>Kart bilgileriniz yanlış veya eksik olabilir</Text>
            </View>
            
            <View style={styles.reasonItem}>
              <IconButton
                icon="information"
                size={16}
                iconColor={theme.colors.onSurface}
                style={styles.reasonIcon}
              />
              <Text style={styles.reasonText}>Kartınızda yeterli bakiye bulunmayabilir</Text>
            </View>
            
            <View style={styles.reasonItem}>
              <IconButton
                icon="information"
                size={16}
                iconColor={theme.colors.onSurface}
                style={styles.reasonIcon}
              />
              <Text style={styles.reasonText}>Bankanız işlemi onaylamıyor olabilir</Text>
            </View>
            
            <View style={styles.reasonItem}>
              <IconButton
                icon="information"
                size={16}
                iconColor={theme.colors.onSurface}
                style={styles.reasonIcon}
              />
              <Text style={styles.reasonText}>Geçici bir bağlantı sorunu olabilir</Text>
            </View>
          </Card.Content>
        </Card>
        
        <View style={styles.buttonsContainer}>
          <Button
            title="Tekrar Dene"
            onPress={handleTryAgain}
            fullWidth
            variant="primary"
            style={styles.tryAgainButton}
          />
          
          <Button
            title="Ana Sayfaya Dön"
            onPress={handleGoHome}
            fullWidth
            variant="outline"
          />
        </View>
        
        <Text style={styles.supportText}>
          Sorun devam ederse, lütfen başka bir ödeme yöntemi deneyin veya destek ekibimizle iletişime geçin.
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