import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { registerSchema, RegisterFormData } from '../utils/validationSchemas';
import Input from '../components/Input';
import Button from '../components/Button';
import { useTheme, Divider } from 'react-native-paper';

const RegisterScreen = () => {
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    // Normalde burada API çağrısı yapılırdı, şimdilik mock işlem
    console.log('Kayıt bilgileri:', data);
    
    // Başarılı kayıttan sonra giriş ekranına yönlendirme
    navigation.navigate('Login');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>Hesap Oluştur</Text>
      
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <Input
            label="E-posta"
            placeholder="E-posta"
            value={value}
            onChangeText={onChange}
            error={errors.email?.message}
            keyboardType="email-address"
          />
        )}
      />
      
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Şifre"
            placeholder="Şifre"
            value={value}
            onChangeText={onChange}
            secureTextEntry
            error={errors.password?.message}
          />
        )}
      />
      
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Şifreyi Onayla"
            placeholder="Şifreyi Onayla"
            value={value}
            onChangeText={onChange}
            secureTextEntry
            error={errors.confirmPassword?.message}
          />
        )}
      />
      
      <Button 
        title="Kayıt Ol"
        onPress={handleSubmit(onSubmit)}
        style={styles.button}
      />
      
      <View style={styles.dividerContainer}>
        <Divider style={styles.divider} />
        <Text style={[styles.dividerText, { color: theme.colors.onSurfaceVariant }]}>veya</Text>
        <Divider style={styles.divider} />
      </View>
      
      <View style={styles.socialButtonsContainer}>
        <Button 
          title="Google ile Kayıt Ol"
          onPress={() => console.log('Google ile kayıt')}
          style={styles.socialButton}
          variant="outline"
          icon="google"
        />
      </View>
      
      <View style={styles.footerContainer}>
        <Text style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>Zaten hesabın var mı?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.footerLink, { color: theme.colors.primary }]}>Giriş Yap</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.termsText, { color: theme.colors.onSurfaceVariant }]}>
        Kayıt olarak, Kullanım Koşullarını ve Gizlilik Politikasını kabul etmiş olursunuz.
      </Text>
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
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialButtonsContainer: {
    marginBottom: 24,
  },
  socialButton: {
    marginBottom: 12,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  footerText: {
    marginRight: 5,
  },
  footerLink: {
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default RegisterScreen; 