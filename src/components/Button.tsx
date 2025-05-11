import React, { useState, useEffect } from 'react';
import { StyleSheet, StyleProp, ViewStyle, View, Text } from 'react-native';
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
  
  // Success durumunu güncelle
  useEffect(() => {
    if (showSuccessAnimation && !showSuccess) {
      setShowSuccess(true);
      
      // Belirli bir süre sonra başarı durumunu sıfırla
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, successDuration);
      
      return () => clearTimeout(timer);
    }
  }, [showSuccessAnimation, showSuccess, successDuration]);

  // Buton içeriğini hazırla
  const renderContent = () => {
    const contentItems = [];
    
    // Yükleme göstergesi
    if (loading) {
      return (
        <ActivityIndicator 
          size={20} 
          color={variantStyle.textColor} 
          testID="button-loading"
        />
      );
    }
    
    // Normal ikonlar
    if (icon && !showSuccess) {
      contentItems.push(
        <IconButton
          key="icon"
          icon={icon}
          size={20}
          iconColor={variantStyle.textColor}
          style={styles.buttonIcon}
        />
      );
    }
    
    // Başarı ikonu
    if (showSuccess) {
      contentItems.push(
        <IconButton
          key="success-icon"
          icon="check-circle"
          size={20}
          iconColor={variantStyle.textColor}
          style={styles.buttonIcon}
        />
      );
    }
    
    // Başlık metni her durumda göster
    contentItems.push(
      <Text key="title" style={[styles.labelStyle, { color: variantStyle.textColor }]}>
        {title}
      </Text>
    );
    
    return (
      <View style={styles.contentContainer}>
        {contentItems}
      </View>
    );
  };
  
  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      disabled={disabled || loading}
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
      contentStyle={styles.buttonContentStyle}
      testID="button-container"
      theme={{ roundness: 24 }}
    >
      {renderContent()}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 24,
    elevation: 0,
  },
  buttonContentStyle: { 
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelStyle: { 
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  buttonIcon: {
    margin: 0,
    padding: 0,
    width: 24,
    height: 24,
    marginRight: 8,
  },
  fullWidth: {
    width: '100%',
  },
});

export default Button; 