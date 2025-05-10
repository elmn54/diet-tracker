import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../../src/components/Button';

// React Native Paper'ı mock olarak ayarlayalım çünkü RN Paper'ın derin bağımlılıkları test ortamında sorun çıkarabilir
jest.mock('react-native-paper', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');

  return {
    Button: ({ children, style, testID, onPress, disabled, contentStyle, labelStyle }: any) => (
      <TouchableOpacity 
        onPress={disabled ? undefined : onPress} 
        style={style} 
        testID={testID} 
        disabled={disabled}
      >
        <Text style={labelStyle}>{children}</Text>
      </TouchableOpacity>
    ),
    ActivityIndicator: ({ testID, size, color }: any) => <View testID={testID} size={size} color={color} />,
  };
});

describe('Button Component', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(<Button title="Test Button" />);
    expect(getByText('Test Button')).toBeTruthy();
  });
  
  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button title="Test Button" onPress={onPressMock} />);
    
    fireEvent.press(getByText('Test Button'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
  
  it('displays loading state', () => {
    const { getByTestId } = render(<Button title="Test Button" loading={true} />);
    expect(getByTestId('button-loading')).toBeTruthy();
  });
  
  it('is disabled when loading', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={onPressMock} loading={true} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(onPressMock).not.toHaveBeenCalled();
  });
  
  it('applies custom style', () => {
    const { getByTestId } = render(
      <Button 
        title="Test Button" 
        style={{ backgroundColor: 'red' }} 
      />
    );
    
    const buttonContainer = getByTestId('button-container');
    // Button bileşenimiz style prop'u alıyor
    expect(buttonContainer.props.style).toBeTruthy();
  });
}); 