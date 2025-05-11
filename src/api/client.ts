import axios from 'axios';

// Create a default axios instance with common configuration
const client = axios.create({
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Basit hata işleme yardımcı fonksiyonu
export const handleApiError = (error: any): { message: string; retryable: boolean } => {
  // HTTP yanıtı varsa
  if (error.response) {
    const { status } = error.response;
    
    // 429 (Rate Limiting) veya 5xx (Sunucu Hatası) hatalarını yeniden deneyebiliriz
    const isRetryable = status === 429 || status >= 500;
    
    // Durum koduna göre kullanıcı dostu mesaj
    let message;
    
    switch (status) {
      case 401:
        message = 'API anahtarı geçersiz. Lütfen ayarlar sayfasından API anahtarınızı kontrol edin.';
        break;
      case 403:
        message = 'Bu işlemi gerçekleştirme izniniz yok.';
        break;
      case 404:
        message = 'İstenen kaynak bulunamadı.';
        break;
      case 429:
        message = 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        message = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
        break;
      default:
        message = `HTTP Hatası: ${status}`;
    }
    
    return { message, retryable: isRetryable };
  }
  
  // Ağ hatası
  if (error.request) {
    return {
      message: 'Sunucuyla bağlantı kurulamadı. İnternet bağlantınızı kontrol edin.',
      retryable: true
    };
  }
  
  // Diğer hatalar
  return {
    message: error.message || 'Bilinmeyen bir hata oluştu.',
    retryable: false
  };
};

/**
 * Make a GET request
 * @param url The URL to fetch from
 * @param config Optional axios config
 * @returns Promise with the response data
 */
export const get = async <T>(url: string, config?: any): Promise<T> => {
  try {
    const response = await client.get<T>(url, config);
    return response.data;
  } catch (error) {
    const { message, retryable } = handleApiError(error);
    console.error('GET request failed:', message, 'Retryable:', retryable);
    throw error;
  }
};

/**
 * Make a POST request
 * @param url The URL to post to
 * @param data The data to send
 * @param config Optional axios config
 * @returns Promise with the response data
 */
export const post = async <T>(url: string, data?: any, config?: any): Promise<T> => {
  try {
    console.log(`API Request: POST ${url}`);
    console.log('Request config:', { 
      headers: config?.headers ? {...config.headers, Authorization: config.headers.Authorization ? 'Bearer ***' : undefined} : {},
      timeout: config?.timeout || client.defaults.timeout
    });
    // Hide sensitive data but show request structure
    const sensitiveDataHidden = JSON.parse(JSON.stringify(data || {}));
    if (sensitiveDataHidden.inline_data?.data) {
      sensitiveDataHidden.inline_data.data = '***image data truncated***';
    }
    console.log('Request data (sanitized):', sensitiveDataHidden);

    const response = await client.post<T>(url, data, config);
    
    console.log(`API Response status: ${response.status}`);
    // Log only a portion of the response to avoid flooding logs
    console.log('Response data (truncated):', typeof response.data === 'object' 
      ? JSON.stringify(response.data).substring(0, 300) + '...' 
      : String(response.data).substring(0, 300) + '...');
    
    return response.data;
  } catch (error: any) {
    const { message, retryable } = handleApiError(error);
    console.error('POST request failed:', message, 'Retryable:', retryable);
    // Log detailed error information
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    }
    throw error;
  }
};

/**
 * Make a PUT request
 * @param url The URL to put to
 * @param data The data to send
 * @param config Optional axios config
 * @returns Promise with the response data
 */
export const put = async <T>(url: string, data?: any, config?: any): Promise<T> => {
  try {
    const response = await client.put<T>(url, data, config);
    return response.data;
  } catch (error) {
    const { message, retryable } = handleApiError(error);
    console.error('PUT request failed:', message, 'Retryable:', retryable);
    throw error;
  }
};

/**
 * Make a DELETE request
 * @param url The URL to delete from
 * @param config Optional axios config
 * @returns Promise with the response data
 */
export const del = async <T>(url: string, config?: any): Promise<T> => {
  try {
    const response = await client.delete<T>(url, config);
    return response.data;
  } catch (error) {
    const { message, retryable } = handleApiError(error);
    console.error('DELETE request failed:', message, 'Retryable:', retryable);
    throw error;
  }
};

export default {
  get,
  post,
  put,
  delete: del,
}; 