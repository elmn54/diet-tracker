import React, { useState, useEffect } from 'react';
import { StyleSheet, StyleProp, ViewStyle, Animated, Easing } from 'react-native';
import { Button as PaperButton, ActivityIndicator, useTheme, IconButton } from 'react-native-paper';
import { buttonVariants } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
  style?: StyleProp<ViewStyle>;
  variant?: 'primary' | 'secondary' | 'outline' | 'transparent' | 'success';
  fullWidth?: boolean;
  icon?: string;
  showSuccessAnimation?: boolean;
  successDuration?: number;
}

/**
 * Özel stil uygulanmış, yükleme durumu gösterebilen ve farklı varyantları destekleyen buton bileşeni
 */
const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  mode = 'contained',
  style,
  variant = 'primary',
  fullWidth = false,
  icon,
  showSuccessAnimation = false,
  successDuration = 1500,
}) => {
  const theme = useTheme();
  const variantStyle = buttonVariants[variant];
  
  const [showSuccess, setShowSuccess] = useState(false);
  const successScale = new Animated.Value(0);
  const successOpacity = new Animated.Value(0);
  
  // Success animasyonu
  useEffect(() => {
    if (showSuccessAnimation && !showSuccess) {
      setShowSuccess(true);
      
      // Scale ve opacity animasyonları
      Animated.parallel([
        Animated.timing(successScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5)),
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Animasyon sonrası reset
      const timer = setTimeout(() => {
        Animated.timing(successOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setShowSuccess(false);
          successScale.setValue(0);
        });
      }, successDuration);
      
      return () => clearTimeout(timer);
    }
  }, [showSuccessAnimation, showSuccess, successScale, successOpacity, successDuration]);
  
  const buttonContent = () => {
    if (showSuccess) {
      return (
        <Animated.View style={{ 
          transform: [{ scale: successScale }],
          opacity: successOpacity,
        }}>
          <IconButton
            icon="check-circle"
            iconColor={theme.colors.background}
            size={24}
            style={styles.successIcon}
          />
        </Animated.View>
      );
    }
    
    if (loading) {
      return (
        <ActivityIndicator 
          size={20} 
          color={variantStyle.textColor} 
          testID="button-loading"
        />
      );
    }
    
    return title;
  };
  
  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      disabled={disabled || loading || showSuccess}
      icon={(!loading && !showSuccess) ? icon : undefined}
      style={[
        styles.button,
        {
          backgroundColor: showSuccess ? theme.colors.primary : variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor,
          borderWidth: variantStyle.borderWidth,
        },
        fullWidth && styles.fullWidth,
        style
      ]}
      contentStyle={styles.contentStyle}
      labelStyle={[
        styles.labelStyle,
        { color: variantStyle.textColor },
      ]}
      testID="button-container"
      theme={{ roundness: 24 }}
    >
      {buttonContent()}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 24,
    elevation: 0,
  },
  contentStyle: { 
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  labelStyle: { 
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  successIcon: {
    margin: 0,
    padding: 0,
  },
});

export default Button; 