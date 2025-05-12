import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AI_PROVIDERS = {
  OPENAI: 'openai',
  GEMINI: 'gemini',
  CLAUDE: 'claude',
};

type ApiKeyState = {
  apiKeys: Record<string, string>;
  preferredProvider: string;
  isLoading: boolean;
  
  // Eylemler
  setApiKey: (provider: string, apiKey: string) => Promise<void>;
  getApiKey: (provider: string) => string | undefined;
  setPreferredProvider: (provider: string) => Promise<void>;
  getActiveApiKey: () => string | undefined;
  loadApiKeys: () => Promise<void>;
  reset: () => Promise<void>;
};

// API Anahtarlarını saklama ve yönetme store'u
export const useApiKeyStore = create<ApiKeyState>((set, get) => ({
  apiKeys: {},
  preferredProvider: AI_PROVIDERS.GEMINI,
  isLoading: false,
  
  // API anahtarı ayarlama
  setApiKey: async (provider, apiKey) => {
    try {
      const updatedApiKeys = { ...get().apiKeys };
      
      // Eğer apiKey boş ise, o provider için olan anahtarı sil
      if (!apiKey || apiKey.trim() === '') {
        delete updatedApiKeys[provider];
      } else {
        // Değilse yeni anahtarı kaydet
        updatedApiKeys[provider] = apiKey;
      }
      
      set({ apiKeys: updatedApiKeys });
      await AsyncStorage.setItem('api_keys', JSON.stringify(updatedApiKeys));
    } catch (error) {
      console.error('API anahtarı kaydedilirken hata oluştu:', error);
    }
  },
  
  // Belirli bir sağlayıcının API anahtarını getirme
  getApiKey: (provider) => {
    return get().apiKeys[provider];
  },
  
  // Tercih edilen sağlayıcıyı ayarlama
  setPreferredProvider: async (provider) => {
    try {
      set({ preferredProvider: provider });
      await AsyncStorage.setItem('preferred_provider', provider);
    } catch (error) {
      console.error('Tercih edilen sağlayıcı kaydedilirken hata oluştu:', error);
    }
  },
  
  // Aktif API anahtarını getirme (tercih edilen sağlayıcınınki)
  getActiveApiKey: () => {
    const { apiKeys, preferredProvider } = get();
    return apiKeys[preferredProvider];
  },
  
  // Saklanan API anahtarlarını ve tercihleri yükleme
  loadApiKeys: async () => {
    try {
      set({ isLoading: true });
      
      const storedApiKeys = await AsyncStorage.getItem('api_keys');
      const storedPreferredProvider = await AsyncStorage.getItem('preferred_provider');
      
      if (storedApiKeys) {
        set({ apiKeys: JSON.parse(storedApiKeys) });
      }
      
      if (storedPreferredProvider) {
        set({ preferredProvider: storedPreferredProvider });
      }
    } catch (error) {
      console.error('API anahtarları yüklenirken hata oluştu:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Store'u sıfırlama - test için kullanışlı
  reset: async () => {
    try {
      set({ 
        apiKeys: {}, 
        preferredProvider: AI_PROVIDERS.GEMINI,
        isLoading: false 
      });
      
      await AsyncStorage.removeItem('api_keys');
      await AsyncStorage.removeItem('preferred_provider');
    } catch (error) {
      console.error('Store sıfırlanırken hata oluştu:', error);
    }
  }
}));

// App.tsx içinde uygulamanın başlangıcında yüklemek için useEffect içinde çağırın
// useEffect(() => {
//   useApiKeyStore.getState().loadApiKeys();
// }, []); 