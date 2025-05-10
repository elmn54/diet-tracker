import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Input from '../../src/components/Input';

// Basitlik için React Native Paper'ı mock olarak ayarlıyoruz
jest.mock('react-native-paper', () => {
  const React = require('react');
  const { View, Text, TextInput } = require('react-native');

  return {
    TextInput: ({ label, value, onChangeText, error, placeholder, secureTextEntry, testID, style }) => (
      <View>
        {label && <Text>{label}</Text>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          testID={testID || 'input-field'}
          style={style}
        />
        {error && <Text testID="error-text">{error}</Text>}
      </View>
    ),
  };
});

describe('Input Component', () => {
  it('renders with label', () => {
    const { getByText } = render(<Input label="Test Label" />);
    expect(getByText('Test Label')).toBeTruthy();
  });

  it('renders with placeholder', () => {
    const { getByPlaceholderText } = render(<Input placeholder="Test Placeholder" />);
    expect(getByPlaceholderText('Test Placeholder')).toBeTruthy();
  });

  it('handles text changes', () => {
    const onChangeMock = jest.fn();
    const { getByTestId } = render(
      <Input 
        value="" 
        onChangeText={onChangeMock} 
        testID="test-input" 
      />
    );
    
    fireEvent.changeText(getByTestId('test-input'), 'test value');
    expect(onChangeMock).toHaveBeenCalledWith('test value');
  });

  it('displays error message', () => {
    const { getByTestId } = render(<Input error="Error message" />);
    expect(getByTestId('error-text')).toBeTruthy();
  });

  it('applies secure text entry for password fields', () => {
    const { getByTestId } = render(<Input secureTextEntry testID="test-input" />);
    expect(getByTestId('test-input').props.secureTextEntry).toBe(true);
  });
}); 