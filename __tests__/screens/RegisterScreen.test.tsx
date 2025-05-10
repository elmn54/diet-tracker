import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RegisterScreen from '../../src/screens/RegisterScreen';

// Navigation'ı mock'luyoruz
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
});

describe('RegisterScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<RegisterScreen />);
    
    // Form elemanlarının olup olmadığını kontrol ediyoruz
    expect(getByText('Hesap Oluştur')).toBeTruthy();
    expect(getByPlaceholderText('E-posta')).toBeTruthy();
    expect(getByPlaceholderText('Şifre')).toBeTruthy();
    expect(getByPlaceholderText('Şifreyi Onayla')).toBeTruthy();
    expect(getByText('Kayıt Ol')).toBeTruthy();
  });

  it('validates required fields', async () => {
    const { getByText, findByText } = render(<RegisterScreen />);
    
    // Kayıt ol butonuna basıyoruz form boşken
    fireEvent.press(getByText('Kayıt Ol'));
    
    // Hata mesajlarını kontrol ediyoruz
    expect(await findByText('E-posta adresi gereklidir')).toBeTruthy();
    expect(await findByText('Şifre gereklidir')).toBeTruthy();
  });

  it('validates email format', async () => {
    const { getByPlaceholderText, getByText, findByText } = render(<RegisterScreen />);
    
    // Geçersiz bir email giriyoruz
    fireEvent.changeText(getByPlaceholderText('E-posta'), 'invalid-email');
    // Şifre alanını dolduruyoruz
    fireEvent.changeText(getByPlaceholderText('Şifre'), 'Password123');
    fireEvent.changeText(getByPlaceholderText('Şifreyi Onayla'), 'Password123');
    // Kayıt butonuna basıyoruz
    fireEvent.press(getByText('Kayıt Ol'));
    
    // Email formatı hatası bekliyoruz
    expect(await findByText('Geçerli bir e-posta adresi girin')).toBeTruthy();
  });

  it('validates password length', async () => {
    const { getByPlaceholderText, getByText, findByText } = render(<RegisterScreen />);
    
    // Geçerli bir email giriyoruz
    fireEvent.changeText(getByPlaceholderText('E-posta'), 'test@example.com');
    // Çok kısa bir şifre giriyoruz
    fireEvent.changeText(getByPlaceholderText('Şifre'), '123');
    fireEvent.changeText(getByPlaceholderText('Şifreyi Onayla'), '123');
    // Kayıt butonuna basıyoruz
    fireEvent.press(getByText('Kayıt Ol'));
    
    // Şifre uzunluğu hatası bekliyoruz
    expect(await findByText('Şifre en az 6 karakter olmalıdır')).toBeTruthy();
  });

  it('validates password confirmation', async () => {
    const { getByPlaceholderText, getByText, findByText } = render(<RegisterScreen />);
    
    // Geçerli bir email giriyoruz
    fireEvent.changeText(getByPlaceholderText('E-posta'), 'test@example.com');
    // Farklı şifreler giriyoruz
    fireEvent.changeText(getByPlaceholderText('Şifre'), 'Password123');
    fireEvent.changeText(getByPlaceholderText('Şifreyi Onayla'), 'DifferentPassword');
    // Kayıt butonuna basıyoruz
    fireEvent.press(getByText('Kayıt Ol'));
    
    // Şifre eşleşmeme hatası bekliyoruz
    expect(await findByText('Şifreler eşleşmiyor')).toBeTruthy();
  });

  it('navigates to login screen when "Giriş Yap" is pressed', () => {
    const { getByText } = render(<RegisterScreen />);
    
    // Giriş yap linkine basıyoruz
    fireEvent.press(getByText('Giriş Yap'));
    
    // Login ekranına yönlendirilmesini bekliyoruz
    expect(mockNavigate).toHaveBeenCalledWith('Login');
  });
}); 