import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Button as PaperButton, IconButton, MD3Theme, useTheme } from 'react-native-paper';
import { spacing, typography } from '../constants/theme';

const { width } = Dimensions.get('window');

export type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  type?: AlertType;
  buttons?: AlertButton[];
  onDismiss: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  type = 'info',
  buttons = [{ text: 'Tamam', onPress: () => {}, style: 'default' }],
  onDismiss,
}) => {
  const theme = useTheme();
  const styles = makeStyles(theme);
  
  // Alert tipine göre ikon ve renk
  const getAlertIcon = () => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'alert';
      case 'info':
      default:
        return 'information';
    }
  };
  
  const getAlertColor = () => {
    switch (type) {
      case 'success':
        return theme.colors.primary;
      case 'error':
        return theme.colors.error;
      case 'warning':
        return '#F9A825'; // Amber color
      case 'info':
      default:
        return theme.colors.tertiary;
    }
  };
  
  const alertColor = getAlertColor();
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View 
          style={styles.container}
          onStartShouldSetResponder={() => true}
          onTouchEnd={e => e.stopPropagation()}
        >
          {/* Alert başlık ve icon bölümü */}
          <View style={styles.headerRow}>
            <IconButton
              icon={getAlertIcon()}
              iconColor={alertColor}
              size={28}
              style={styles.headerIcon}
            />
            <Text style={styles.title}>{title}</Text>
          </View>
          
          {/* Alert içerik bölümü */}
          <View style={styles.content}>
            {message && <Text style={styles.message}>{message}</Text>}
          </View>
          
          {/* Alert butonları */}
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <PaperButton
                key={index}
                mode={button.style === 'default' ? 'contained' : 'outlined'}
                onPress={() => {
                  button.onPress();
                  onDismiss();
                }}
                style={[
                  styles.button, 
                  index > 0 && styles.buttonMargin,
                  button.style === 'destructive' && styles.destructiveButton
                ]}
                textColor={button.style === 'destructive' ? theme.colors.error : undefined}
                buttonColor={button.style === 'default' ? alertColor : undefined}
              >
                {button.text}
              </PaperButton>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.85,
    maxWidth: 400,
    backgroundColor: theme.dark 
      ? theme.colors.elevation.level3 
      : theme.colors.background,
    borderRadius: 12,
    padding: spacing.m,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  headerIcon: {
    margin: 0,
    marginRight: spacing.xs,
  },
  content: {
    paddingVertical: spacing.s,
  },
  title: {
    fontSize: typography.fontSize.large,
    fontWeight: 'bold',
    color: theme.colors.onBackground,
    flex: 1,
  },
  message: {
    fontSize: typography.fontSize.medium,
    lineHeight: 22,
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.s,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.m,
  },
  button: {
    minWidth: 100,
  },
  buttonMargin: {
    marginLeft: spacing.s,
  },
  destructiveButton: {
    borderColor: theme.colors.error,
  },
});

export default CustomAlert; 