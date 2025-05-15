import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { z } from 'zod';
import Input from '../components/Input';
import Button from '../components/Button';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from 'react-native-paper';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;

// Form için validation şeması
const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, { message: 'E-posta adresi gereklidir' })
    .email({ message: 'Geçerli bir e-posta adresi girin' }),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    
    try {
      // Burada gerçek bir sıfırlama e-postası gönderme işlemi yapılacak
      console.log('Şifre sıfırlama talebi:', data.email);
      
      // Başarılı gönderiyi simüle ediyoruz
      setTimeout(() => {
        setResetSent(true);
        setIsSubmitting(false);
      }, 1500);
    } catch (error) {
      console.error('Şifre sıfırlama hatası:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {!resetSent ? (
        <>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>Şifrenizi mi Unuttunuz?</Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Kayıtlı e-posta adresinizi girin. Size şifrenizi sıfırlamanız için bir bağlantı göndereceğiz.
          </Text>
          
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                label="E-posta"
                placeholder="E-posta adresiniz"
                value={value}
                onChangeText={onChange}
                error={errors.email?.message}
                keyboardType="email-address"
              />
            )}
          />
          
          <Button 
            title="Sıfırlama Bağlantısı Gönder"
            onPress={handleSubmit(onSubmit)}
            style={styles.button}
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        </>
      ) : (
        <View style={styles.successContainer}>
          <Text style={[styles.successIcon, { color: theme.colors.primary }]}>✓</Text>
          <Text style={[styles.successTitle, { color: theme.colors.primary }]}>E-posta Gönderildi</Text>
          <Text style={[styles.successMessage, { color: theme.colors.onSurfaceVariant }]}>
            Şifre sıfırlama talimatlarını içeren bir e-posta gönderdik. Lütfen gelen kutunuzu kontrol edin.
          </Text>
          <Button 
            title="Giriş Ekranına Dön"
            onPress={() => navigation.navigate('Login')}
            style={styles.button}
            variant="outline"
          />
        </View>
      )}
      
      <View style={styles.footerContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.footerLink, { color: theme.colors.primary }]}>
            Giriş ekranına dön
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerLink: {
    fontWeight: 'bold',
  },
  successContainer: {
    alignItems: 'center',
    padding: 20,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
});

export default ForgotPasswordScreen; 