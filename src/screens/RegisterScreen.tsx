import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { registerSchema, RegisterFormData } from '../utils/validationSchemas';
import Input from '../components/Input';
import Button from '../components/Button';

const RegisterScreen = () => {
  const navigation = useNavigation<any>();
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
    <View style={styles.container}>
      <Text style={styles.title}>Hesap Oluştur</Text>
      
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
      
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>Zaten hesabın var mı?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.footerLink}>Giriş Yap</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  button: {
    marginTop: 16,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    marginRight: 5,
    color: '#666',
  },
  footerLink: {
    color: '#5c6bc0',
    fontWeight: 'bold',
  },
});

export default RegisterScreen; 