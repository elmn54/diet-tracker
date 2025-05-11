import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity } from 'react-native';
import { IconButton, MD3Theme, useTheme } from 'react-native-paper';
import { spacing, typography } from '../constants/theme';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'success',
  duration = 3000,
  onDismiss,
}) => {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const opacity = new Animated.Value(0);
  
  // Toast'un belireceği ve kaybolacağı animasyon
  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.delay(duration),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
      ]).start(() => {
        onDismiss();
      });
    }
  }, [visible, duration, opacity, onDismiss]);
  
  if (!visible) return null;
  
  // Toast tipine göre ikon ve renk
  const getToastIcon = () => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'alert-circle';
      case 'info':
        return 'information';
      default:
        return 'check-circle';
    }
  };
  
  const getToastColor = () => {
    switch (type) {
      case 'success':
        return theme.colors.primary;
      case 'error':
        return theme.colors.error;
      case 'info':
        return theme.colors.tertiary;
      default:
        return theme.colors.primary;
    }
  };
  
  return (
    <Animated.View 
      style={[
        styles.container, 
        { opacity, backgroundColor: theme.dark 
          ? theme.colors.elevation.level3 
          : theme.colors.surface },
        type === 'success' && styles.successContainer,
        type === 'error' && styles.errorContainer,
        type === 'info' && styles.infoContainer,
      ]}
    >
      <View style={styles.iconContainer}>
        <IconButton
          icon={getToastIcon()}
          size={24}
          iconColor={getToastColor()}
          style={styles.icon}
        />
      </View>
      <Text style={[styles.message, { color: theme.colors.onSurface }]}>{message}</Text>
      <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
        <IconButton
          icon="close"
          size={20}
          iconColor={theme.colors.onSurfaceVariant}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 70,
    left: spacing.m,
    right: spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.s,
    borderRadius: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 9999,
  },
  successContainer: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  errorContainer: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  infoContainer: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.tertiary,
  },
  iconContainer: {
    marginRight: spacing.xs,
  },
  icon: {
    margin: 0,
  },
  message: {
    flex: 1,
    fontSize: typography.fontSize.medium,
    fontWeight: '500',
  },
  closeButton: {
    marginLeft: spacing.xs,
  },
});

export default Toast; 