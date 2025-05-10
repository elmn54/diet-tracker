import { DefaultTheme, MD3DarkTheme } from 'react-native-paper';

// Metrik değerleri (her iki tema için ortak)
export const metrics = {
  baseSpacing: 8,
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    pill: 24,
  },
  icons: {
    tiny: 16,
    small: 20,
    medium: 24,
    large: 30,
    xl: 40,
  },
  images: {
    small: 20,
    medium: 40,
    large: 60,
    logo: 120,
  },
  shadow: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 4,
    },
  }
};

// Açık mod renk paleti
export const lightColors = {
  // Ana renkler
  primary: '#6979F8',       // Modern mor-mavi
  primaryLight: '#A5AFFB',
  primaryDark: '#4C5AE6',
  secondary: '#FFA26B',     // Yumuşak turuncu aksan
  
  // Arkaplan ve yüzey renkleri
  background: '#F7F9FC',
  surface: '#FFFFFF',
  surfaceVariant: '#F0F3F9', // Kart arka planları için
  
  // Metin renkleri
  text: '#2E3E5C',
  textLight: '#8798AD',
  
  // Durum renkleri
  error: '#FF647C',
  warning: '#FFCF5C',
  success: '#00C48C',
  disabled: '#DADEE6',
  
  // UI elemanları
  placeholder: '#A7B0C0',
  divider: '#E9EDF5',
  
  // Besin değerleri renkleri
  protein: '#6979F8', // Mor-mavi
  carbs: '#FFCF5C',   // Sarı
  fat: '#FF647C',     // Kırmızı-pembe
  
  // Öğün tipleri için renkler
  breakfast: '#00C48C', // Yeşil
  lunch: '#FFCF5C',     // Sarı
  dinner: '#FFA26B',    // Turuncu
  snack: '#A5AFFB',     // Açık mor
};

// Koyu mod renk paleti
export const darkColors = {
  // Ana renkler
  primary: '#7C8BFF',       // Daha parlak mor-mavi
  primaryLight: '#A5AFFB',
  primaryDark: '#4C5AE6',
  secondary: '#FFB587',     // Daha parlak turuncu
  
  // Arkaplan ve yüzey renkleri
  background: '#121822',
  surface: '#1E2633',
  surfaceVariant: '#2A3341', // Kart arka planları için
  
  // Metin renkleri
  text: '#F0F2F5',
  textLight: '#C2CCDE',
  
  // Durum renkleri
  error: '#FF7A8F',
  warning: '#FFD97A',
  success: '#33D6A8',
  disabled: '#4E5969',
  
  // UI elemanları
  placeholder: '#8294AB',
  divider: '#2A3341',
  
  // Besin değerleri renkleri
  protein: '#7C8BFF', // Daha parlak mor-mavi
  carbs: '#FFD97A',   // Daha parlak sarı
  fat: '#FF7A8F',     // Daha parlak kırmızı-pembe
  
  // Öğün tipleri için renkler
  breakfast: '#33D6A8', // Daha parlak yeşil
  lunch: '#FFD97A',     // Daha parlak sarı
  dinner: '#FFB587',    // Daha parlak turuncu
  snack: '#B5BFFF',     // Daha parlak açık mor
};

// Tipografi (her iki tema için ortak)
export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    light: 'System',
    thin: 'System',
  },
  fontSize: {
    tiny: 10,
    small: 12,
    medium: 14,
    large: 16,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    display: 36,
  },
  lineHeight: {
    small: 20,
    medium: 25,
    large: 30,
  },
};

// Ekran kenar boşlukları (her iki tema için ortak)
export const spacing = {
  xs: metrics.baseSpacing / 2, // 4
  s: metrics.baseSpacing,      // 8
  m: metrics.baseSpacing * 2,  // 16
  l: metrics.baseSpacing * 3,  // 24
  xl: metrics.baseSpacing * 4, // 32
  xxl: metrics.baseSpacing * 5, // 40
};

// Varsayılan olarak açık tema aktif
export let colors = lightColors;

// Açık tema yapılandırması
export const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: lightColors.primary,
    accent: lightColors.secondary,
    background: lightColors.background,
    surface: lightColors.surface,
    text: lightColors.text,
    error: lightColors.error,
    disabled: lightColors.disabled,
    placeholder: lightColors.placeholder,
    backdrop: 'rgba(0, 0, 0, 0.3)',
  },
  fonts: DefaultTheme.fonts,
  animation: {
    scale: 1.0,
  },
  roundness: metrics.borderRadius.medium,
};

// Koyu tema yapılandırması
export const DarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkColors.primary,
    accent: darkColors.secondary,
    background: darkColors.background,
    surface: darkColors.surface,
    text: darkColors.text,
    error: darkColors.error,
    disabled: darkColors.disabled,
    placeholder: darkColors.placeholder,
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  fonts: MD3DarkTheme.fonts,
  animation: {
    scale: 1.0,
  },
  roundness: metrics.borderRadius.medium,
};

// Varsayılan tema (açık mod)
export const theme = LightTheme;

// Farklı varyant için düğmeler (açık tema)
export const lightButtonVariants = {
  primary: {
    backgroundColor: lightColors.primary,
    textColor: lightColors.surface,
    borderColor: lightColors.primary,
    borderWidth: 0,
  },
  secondary: {
    backgroundColor: lightColors.secondary,
    textColor: lightColors.surface,
    borderColor: lightColors.secondary,
    borderWidth: 0,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: lightColors.primary,
    borderWidth: 1,
    textColor: lightColors.primary,
  },
  transparent: {
    backgroundColor: 'transparent',
    textColor: lightColors.primary,
    borderColor: 'transparent',
    borderWidth: 0,
  },
  success: {
    backgroundColor: lightColors.success,
    textColor: lightColors.surface,
    borderColor: lightColors.success,
    borderWidth: 0,
  },
};

// Farklı varyant için düğmeler (koyu tema)
export const darkButtonVariants = {
  primary: {
    backgroundColor: darkColors.primary,
    textColor: '#1E2633', // Koyu arka plan üzerinde koyu metin
    borderColor: darkColors.primary,
    borderWidth: 0,
  },
  secondary: {
    backgroundColor: darkColors.secondary,
    textColor: '#1E2633', // Koyu arka plan üzerinde koyu metin
    borderColor: darkColors.secondary,
    borderWidth: 0,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: darkColors.primary,
    borderWidth: 1,
    textColor: darkColors.primary,
  },
  transparent: {
    backgroundColor: 'transparent',
    textColor: darkColors.primary,
    borderColor: 'transparent',
    borderWidth: 0,
  },
  success: {
    backgroundColor: darkColors.success,
    textColor: '#1E2633', // Koyu arka plan üzerinde koyu metin
    borderColor: darkColors.success,
    borderWidth: 0,
  },
};

// Varsayılan düğme varyantları (açık tema)
export let buttonVariants = lightButtonVariants;

// Tema değiştirme fonksiyonu
export const toggleTheme = (isDark: boolean) => {
  colors = isDark ? darkColors : lightColors;
  buttonVariants = isDark ? darkButtonVariants : lightButtonVariants;
  
  // Temayı değiştirdikten sonra uygulama içindeki diğer renkleri güncelle
  const updatedTheme = isDark ? {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: darkColors.background,
      surface: darkColors.surface,
      text: darkColors.text,
      primary: darkColors.primary,
      accent: darkColors.secondary
    }
  } : {
    ...LightTheme,
    colors: {
      ...LightTheme.colors,
      background: lightColors.background,
      surface: lightColors.surface,
      text: lightColors.text,
      primary: lightColors.primary,
      accent: lightColors.secondary
    }
  };
  
  return updatedTheme;
};

export default {
  colors,
  metrics,
  typography,
  theme,
  spacing,
  buttonVariants,
  toggleTheme,
  lightColors,
  darkColors,
}; 