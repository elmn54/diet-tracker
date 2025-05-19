import React, { useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { loginSchema, LoginFormData } from '../utils/validationSchemas';
import Input from '../components/Input';
import Button from '../components/Button';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme, Divider } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const theme = useTheme();
  const { signIn, signInWithGoogle, error, isLoading, resetError } = useAuth();
  
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  // Reset any auth errors when component mounts
  useEffect(() => {
    resetError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    // Ensure all required fields are present before passing to signIn
    if (data.email && data.password) {
      await signIn({
        email: data.email,
        password: data.password,
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.log('Google sign in error:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>Giriş Yap</Text>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      
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
      
      <TouchableOpacity 
        onPress={() => navigation.navigate('ForgotPassword')}
        style={styles.forgotPasswordContainer}
      >
        <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>
          Şifremi Unuttum
        </Text>
      </TouchableOpacity>
      
      <Button 
        title={isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
        onPress={handleSubmit(onSubmit)}
        style={styles.button}
        disabled={isLoading}
      />
      
      <View style={styles.dividerContainer}>
        <Divider style={styles.divider} />
        <Text style={[styles.dividerText, { color: theme.colors.onSurfaceVariant }]}>veya</Text>
        <Divider style={styles.divider} />
      </View>
      
      <View style={styles.socialButtonsContainer}>
        <Button 
          title="Google ile Giriş Yap"
          onPress={handleGoogleSignIn}
          style={styles.socialButton}
          variant="outline"
          icon="google"
          disabled={isLoading}
        />
      </View>
      
      <View style={styles.footerContainer}>
        <Text style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>Hesabın yok mu?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={[styles.footerLink, { color: theme.colors.primary }]}>Kayıt Ol</Text>
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
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
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
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default LoginScreen; 