import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { loginSchema, LoginFormData } from '../utils/validationSchemas';
import Input from '../components/Input';
import Button from '../components/Button';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    // Normalde burada API çağrısı yapılırdı, şimdilik mock işlem
    console.log('Giriş bilgileri:', data);
    
    // Başarılı girişten sonra ana sayfaya yönlendirme
    navigation.navigate('Ana Sayfa');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giriş Yap</Text>
      
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
      
      <Button 
        title="Giriş Yap"
        onPress={handleSubmit(onSubmit)}
        style={styles.button}
      />
      
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>Hesabın yok mu?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.footerLink}>Kayıt Ol</Text>
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

export default LoginScreen; 