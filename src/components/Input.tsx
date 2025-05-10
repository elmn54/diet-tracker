import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, TextStyle, KeyboardTypeOptions } from 'react-native';
import { TextInput, Text, HelperText } from 'react-native-paper';
import { colors, spacing, typography } from '../constants/theme';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  numberOfLines?: number;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

/**
 * Özel stillendirilmiş input bileşeni - form alanları için kullanılır
 */
const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
}) => {
  return (
    <View style={[styles.container, style]}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        mode="outlined"
        style={[styles.input, inputStyle]}
        error={!!error}
        disabled={disabled}
        outlineColor={colors.divider}
        activeOutlineColor={colors.primary}
        placeholderTextColor={colors.placeholder}
        testID="input-field"
        accessibilityLabel={accessibilityLabel || label}
        accessibilityHint={accessibilityHint}
      />
      {error ? (
        <HelperText type="error" visible={!!error} style={styles.errorText}>
          {error}
        </HelperText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.s,
  },
  input: {
    backgroundColor: colors.surface,
    fontSize: typography.fontSize.medium,
  },
  errorText: {
    fontSize: typography.fontSize.small,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

export default Input; 