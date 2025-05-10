import axios from 'axios';

// Hata türü tanımı
export interface ApiError {
  code: string;
  message: string;
  isRetryable: boolean;
  status?: number;
  originalError?: any;
}

/**
 * API hatalarını işleyen yardımcı fonksiyon
 * 
 * @param error API çağrısından kaynaklanan hata
 * @returns Standartlaştırılmış API hatası
 */
export const parseApiError = (error: any): ApiError => {
  // Axios hata nesnesi kontrolü (response veya request özelliğine sahipse muhtemelen Axios hatası)
  if (error && (error.response || error.request)) {
    const { response, request } = error;
    
    // HTTP yanıtı alındıysa (sunucu taraflı hata)
    if (response) {
      const { status, data } = response;
      
      // Yaygın HTTP durum kodlarını işleme
      switch (status) {
        case 400:
          return {
            code: 'BAD_REQUEST',
            message: 'Geçersiz istek. Lütfen girdiğiniz bilgileri kontrol edin.',
            isRetryable: false,
            status
          };
        case 401:
          return {
            code: 'UNAUTHORIZED',
            message: 'API anahtarı geçersiz veya süresi dolmuş.',
            isRetryable: false,
            status
          };
        case 403:
          return {
            code: 'FORBIDDEN',
            message: 'Bu işlemi gerçekleştirme izniniz yok.',
            isRetryable: false,
            status
          };
        case 404:
          return {
            code: 'NOT_FOUND',
            message: 'İstenen kaynak bulunamadı.',
            isRetryable: false,
            status
          };
        case 429:
          return {
            code: 'RATE_LIMITED',
            message: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.',
            isRetryable: true,
            status
          };
        case 500:
        case 502:
        case 503:
        case 504:
          return {
            code: 'SERVER_ERROR',
            message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
            isRetryable: true,
            status
          };
      }
      
      // API'ye özgü hata mesajını işle
      if (typeof data === 'object' && data !== null) {
        // OpenAI hata formatı
        if (data.error && typeof data.error === 'object') {
          return {
            code: data.error.code || data.error.type || 'API_ERROR',
            message: data.error.message || 'Bir API hatası oluştu.',
            isRetryable: status >= 500, // 5xx hatalarında yeniden deneme
            status,
            originalError: error
          };
        }
        
        // Claude hata formatı
        if (data.type && data.message) {
          return {
            code: data.type,
            message: data.message,
            isRetryable: status >= 500,
            status,
            originalError: error
          };
        }
        
        // Gemini hata formatı
        if (data.error && typeof data.error === 'string') {
          return {
            code: 'GEMINI_ERROR',
            message: data.error,
            isRetryable: status >= 500,
            status,
            originalError: error
          };
        }
      }
      
      // Genel durum kodu hatası
      return {
        code: `HTTP_${status}`,
        message: `Sunucu ${status} hatası döndürdü.`,
        isRetryable: status >= 500,
        status,
        originalError: error
      };
    }
    
    // HTTP isteği gönderildi ancak yanıt alınamadı (ağ hatası)
    if (request) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Sunucuyla bağlantı kurulamadı. İnternet bağlantınızı kontrol edin.',
        isRetryable: true,
        originalError: error
      };
    }
  }
  
  // Standart JavaScript hatası
  if (error instanceof Error) {
    return {
      code: 'JS_ERROR',
      message: error.message || 'Bilinmeyen bir hata oluştu.',
      isRetryable: false,
      originalError: error
    };
  }
  
  // Diğer tüm hata türleri
  return {
    code: 'UNKNOWN_ERROR',
    message: error?.message || 'Bilinmeyen bir hata oluştu.',
    isRetryable: false,
    originalError: error
  };
};

/**
 * API hatasını kullanıcı dostu bir mesaja dönüştürür
 * 
 * @param apiError İşlenmiş API hatası
 * @returns Kullanıcı dostu hata mesajı
 */
export const formatUserFriendlyError = (apiError: ApiError): string => {
  // API kimlik doğrulama hatalarını daha anlaşılır biçimde ifade et
  if (apiError.code === 'UNAUTHORIZED' || apiError.status === 401) {
    return 'API anahtarınız geçersiz. Lütfen ayarlar sayfasından geçerli bir API anahtarı girin.';
  }
  
  // Rate limiting hatalarına özel yönlendirme
  if (apiError.code === 'RATE_LIMITED' || apiError.status === 429) {
    return 'API kullanım limitinize ulaştınız. Lütfen daha sonra tekrar deneyin veya premium aboneliğe geçiş yapın.';
  }
  
  // Ağ hatalarını daha doğrudan açıkla
  if (apiError.code === 'NETWORK_ERROR') {
    return 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.';
  }

  // Standart hata mesajı
  return apiError.message || 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
};

/**
 * Hata ayıklama için hata loglaması 
 * 
 * @param error Hata nesnesi
 * @param context Hatanın oluştuğu bağlam
 */
export const logError = (error: any, context: string = 'Uygulama'): void => {
  // Geliştirme ortamında konsola logla
  if (__DEV__) {
    console.error(`[${context} Hatası]`, error);
  }
  
  // Canlı ortamda bir hata izleme servisi kullanılabilir (örn. Sentry)
  // TODO: Sentry veya benzer hata izleme servisi entegrasyonu ekle
};

export default {
  parseApiError,
  formatUserFriendlyError,
  logError
}; 