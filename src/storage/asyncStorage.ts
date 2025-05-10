import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Veriyi AsyncStorage'da saklar
 * @param key Depolanacak verinin anahtarı
 * @param value Depolanacak değer (herhangi bir JavaScript değeri olabilir)
 */
export const setItem = async (key: string, value: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('AsyncStorage setItem error:', error);
  }
};

/**
 * AsyncStorage'dan veri alır
 * @param key Alınacak verinin anahtarı
 * @param defaultValue Veri bulunamazsa dönecek varsayılan değer
 * @returns Alınan değer veya defaultValue/null
 */
export const getItem = async <T>(key: string, defaultValue?: T): Promise<T | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value === null) return defaultValue !== undefined ? defaultValue : null;
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('AsyncStorage getItem error:', error);
    return defaultValue !== undefined ? defaultValue : null;
  }
};

/**
 * AsyncStorage'dan veriyi siler
 * @param key Silinecek verinin anahtarı
 */
export const removeItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('AsyncStorage removeItem error:', error);
  }
};

/**
 * AsyncStorage'daki tüm verileri temizler
 */
export const clearAll = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('AsyncStorage clearAll error:', error);
  }
}; 