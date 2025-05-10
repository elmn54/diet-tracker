import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from '../../src/navigation/AppNavigator';

// Testi değiştirmemiz sorun olmaması için mock oluşturalım
jest.mock('../../src/screens/HomeScreen', () => {
  return function MockHomeScreen() {
    return null;
  };
});

describe('AppNavigator', () => {
  it('renders the home screen with correct title', () => {
    const { UNSAFE_getAllByType } = render(
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    );
    
    // Stack navigator'un header config'ini alıp title'ını kontrol edelim
    const headerConfig = UNSAFE_getAllByType('RNSScreenStackHeaderConfig')[0];
    expect(headerConfig.props.title).toBe('Ana Sayfa');
  });
}); 