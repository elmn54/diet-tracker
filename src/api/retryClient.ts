import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { parseApiError } from './errorHandler';

// Yeniden deneme yapılandırması için genişletilmiş istek ayarları
interface RetryConfig extends AxiosRequestConfig {
  maxRetries?: number;
  retryDelay?: number;
  shouldRetry?: (error: any) => boolean;
}

// Varsayılan yeniden deneme yapılandırması
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // ms
  shouldRetry: (error: any) => {
    const apiError = parseApiError(error);
    return apiError.isRetryable;
  }
};

/**
 * Yeniden deneme özelliğine sahip HTTP istemcisi oluşturur
 * 
 * @param baseConfig Temel Axios yapılandırması ve yeniden deneme seçenekleri
 * @returns Yeniden deneme özelliğine sahip Axios istemcisi
 */
export const createRetryClient = (baseConfig: RetryConfig = {}) => {
  // Temel axios istemcisi oluştur
  const client = axios.create(baseConfig);
  
  // İsteği yeniden deneme
  const retryRequest = async (
    config: RetryConfig,
    error: any,
    retryCount: number
  ): Promise<AxiosResponse> => {
    // Yeniden deneme yapılandırmasını ayarla
    const maxRetries = config.maxRetries || DEFAULT_RETRY_CONFIG.maxRetries;
    const retryDelay = config.retryDelay || DEFAULT_RETRY_CONFIG.retryDelay;
    const shouldRetry = config.shouldRetry || DEFAULT_RETRY_CONFIG.shouldRetry;
    
    // Maksimum yeniden deneme sayısını aşıldıysa hata fırlat
    if (retryCount >= maxRetries) {
      throw error;
    }
    
    // Hatanın yeniden denenebilir olup olmadığını kontrol et
    if (!shouldRetry(error)) {
      throw error;
    }
    
    // Yeniden denemeden önce bekle (artan gecikme)
    const delay = retryDelay * Math.pow(2, retryCount);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    console.log(`İstek yeniden deneniyor (${retryCount + 1}/${maxRetries})...`);
    
    // İsteği yeniden dene
    try {
      return await client(config);
    } catch (retryError) {
      return retryRequest(config, retryError, retryCount + 1);
    }
  };
  
  // Hata yakalayıcı ara yazılım
  client.interceptors.response.use(
    response => response,
    async (error: any) => {
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

// Varsayılan yeniden deneme istemcisi
const retryClient = createRetryClient({
  timeout: 30000, // 30 saniye
  headers: {
    'Content-Type': 'application/json',
  }
});

/**
 * GET isteği gönderir
 * 
 * @param url İstek URL'i
 * @param config İstek yapılandırması
 * @returns İstek yanıtı
 */
export const get = async <T>(url: string, config?: RetryConfig): Promise<T> => {
  try {
    const response = await retryClient.get<T>(url, config);
    return response.data;
  } catch (error) {
    console.error('GET isteği başarısız:', error);
    throw error;
  }
};

/**
 * POST isteği gönderir
 * 
 * @param url İstek URL'i
 * @param data Gönderilecek veri
 * @param config İstek yapılandırması
 * @returns İstek yanıtı
 */
export const post = async <T>(url: string, data?: any, config?: RetryConfig): Promise<T> => {
  try {
    const response = await retryClient.post<T>(url, data, config);
    return response.data;
  } catch (error) {
    console.error('POST isteği başarısız:', error);
    throw error;
  }
};

/**
 * PUT isteği gönderir
 * 
 * @param url İstek URL'i
 * @param data Gönderilecek veri
 * @param config İstek yapılandırması
 * @returns İstek yanıtı
 */
export const put = async <T>(url: string, data?: any, config?: RetryConfig): Promise<T> => {
  try {
    const response = await retryClient.put<T>(url, data, config);
    return response.data;
  } catch (error) {
    console.error('PUT isteği başarısız:', error);
    throw error;
  }
};

/**
 * DELETE isteği gönderir
 * 
 * @param url İstek URL'i
 * @param config İstek yapılandırması
 * @returns İstek yanıtı
 */
export const del = async <T>(url: string, config?: RetryConfig): Promise<T> => {
  try {
    const response = await retryClient.delete<T>(url, config);
    return response.data;
  } catch (error) {
    console.error('DELETE isteği başarısız:', error);
    throw error;
  }
};

export default {
  get,
  post,
  put,
  delete: del,
  client: retryClient
}; 