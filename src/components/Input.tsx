import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, TextStyle, KeyboardTypeOptions } from 'react-native';
import { TextInput, Text, HelperText, useTheme, MD3Theme } from 'react-native-paper';
import { spacing, typography } from '../constants/theme';

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
  testID?: string;
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
  testID,
}) => {
  const theme = useTheme();
  const styles = makeStyles(theme);

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
        outlineColor={theme.colors.outline}
        activeOutlineColor={theme.colors.primary}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        testID={testID || "input-field"}
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

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
  container: {
    marginVertical: spacing.s,
  },
  input: {
    backgroundColor: theme.colors.surface,
    fontSize: typography.fontSize.medium,
  },
  errorText: {
    fontSize: typography.fontSize.small,
    color: theme.colors.error,
    marginTop: spacing.xs,
  },
});

export default Input; 