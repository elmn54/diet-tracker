import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Button as PaperButton, ActivityIndicator, useTheme } from 'react-native-paper';
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
}) => {
  const theme = useTheme();
  const variantStyle = buttonVariants[variant];
  
  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      disabled={disabled || loading}
      icon={loading ? undefined : icon}
      style={[
        styles.button,
        {
          backgroundColor: variantStyle.backgroundColor,
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
      {loading ? (
        <ActivityIndicator 
          size={20} 
          color={variantStyle.textColor} 
          testID="button-loading"
        />
      ) : title}
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
});

export default Button; 