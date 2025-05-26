import React, { useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { registerSchema, RegisterFormData } from '../utils/validationSchemas';
import Input from '../components/Input';
import Button from '../components/Button';
import { useTheme, Divider } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

const RegisterScreen = () => {
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const { signUp, signInWithGoogle, error, isLoading, resetError } = useAuth();
  
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  
  // Reset any auth errors when component mounts
  useEffect(() => {
    resetError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: RegisterFormData) => {
    // Ensure all required fields are present before passing to signUp
    if (data.displayName && data.email && data.password) {
      await signUp({
        displayName: data.displayName,
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
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>Register</Text>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      <Controller
        control={control}
        name="displayName"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Name"
            placeholder="Name"
            value={value}
            onChangeText={onChange}
            error={errors.displayName?.message}
          />
        )}
      />
      
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Email"
            placeholder="Email"
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
            label="Password"
            placeholder="Password"
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
            label="Confirm Password"
            placeholder="Confirm Password"
            value={value}
            onChangeText={onChange}
            secureTextEntry
            error={errors.confirmPassword?.message}
          />
        )}
      />
      
      <Button 
        title={isLoading ? "Registering..." : "Register"}
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
          title="Register with Google"
          onPress={handleGoogleSignIn}
          style={styles.socialButton}
          variant="outline"
          icon="google"
          disabled={isLoading}
        />
      </View>
      
      <View style={styles.footerContainer}>
        <Text style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>Already have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.footerLink, { color: theme.colors.primary }]}>Sign In</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.termsText, { color: theme.colors.onSurfaceVariant }]}>
        By registering, you agree to the Terms of Use and Privacy Policy.
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
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default RegisterScreen; 