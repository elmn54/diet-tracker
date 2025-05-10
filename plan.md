# Kalori Takip Uygulaması Revize Kodlama Planı

## 1. Test Altyapısı ve Temel Kurulum (Hafta 1)

### 1.1 Test Altyapısı Kurulumu
```bash
# Jest ve React Native Testing Library kurulumu
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native jest-expo
npm install --save-dev @babel/preset-typescript @types/jest

# Jest konfigürasyonu
npx ts-jest config:init
```

Jest yapılandırması (jest.config.js):
```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|react-clone-referenced-element|@react-native-community|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|@sentry/.*)'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts'
  ]
};
```

### 1.2 Temel Proje Yapılandırması

### 1.3 Temel Navigasyon

#### Test Önce (TDD):
```tsx
// __tests__/navigation/AppNavigator.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from '../../src/navigation/AppNavigator';

describe('AppNavigator', () => {
  it('renders the home screen by default', () => {
    const { getByText } = render(
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    );
    
    // Ana ekran başlığının görünüp görünmediğini kontrol et
    expect(getByText('Ana Sayfa')).toBeTruthy();
  });
});
```

#### Uygulama:
```bash
# Temel navigasyon paketleri
npm install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
```

AppNavigator.tsx'i test gereksinimlerini karşılayacak şekilde oluştur.

**ÖNEMLİ**: Testleri çalıştırarak navigasyonun beklenen şekilde çalıştığını doğrulayın.

### 1.4 Veri Depolama Mekanizması

#### Test Önce (TDD):
```tsx
// __tests__/storage/storageUtils.test.ts
import { storage, setItem, getItem, removeItem } from '../../src/storage/mmkvStorage';

// MMKV'yi mock'lamak için
jest.mock('react-native-mmkv', () => {
  const mockStorage = {
    set: jest.fn(),
    getString: jest.fn(),
    delete: jest.fn(),
  };
  return { MMKV: jest.fn(() => mockStorage) };
});

describe('Storage utils', () => {
  const mockMMKV = storage as jest.Mocked<any>;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should set a string item', () => {
    setItem('testKey', 'testValue');
    expect(mockMMKV.set).toHaveBeenCalledWith('testKey', JSON.stringify('testValue'));
  });
  
  it('should get an item', () => {
    mockMMKV.getString.mockReturnValueOnce(JSON.stringify('testValue'));
    const result = getItem('testKey');
    expect(result).toBe('testValue');
    expect(mockMMKV.getString).toHaveBeenCalledWith('testKey');
  });
  
  it('should return default value when item not found', () => {
    mockMMKV.getString.mockReturnValueOnce(undefined);
    const result = getItem('nonExistentKey', 'defaultValue');
    expect(result).toBe('defaultValue');
  });
  
  it('should remove an item', () => {
    removeItem('testKey');
    expect(mockMMKV.delete).toHaveBeenCalledWith('testKey');
  });
});
```

#### Uygulama:
```bash
# MMKV kurulumu
npx expo install react-native-mmkv
```

Testleri geçecek şekilde mmkvStorage.ts dosyasını oluşturun.

### 1.5 Klasör Yapısı
```
src/
├── api/              # API entegrasyonları
│   └── client.ts     # Axios yapılandırması
├── components/       # Ortak kullanılan bileşenler
├── screens/          # Uygulama ekranları
├── navigation/       # Navigasyon yapılandırması
│   ├── AppNavigator.tsx
│   └── AuthNavigator.tsx
├── storage/          # Veri depolama işlemleri
│   └── mmkvStorage.ts
├── hooks/            # Özel hook'lar
├── utils/            # Yardımcı fonksiyonlar
├── types/            # TypeScript tip tanımlamaları
├── context/          # Context API ile durum yönetimi
└── constants/        # Sabitler ve tema
__tests__/            # Test dosyaları (src yapısını yansıtır)
```

### 1.6 Durum Yönetimi

#### Test Önce (TDD):
```tsx
// __tests__/store/foodStore.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useFoodStore } from '../../src/store/foodStore';

describe('Food Store', () => {
  beforeEach(() => {
    // Store'u sıfırla
    const { result } = renderHook(() => useFoodStore());
    act(() => {
      result.current.reset();
    });
  });
  
  it('should add a food item', () => {
    const { result } = renderHook(() => useFoodStore());
    const foodItem = { 
      id: '1', 
      name: 'Elma', 
      calories: 95, 
      protein: 0.5, 
      carbs: 25, 
      fat: 0.3, 
      date: new Date().toISOString() 
    };
    
    act(() => {
      result.current.addFood(foodItem);
    });
    
    expect(result.current.foods.length).toBe(1);
    expect(result.current.foods[0]).toEqual(foodItem);
  });
  
  it('should remove a food item', () => {
    const { result } = renderHook(() => useFoodStore());
    const foodItem = { 
      id: '1', 
      name: 'Elma', 
      calories: 95, 
      date: new Date().toISOString() 
    };
    
    act(() => {
      result.current.addFood(foodItem);
    });
    
    expect(result.current.foods.length).toBe(1);
    
    act(() => {
      result.current.removeFood('1');
    });
    
    expect(result.current.foods.length).toBe(0);
  });
});
```

#### Uygulama:
```bash
# Zustand kurulumu
npm install zustand
```

Testleri geçecek şekilde foodStore.ts dosyasını oluşturun.

## 2. UI Bileşenleri ve Veri Gösterimi (Hafta 2)

### 2.1 UI Bileşenlerinin Testleri

```tsx
// __tests__/components/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../../src/components/Button';

describe('Button Component', () => {
  it('renders correctly', () => {
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
});

// Diğer UI bileşenleri için benzer testler (Input, Card, FoodItem, vb.)
```

### 2.2 UI Kütüphanesi Entegrasyonu

```bash
# UI kütüphanesi kurulumu
npx expo install react-native-paper react-native-vector-icons react-native-safe-area-context
```

Testleri geçecek şekilde UI bileşenlerini oluşturun.

### 2.3 Tab Navigasyonu Testi

```tsx
// __tests__/navigation/TabNavigator.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from '../../src/navigation/TabNavigator';

describe('TabNavigator', () => {
  it('renders tab screens correctly', () => {
    const { getByText } = render(
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    );
    
    expect(getByText('Ana Sayfa')).toBeTruthy();
    
    // Tab'lar arası geçiş testi
    fireEvent.press(getByText('Yemek Ekle'));
    expect(getByText('Yemek Ekle Ekranı')).toBeTruthy();
  });
});
```

### 2.4 Tab Navigasyonu Uygulaması

```bash
# Tab navigasyonu kurulumu
npm install @react-navigation/bottom-tabs
```

Testleri geçecek şekilde tab navigasyonunu oluşturun.

## 3. Form İşlemleri ve Doğrulama (Hafta 3)

### 3.1 Form Doğrulama Testleri

```tsx
// __tests__/screens/RegisterScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RegisterScreen from '../../src/screens/RegisterScreen';

describe('RegisterScreen', () => {
  it('validates required fields', async () => {
    const { getByText, findByText } = render(<RegisterScreen />);
    
    fireEvent.press(getByText('Kayıt Ol'));
    
    expect(await findByText('E-posta adresi gereklidir')).toBeTruthy();
    expect(await findByText('Şifre gereklidir')).toBeTruthy();
  });
  
  it('validates email format', async () => {
    const { getByPlaceholderText, getByText, findByText } = render(<RegisterScreen />);
    
    fireEvent.changeText(getByPlaceholderText('E-posta'), 'invalid-email');
    fireEvent.press(getByText('Kayıt Ol'));
    
    expect(await findByText('Geçerli bir e-posta adresi girin')).toBeTruthy();
  });
  
  it('validates password length', async () => {
    const { getByPlaceholderText, getByText, findByText } = render(<RegisterScreen />);
    
    fireEvent.changeText(getByPlaceholderText('E-posta'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Şifre'), '123');
    fireEvent.press(getByText('Kayıt Ol'));
    
    expect(await findByText('Şifre en az 6 karakter olmalıdır')).toBeTruthy();
  });
});
```

### 3.2 Form Yönetimi Uygulaması

```bash
# Form yönetimi için
npm install react-hook-form zod @hookform/resolvers
```

Testleri geçecek şekilde form doğrulama mantığını implemente edin.

## 4. Yemek İşlemleri (Hafta 4)

### 4.1 Yemek Ekleme Testi

```tsx
// __tests__/screens/AddFoodScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddFoodScreen from '../../src/screens/AddFoodScreen';
import { useFoodStore } from '../../src/store/foodStore';

// Store'u mock et
jest.mock('../../src/store/foodStore');

describe('AddFoodScreen', () => {
  const mockAddFood = jest.fn();
  
  beforeEach(() => {
    // Mock store'u hazırla
    (useFoodStore as jest.Mock).mockReturnValue({
      addFood: mockAddFood
    });
  });
  
  it('adds a food item when form is valid', async () => {
    const { getByPlaceholderText, getByText } = render(<AddFoodScreen />);
    
    fireEvent.changeText(getByPlaceholderText('Yemek Adı'), 'Elma');
    fireEvent.changeText(getByPlaceholderText('Kalori'), '95');
    fireEvent.changeText(getByPlaceholderText('Protein (g)'), '0.5');
    fireEvent.changeText(getByPlaceholderText('Karbonhidrat (g)'), '25');
    fireEvent.changeText(getByPlaceholderText('Yağ (g)'), '0.3');
    fireEvent.press(getByText('Ekle'));
    
    await waitFor(() => {
      expect(mockAddFood).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Elma',
        calories: 95,
        protein: 0.5,
        carbs: 25,
        fat: 0.3
      }));
    });
  });
  
  it('validates required fields', async () => {
    const { getByText, findByText } = render(<AddFoodScreen />);
    
    fireEvent.press(getByText('Ekle'));
    
    expect(await findByText('Yemek adı gereklidir')).toBeTruthy();
    expect(await findByText('Kalori değeri gereklidir')).toBeTruthy();
  });
});
```

### 4.2 Yemek Listesini Görüntüleme Testi

```tsx
// __tests__/screens/HomeScreen.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import HomeScreen from '../../src/screens/HomeScreen';
import { useFoodStore } from '../../src/store/foodStore';

// Store'u mock et
jest.mock('../../src/store/foodStore');

describe('HomeScreen', () => {
  beforeEach(() => {
    // Mock store'u hazırla
    (useFoodStore as jest.Mock).mockReturnValue({
      foods: [
        { id: '1', name: 'Elma', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, date: new Date().toISOString() },
        { id: '2', name: 'Yoğurt', calories: 150, protein: 5, carbs: 12, fat: 8, date: new Date().toISOString() }
      ],
      dailyCalories: 245,
      dailyNutrients: { protein: 5.5, carbs: 37, fat: 8.3 }
    });
  });
  
  it('displays food items', () => {
    const { getByText } = render(<HomeScreen />);
    
    expect(getByText('Elma')).toBeTruthy();
    expect(getByText('Yoğurt')).toBeTruthy();
  });
  
  it('displays daily summary', () => {
    const { getByText } = render(<HomeScreen />);
    
    expect(getByText('245 Kalori')).toBeTruthy();
    expect(getByText('5.5g Protein')).toBeTruthy();
    expect(getByText('37g Karbonhidrat')).toBeTruthy();
    expect(getByText('8.3g Yağ')).toBeTruthy();
  });
});
```

### 4.3 Kodlama ve Uygulama
Testleri geçecek şekilde yemek işlemleri ekranlarını kodlayın.

## 5. Grafikler ve İstatistikler (Hafta 5)

### 5.1 Grafik Bileşenleri Testi

```tsx
// __tests__/components/NutritionChart.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import NutritionChart from '../../src/components/NutritionChart';

// Victory Native'i mock et
jest.mock('victory-native', () => {
  const React = require('react');
  const mockVictoryPie = ({ data }) => React.createElement('View', { testID: 'mock-victory-pie', data: JSON.stringify(data) });
  return { VictoryPie: mockVictoryPie };
});

describe('NutritionChart', () => {
  it('renders correctly with data', () => {
    const data = {
      protein: 10,
      carbs: 50,
      fat: 15
    };
    
    const { getByTestId } = render(<NutritionChart data={data} />);
    const chart = getByTestId('mock-victory-pie');
    
    // Chart'a doğru verilerin aktarıldığını kontrol et
    const chartData = JSON.parse(chart.props.data);
    expect(chartData).toHaveLength(3);
    
    const dataValues = chartData.map(item => item.y);
    expect(dataValues).toContain(10);
    expect(dataValues).toContain(50);
    expect(dataValues).toContain(15);
  });
});
```

### 5.2 Grafik Kütüphanesi Entegrasyonu

```bash
# Victory Native - Grafik kütüphanesi
npm install victory-native
```

Testleri geçecek şekilde grafik bileşenlerini kodlayın.

## 6. Medya İşlemleri (Hafta 6)

### 6.1 Görüntü Seçici Testi

```tsx
// __tests__/components/ImagePicker.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ImagePicker from '../../src/components/ImagePicker';
import * as ExpoImagePicker from 'expo-image-picker';

// Expo Image Picker'ı mock et
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images'
  }
}));

describe('ImagePicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // İzin isteme fonksiyonunu mock et
    (ExpoImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted'
    });
    
    // Görüntü seçme fonksiyonunu mock et
    (ExpoImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'test-uri.jpg' }]
    });
  });
  
  it('opens gallery and selects an image', async () => {
    const onImageSelectedMock = jest.fn();
    const { getByText } = render(<ImagePicker onImageSelected={onImageSelectedMock} />);
    
    fireEvent.press(getByText('Galeriden Seç'));
    
    // Async işlemin tamamlanmasını bekle
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(ExpoImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
    expect(ExpoImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
    expect(onImageSelectedMock).toHaveBeenCalledWith('test-uri.jpg');
  });
});
```

### 6.2 Görüntü İşlemleri Entegrasyonu

```bash
# Görüntü işlemleri
npx expo install expo-image-picker expo-file-system expo-image-manipulator
```

Testleri geçecek şekilde görüntü seçici bileşenini kodlayın.

## 7. Fotoğraf ile Besin Değerlerini Tespit Etme (Hafta 4-5)

### 7.1 Kamera ve Fotoğraf Kütüphanesi Entegrasyonu

#### Gerekli Paketler
```bash
# Kamera ve fotoğraf kütüphaneleri
npm install expo-camera expo-image-picker expo-media-library
# Resim manipülasyonu
npm install expo-image-manipulator
```

#### Kamera İzinleri ve Test
```tsx
// __tests__/services/cameraService.test.ts
import { getCameraPermission, getMediaLibraryPermission } from '../../src/services/cameraService';
import * as Camera from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

// Mock izinler
jest.mock('expo-camera');
jest.mock('expo-media-library');

describe('Camera Service', () => {
  it('should request camera permission', async () => {
    (Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted'
    });
    
    const result = await getCameraPermission();
    expect(result).toBe(true);
    expect(Camera.requestCameraPermissionsAsync).toHaveBeenCalled();
  });
  
  it('should request media library permission', async () => {
    (MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted'
    });
    
    const result = await getMediaLibraryPermission();
    expect(result).toBe(true);
    expect(MediaLibrary.requestPermissionsAsync).toHaveBeenCalled();
  });
});
```

### 7.2 Yemek Tanıma AI API Entegrasyonu

#### API Bağlantı Testi
```tsx
// __tests__/services/foodRecognitionService.test.ts
import { identifyFood, FoodRecognitionResult } from '../../src/services/foodRecognitionService';
import { AI_PROVIDERS } from '../../src/constants/aiProviders';

// Mock API yanıtları
jest.mock('../../src/api/client', () => ({
  post: jest.fn().mockImplementation((url) => {
    if (url.includes('openai')) {
      return Promise.resolve({
        data: {
          foodName: 'Elma',
          nutritionFacts: {
            calories: 95,
            protein: 0.5,
            carbs: 25,
            fat: 0.3
          }
        }
      });
    }
    return Promise.resolve({ data: {} });
  })
}));

describe('Food Recognition Service', () => {
  it('should identify food using OpenAI', async () => {
    const mockImage = { uri: 'file://test.jpg', base64: 'data:image/jpeg;base64,abc123' };
    const apiKey = 'test-api-key';
    
    const result = await identifyFood(mockImage, AI_PROVIDERS.OPENAI, apiKey);
    
    expect(result).toBeDefined();
    expect(result.foodName).toBe('Elma');
    expect(result.nutritionFacts.calories).toBe(95);
    expect(result.nutritionFacts.protein).toBe(0.5);
  });
  
  it('should handle API errors gracefully', async () => {
    const mockImage = { uri: 'file://test.jpg', base64: 'data:image/jpeg;base64,abc123' };
    
    // API Client'ı mock eden fonksiyonu geçici olarak değiştir
    const originalPost = require('../../src/api/client').post;
    require('../../src/api/client').post = jest.fn().mockRejectedValue(new Error('API Error'));
    
    try {
      await identifyFood(mockImage, AI_PROVIDERS.OPENAI, 'invalid-key');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeDefined();
    }
    
    // Mock'u geri al
    require('../../src/api/client').post = originalPost;
  });
});
```

### 7.3 AI Sağlayıcı Yapılandırması

#### AI Sağlayıcı Sabitleri
```tsx
// src/constants/aiProviders.ts
export const AI_PROVIDERS = {
  OPENAI: 'openai',
  GEMINI: 'gemini',
  CLAUDE: 'claude',
};

export const AI_PROVIDER_NAMES = {
  [AI_PROVIDERS.OPENAI]: 'OpenAI',
  [AI_PROVIDERS.GEMINI]: 'Google Gemini',
  [AI_PROVIDERS.CLAUDE]: 'Claude',
};

export const AI_PROVIDER_ENDPOINTS = {
  [AI_PROVIDERS.OPENAI]: 'https://api.openai.com/v1/chat/completions',
  [AI_PROVIDERS.GEMINI]: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent',
  [AI_PROVIDERS.CLAUDE]: 'https://api.anthropic.com/v1/messages',
};

export const AI_PROVIDER_ICONS = {
  [AI_PROVIDERS.OPENAI]: 'brain',
  [AI_PROVIDERS.GEMINI]: 'google',
  [AI_PROVIDERS.CLAUDE]: 'robot',
};
```

### 7.4 API Anahtarı Yönetimi

#### API Anahtarı Store'u
```tsx
// __tests__/store/apiKeyStore.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useApiKeyStore } from '../../src/store/apiKeyStore';
import { AI_PROVIDERS } from '../../src/constants/aiProviders';

describe('API Key Store', () => {
  beforeEach(() => {
    // Store'u sıfırla
    const { result } = renderHook(() => useApiKeyStore());
    act(() => {
      result.current.reset();
    });
  });
  
  it('should save API key', () => {
    const { result } = renderHook(() => useApiKeyStore());
    
    act(() => {
      result.current.setApiKey(AI_PROVIDERS.OPENAI, 'test-api-key');
    });
    
    expect(result.current.apiKeys[AI_PROVIDERS.OPENAI]).toBe('test-api-key');
  });
  
  it('should set preferred provider', () => {
    const { result } = renderHook(() => useApiKeyStore());
    
    act(() => {
      result.current.setPreferredProvider(AI_PROVIDERS.GEMINI);
    });
    
    expect(result.current.preferredProvider).toBe(AI_PROVIDERS.GEMINI);
  });
  
  it('should get API key for preferred provider', () => {
    const { result } = renderHook(() => useApiKeyStore());
    
    act(() => {
      result.current.setApiKey(AI_PROVIDERS.CLAUDE, 'claude-key');
      result.current.setPreferredProvider(AI_PROVIDERS.CLAUDE);
    });
    
    expect(result.current.getActiveApiKey()).toBe('claude-key');
  });
});
```

### 7.5 Fotoğrafla Yemek Ekleme Ekranı

#### Yemek Tanıma Ekranı Testi
```tsx
// __tests__/screens/FoodRecognitionScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import FoodRecognitionScreen from '../../src/screens/FoodRecognitionScreen';

// Mock Navigator
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

// Mock Camera
jest.mock('expo-camera', () => ({
  Camera: () => 'Camera Component',
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
}));

// Mock Services
jest.mock('../../src/services/foodRecognitionService', () => ({
  identifyFood: jest.fn().mockResolvedValue({
    foodName: 'Elma',
    nutritionFacts: {
      calories: 95,
      protein: 0.5,
      carbs: 25,
      fat: 0.3
    }
  }),
}));

describe('Food Recognition Screen', () => {
  it('renders camera interface', () => {
    const { getByTestId } = render(<FoodRecognitionScreen />);
    expect(getByTestId('camera-view')).toBeTruthy();
  });
  
  it('captures image and recognizes food', async () => {
    const { getByTestId } = render(<FoodRecognitionScreen />);
    
    // Fotoğraf çekme butonuna tıkla
    fireEvent.press(getByTestId('capture-button'));
    
    // Yükleme durumunu bekle
    await waitFor(() => {
      expect(getByTestId('recognition-result')).toBeTruthy();
    });
    
    // Sonuçların görüntülendiğini doğrula
    expect(getByTestId('food-name')).toHaveTextContent('Elma');
    expect(getByTestId('calories')).toHaveTextContent('95');
  });
});
```

### 7.6 API Anahtarları Ayarları Ekranı

#### API Anahtarları Ekranı Testi
```tsx
// __tests__/screens/ApiSettingsScreen.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ApiSettingsScreen from '../../src/screens/ApiSettingsScreen';
import { useApiKeyStore } from '../../src/store/apiKeyStore';
import { AI_PROVIDERS } from '../../src/constants/aiProviders';

// Mock API Key Store
jest.mock('../../src/store/apiKeyStore', () => ({
  useApiKeyStore: jest.fn(),
}));

describe('API Settings Screen', () => {
  beforeEach(() => {
    // Store Mock
    const mockStore = {
      apiKeys: {
        [AI_PROVIDERS.OPENAI]: 'test-openai-key',
      },
      preferredProvider: AI_PROVIDERS.OPENAI,
      setApiKey: jest.fn(),
      setPreferredProvider: jest.fn(),
    };
    (useApiKeyStore as jest.Mock).mockReturnValue(mockStore);
  });
  
  it('renders provider selection options', () => {
    const { getByText } = render(<ApiSettingsScreen />);
    
    expect(getByText('OpenAI')).toBeTruthy();
    expect(getByText('Google Gemini')).toBeTruthy();
    expect(getByText('Claude')).toBeTruthy();
  });
  
  it('shows saved API key', () => {
    const { getByTestId } = render(<ApiSettingsScreen />);
    
    expect(getByTestId('api-key-input').props.value).toBe('test-openai-key');
  });
  
  it('allows entering API key', () => {
    const { getByTestId, getByText } = render(<ApiSettingsScreen />);
    
    fireEvent.changeText(getByTestId('api-key-input'), 'new-test-api-key');
    fireEvent.press(getByText('Kaydet'));
    
    const store = useApiKeyStore();
    expect(store.setApiKey).toHaveBeenCalledWith(
      AI_PROVIDERS.OPENAI, 
      'new-test-api-key'
    );
  });
  
  it('changes preferred provider', () => {
    const { getByTestId } = render(<ApiSettingsScreen />);
    
    // Claude'u seç
    fireEvent.press(getByTestId(`provider-${AI_PROVIDERS.CLAUDE}`));
    
    const store = useApiKeyStore();
    expect(store.setPreferredProvider).toHaveBeenCalledWith(AI_PROVIDERS.CLAUDE);
  });
});
```

## 8. Kullanıcı Deneyimini İyileştirme

### 8.1 Kamera Deneyimi Geliştirmeleri

- Fotoğrafı çekmeden önce ön izleme
- Galerideki fotoğrafları seçme seçeneği
- Yakınlaştırma ve odaklama
- Flash kontrolü

### 8.2 AI İşleme ve Düzenleme

- AI'dan gelen sonuçları manuel olarak düzenleme
- Birden çok yemek maddesi tespiti
- Porsiyon boyutu tahmini ve değiştirme
- Besin değerleri geçmişi ve karşılaştırma

### 8.3 Çevrimdışı Çalışma

- Kamerayı kullanma ancak sonuçları daha sonra işleme (ağ bağlantısı olmadığında)
- Yerel makine öğrenmesi seçenekleri (TensorFlow Lite)
- Fotoğraf kuyruğu ve toplu işlem

## 9. Hata Ayıklama ve Test Kapsamı (Hafta 10)

### 9.1 Hata Yakalama ve İşleme

```tsx
// __tests__/utils/errorHandling.test.ts
import { handleApiError, logError } from '../../src/utils/errorHandling';
import * as ErrorLog from 'expo-error-log';

// Error log servisini mock et
jest.mock('expo-error-log', () => ({
  log: jest.fn()
}));

describe('Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('handles API errors correctly', () => {
    const error = {
      response: {
        status: 404,
        data: { message: 'Not found' }
      }
    };
    
    const result = handleApiError(error);
    
    expect(result).toBe('Kaynak bulunamadı: Not found');
    expect(ErrorLog.log).toHaveBeenCalledWith({
      error,
      context: 'API Error'
    });
  });
  
  it('handles generic errors correctly', () => {
    const error = new Error('Something went wrong');
    
    const result = handleApiError(error);
    
    expect(result).toBe('Bir hata oluştu. Lütfen tekrar deneyiniz.');
    expect(ErrorLog.log).toHaveBeenCalledWith({
      error,
      context: 'API Error'
    });
  });
});
```

### 9.2 Test Kapsamı İyileştirmeleri

Daha kapsamlı testler yazarak test kapsamını artırın ve kod kalitesini koruyun.

## 10. Dağıtım ve Son Testler (Hafta 11-12)

### 10.1 E2E Testler

```tsx
// e2e/foodTracking.spec.js
describe('Food Tracking Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should log food successfully', async () => {
    // Ana sayfa açılışını kontrol et
    await expect(element(by.text('Ana Sayfa'))).toBeVisible();
    
    // Yemek ekle ekranına git
    await element(by.text('Yemek Ekle')).tap();
    await expect(element(by.text('Yemek Ekle Ekranı'))).toBeVisible();
    
    // Yemek bilgilerini gir
    await element(by.id('food-name-input')).typeText('Elma');
    await element(by.id('food-calories-input')).typeText('95');
    await element(by.id('food-protein-input')).typeText('0.5');
    await element(by.id('food-carbs-input')).typeText('25');
    await element(by.id('food-fat-input')).typeText('0.3');
    
    // Yemeği ekle
    await element(by.text('Ekle')).tap();
    
    // Ana sayfaya dön ve yemeğin listelendiğini kontrol et
    await element(by.text('Ana Sayfa')).tap();
    await expect(element(by.text('Elma'))).toBeVisible();
    await expect(element(by.text('95 Kalori'))).toBeVisible();
  });
});
```

### 10.2 Derleme ve Dağıtım Testleri

```bash
# EAS CLI kurulumu
npm install -g eas-cli

# İlk derleme testi
eas build:configure
eas build --platform android --profile preview
```

Başarılı derleme ve sürüm kontrolünü doğrulayın.

## 11. Geliştirme ve Proje Yönetimi Kuralları

### 11.1 Git İş Akışı
- Her özellik için ayrı branch kullanın
- Küçük ve açıklayıcı commit mesajları yazın
- Her özellik tamamlandığında pull request oluşturun
- Code review sonrası birleştirin

### 11.2 Kod Kalitesi Kuralları
- ESLint ve Prettier ile kod formatını koruyun
- Her PR'da test kapsamını artırmaya çalışın
- TypeScript strict mode kullanın
- Düzenli refactoring yapın

### 11.3 Dağıtım Stratejisi
- Alpha testi (iç ekip)
- Beta testi (sınırlı kullanıcı grubu)
- Üretim sürümü (tüm kullanıcılar)

## 12. İlave Özellikler ve Ekranlar

### 12.1 Kalori Hedefi Belirleme

#### Kalori Hedefi Store'u
```tsx
// __tests__/store/calorieGoalStore.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useCalorieGoalStore } from '../../src/store/calorieGoalStore';

describe('Calorie Goal Store', () => {
  beforeEach(() => {
    // Store'u sıfırla
    const { result } = renderHook(() => useCalorieGoalStore());
    act(() => {
      result.current.reset();
    });
  });
  
  it('should set calorie goals', () => {
    const { result } = renderHook(() => useCalorieGoalStore());
    
    act(() => {
      result.current.setCalorieGoal(2000);
    });
    
    expect(result.current.calorieGoal).toBe(2000);
  });
  
  it('should set macro nutrient goals', () => {
    const { result } = renderHook(() => useCalorieGoalStore());
    
    act(() => {
      result.current.setNutrientGoals({
        protein: 150,
        carbs: 200,
        fat: 70
      });
    });
    
    expect(result.current.nutrientGoals.protein).toBe(150);
    expect(result.current.nutrientGoals.carbs).toBe(200);
    expect(result.current.nutrientGoals.fat).toBe(70);
  });
  
  it('should calculate remaining calories', () => {
    const { result } = renderHook(() => useCalorieGoalStore());
    
    act(() => {
      result.current.setCalorieGoal(2000);
      result.current.setConsumedCalories(1200);
    });
    
    expect(result.current.remainingCalories).toBe(800);
  });
});
```

#### Kalori Hedefi Ekranı Testi
```tsx
// __tests__/screens/CalorieGoalScreen.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CalorieGoalScreen from '../../src/screens/CalorieGoalScreen';
import { useCalorieGoalStore } from '../../src/store/calorieGoalStore';

// Mock Calorie Goal Store
jest.mock('../../src/store/calorieGoalStore', () => ({
  useCalorieGoalStore: jest.fn(),
}));

describe('Calorie Goal Screen', () => {
  beforeEach(() => {
    // Store Mock
    const mockStore = {
      calorieGoal: 2000,
      nutrientGoals: {
        protein: 150,
        carbs: 200,
        fat: 70
      },
      setCalorieGoal: jest.fn(),
      setNutrientGoals: jest.fn(),
    };
    (useCalorieGoalStore as jest.Mock).mockReturnValue(mockStore);
  });
  
  it('renders current goals correctly', () => {
    const { getByText, getByTestId } = render(<CalorieGoalScreen />);
    
    expect(getByText('2000')).toBeTruthy();
    expect(getByTestId('protein-goal')).toHaveTextContent('150');
    expect(getByTestId('carbs-goal')).toHaveTextContent('200');
    expect(getByTestId('fat-goal')).toHaveTextContent('70');
  });
  
  it('allows updating calorie goal', () => {
    const { getByTestId, getByText } = render(<CalorieGoalScreen />);
    
    fireEvent.changeText(getByTestId('calorie-input'), '2200');
    fireEvent.press(getByText('Kaydet'));
    
    const store = useCalorieGoalStore();
    expect(store.setCalorieGoal).toHaveBeenCalledWith(2200);
  });
  
  it('allows updating macronutrient goals', () => {
    const { getByTestId, getByText } = render(<CalorieGoalScreen />);
    
    fireEvent.changeText(getByTestId('protein-input'), '160');
    fireEvent.changeText(getByTestId('carbs-input'), '220');
    fireEvent.changeText(getByTestId('fat-input'), '60');
    fireEvent.press(getByText('Kaydet'));
    
    const store = useCalorieGoalStore();
    expect(store.setNutrientGoals).toHaveBeenCalledWith({
      protein: 160,
      carbs: 220,
      fat: 60
    });
  });
});
```

### 12.2 API Ayarları Ekranı

#### API Ayarları Ekranı Testi
```tsx
// __tests__/screens/ApiSettingsScreen.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ApiSettingsScreen from '../../src/screens/ApiSettingsScreen';
import { useApiKeyStore } from '../../src/store/apiKeyStore';
import { AI_PROVIDERS } from '../../src/constants/aiProviders';

// Mock API Key Store
jest.mock('../../src/store/apiKeyStore', () => ({
  useApiKeyStore: jest.fn(),
}));

describe('API Settings Screen', () => {
  beforeEach(() => {
    // Store Mock
    const mockStore = {
      apiKeys: {
        [AI_PROVIDERS.OPENAI]: 'test-openai-key',
      },
      preferredProvider: AI_PROVIDERS.OPENAI,
      setApiKey: jest.fn(),
      setPreferredProvider: jest.fn(),
    };
    (useApiKeyStore as jest.Mock).mockReturnValue(mockStore);
  });
  
  it('renders provider selection options', () => {
    const { getByText } = render(<ApiSettingsScreen />);
    
    expect(getByText('OpenAI')).toBeTruthy();
    expect(getByText('Google Gemini')).toBeTruthy();
    expect(getByText('Claude')).toBeTruthy();
  });
  
  it('shows saved API key', () => {
    const { getByTestId } = render(<ApiSettingsScreen />);
    
    expect(getByTestId('api-key-input').props.value).toBe('test-openai-key');
  });
  
  it('allows entering API key', () => {
    const { getByTestId, getByText } = render(<ApiSettingsScreen />);
    
    fireEvent.changeText(getByTestId('api-key-input'), 'new-test-api-key');
    fireEvent.press(getByText('Kaydet'));
    
    const store = useApiKeyStore();
    expect(store.setApiKey).toHaveBeenCalledWith(
      AI_PROVIDERS.OPENAI, 
      'new-test-api-key'
    );
  });
  
  it('changes preferred provider', () => {
    const { getByTestId } = render(<ApiSettingsScreen />);
    
    // Claude'u seç
    fireEvent.press(getByTestId(`provider-${AI_PROVIDERS.CLAUDE}`));
    
    const store = useApiKeyStore();
    expect(store.setPreferredProvider).toHaveBeenCalledWith(AI_PROVIDERS.CLAUDE);
  });
});
```

### 12.3 Ödeme Planları Sayfası

#### Ödeme Planları Mağazası
```tsx
// __tests__/store/subscriptionStore.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useSubscriptionStore } from '../../src/store/subscriptionStore';

describe('Subscription Store', () => {
  beforeEach(() => {
    // Store'u sıfırla
    const { result } = renderHook(() => useSubscriptionStore());
    act(() => {
      result.current.reset();
    });
  });
  
  it('should have default subscription plans', () => {
    const { result } = renderHook(() => useSubscriptionStore());
    
    expect(result.current.plans.length).toBeGreaterThan(0);
    expect(result.current.plans[0].name).toBeTruthy();
    expect(result.current.plans[0].price).toBeDefined();
  });
  
  it('should select a subscription plan', () => {
    const { result } = renderHook(() => useSubscriptionStore());
    const planId = result.current.plans[1].id;
    
    act(() => {
      result.current.selectPlan(planId);
    });
    
    expect(result.current.selectedPlan).toBe(planId);
  });
  
  it('should check if user is subscribed', () => {
    const { result } = renderHook(() => useSubscriptionStore());
    
    // Başlangıçta abone değil
    expect(result.current.isSubscribed).toBe(false);
    
    // Abonelik başlat
    act(() => {
      result.current.setSubscribed(true);
    });
    
    // Artık abone
    expect(result.current.isSubscribed).toBe(true);
  });
});
```

#### Ödeme Planları Ekranı Testi
```tsx
// __tests__/screens/PricingScreen.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PricingScreen from '../../src/screens/PricingScreen';
import { useSubscriptionStore } from '../../src/store/subscriptionStore';

// Mock Subscription Store
jest.mock('../../src/store/subscriptionStore', () => ({
  useSubscriptionStore: jest.fn(),
}));

describe('Pricing Screen', () => {
  beforeEach(() => {
    // Store Mock
    const mockStore = {
      plans: [
        { id: 'free', name: 'Ücretsiz', price: 0, features: ['Günlük kalori takibi', 'Temel besin değerleri'] },
        { id: 'premium', name: 'Premium', price: 9.99, features: ['Sınırsız yemek tanıma', 'Detaylı analizler'] },
        { id: 'pro', name: 'Profesyonel', price: 19.99, features: ['Kişisel beslenme tavsiyeleri', 'Öncelikli destek'] }
      ],
      selectedPlan: 'free',
      selectPlan: jest.fn(),
      isSubscribed: false,
      subscribe: jest.fn(),
    };
    (useSubscriptionStore as jest.Mock).mockReturnValue(mockStore);
  });
  
  it('renders subscription plans', () => {
    const { getByText } = render(<PricingScreen />);
    
    expect(getByText('Ücretsiz')).toBeTruthy();
    expect(getByText('Premium')).toBeTruthy();
    expect(getByText('Profesyonel')).toBeTruthy();
  });
  
  it('displays plan prices correctly', () => {
    const { getByText } = render(<PricingScreen />);
    
    expect(getByText('0 TL')).toBeTruthy();
    expect(getByText('9.99 TL')).toBeTruthy();
    expect(getByText('19.99 TL')).toBeTruthy();
  });
  
  it('allows selecting a plan', () => {
    const { getByTestId } = render(<PricingScreen />);
    
    fireEvent.press(getByTestId('plan-premium'));
    
    const store = useSubscriptionStore();
    expect(store.selectPlan).toHaveBeenCalledWith('premium');
  });
  
  it('shows subscribe button', () => {
    const { getByText } = render(<PricingScreen />);
    
    expect(getByText('Abone Ol')).toBeTruthy();
  });
  
  it('initiates subscription when button is pressed', () => {
    const { getByText } = render(<PricingScreen />);
    
    fireEvent.press(getByText('Abone Ol'));
    
    const store = useSubscriptionStore();
    expect(store.subscribe).toHaveBeenCalled();
  });
});
```

### 12.4 API İstek İşleme Geliştirmeleri

#### API İstek Hata Yönetimi
```tsx
// src/api/errorHandler.ts
export interface ApiError {
  code: string;
  message: string;
  isRetryable: boolean;
}

export const parseApiError = (error: any): ApiError => {
  // API'ye özgü hata yanıtlarını işleme
  if (error.response) {
    const { status, data } = error.response;
    
    // Yaygın HTTP durum kodlarını işleme
    switch (status) {
      case 400:
        return {
          code: 'BAD_REQUEST',
          message: 'Geçersiz istek. Lütfen girdiğiniz bilgileri kontrol edin.',
          isRetryable: false
        };
      case 401:
        return {
          code: 'UNAUTHORIZED',
          message: 'API anahtarı geçersiz veya süresi dolmuş.',
          isRetryable: false
        };
      case 403:
        return {
          code: 'FORBIDDEN',
          message: 'Bu işlemi gerçekleştirme izniniz yok.',
          isRetryable: false
        };
      case 404:
        return {
          code: 'NOT_FOUND',
          message: 'İstenen kaynak bulunamadı.',
          isRetryable: false
        };
      case 429:
        return {
          code: 'RATE_LIMITED',
          message: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.',
          isRetryable: true
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          code: 'SERVER_ERROR',
          message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
          isRetryable: true
        };
    }
    
    // API'ye özgü hata mesajlarını işleme
    if (data && data.error) {
      return {
        code: data.error.type || 'API_ERROR',
        message: data.error.message || 'Bir API hatası oluştu.',
        isRetryable: status >= 500 // 5xx hatalarında yeniden deneme
      };
    }
  }
  
  // Ağ hatalarını işleme
  if (error.request) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Sunucuyla bağlantı kurulamadı. İnternet bağlantınızı kontrol edin.',
      isRetryable: true
    };
  }
  
  // Diğer hatalar
  return {
    code: 'UNKNOWN_ERROR',
    message: error.message || 'Bilinmeyen bir hata oluştu.',
    isRetryable: false
  };
};

export const formatUserFriendlyError = (apiError: ApiError): string => {
  // API hata mesajını kullanıcı dostu bir mesaja dönüştür
  return apiError.message;
};
```

#### API Retry Mekanizması
```tsx
// src/api/retryClient.ts
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { parseApiError } from './errorHandler';

interface RetryConfig extends AxiosRequestConfig {
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Yeniden deneme mekanizmasına sahip HTTP istemcisi
 */
export const createRetryClient = (baseConfig: RetryConfig = {}) => {
  const client = axios.create(baseConfig);
  
  // Varsayılan yeniden deneme yapılandırması
  const defaultRetryConfig = {
    maxRetries: 3,
    retryDelay: 1000,
  };
  
  // İsteği yeniden deneme
  const retryRequest = async (
    config: RetryConfig,
    error: AxiosError,
    retryCount: number
  ): Promise<AxiosResponse> => {
    const maxRetries = config.maxRetries || defaultRetryConfig.maxRetries;
    const retryDelay = config.retryDelay || defaultRetryConfig.retryDelay;
    
    // Maksimum yeniden deneme sayısını aşıldıysa hata fırlat
    if (retryCount >= maxRetries) {
      throw error;
    }
    
    // Hatanın yeniden denenebilir olup olmadığını kontrol et
    const apiError = parseApiError(error);
    if (!apiError.isRetryable) {
      throw error;
    }
    
    // Yeniden denemeden önce bekle (artan gecikme)
    const delay = retryDelay * Math.pow(2, retryCount);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // İsteği yeniden dene
    try {
      return await client(config);
    } catch (retryError) {
      return retryRequest(config, retryError as AxiosError, retryCount + 1);
    }
  };
  
  // Hata yakalayıcı ara yazılım
  client.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
      const config = error.config as RetryConfig;
      
      // Yeniden deneme yapılandırması yoksa hata fırlat
      if (!config) {
        throw error;
      }
      
      return retryRequest(config, error, 0);
    }
  );
  
  return client;
};

export default createRetryClient();
```

### 12.5 Uygulama ve Kodlama

1. calorieGoalStore.ts oluştur
2. ApiSettingsScreen.tsx oluştur
3. PricingScreen.tsx oluştur
4. CalorieGoalScreen.tsx oluştur
5. API hata işleme ve yeniden deneme mekanizmasını ekle
6. Testleri çalıştır ve hataları düzelt 