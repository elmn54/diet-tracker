import axios from 'axios';
import { AI_PROVIDERS } from '../constants/aiProviders';

/**
 * OpenAI API yardımcı sınıfı
 */
export class OpenAI {
  /**
   * Metin tabanlı bir tamamlama isteği gönderir
   * @param prompt - AI'ya gönderilecek prompt
   * @param apiKey - OpenAI API anahtarı
   * @returns Tamamlama yanıtı
   */
  static async createCompletion(prompt, apiKey) {
    try {
      console.log('OpenAI completion request sending...');
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Sen bir diyet ve beslenme uzmanısın. Sana söylenen yiyecekler ve içecekler hakkında besleyici değerleri tam olarak biliyorsun.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 500
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );
      
      console.log('OpenAI response received');
      
      // Yanıtı döndür
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error.response?.data || error.message);
      throw new Error(`OpenAI API hatası: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

/**
 * Google Gemini (eski adıyla Bard) API yardımcı sınıfı 
 */
export class Gemini {
  /**
   * Metin tabanlı bir tamamlama isteği gönderir
   * @param prompt - AI'ya gönderilecek prompt
   * @param apiKey - Gemini API anahtarı
   * @returns Tamamlama yanıtı
   */
  static async createCompletion(prompt, apiKey) {
    try {
      console.log('Gemini completion request sending...');
      
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500
          }
        }
      );
      
      console.log('Gemini response received');
      
      // Yanıtı döndür
      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API error:', error.response?.data || error.message);
      throw new Error(`Gemini API hatası: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

/**
 * Tercih edilen API sağlayıcısına göre uygun AI servisini seçer
 * @param provider - AI sağlayıcısı
 * @param prompt - AI'ya gönderilecek prompt  
 * @param apiKey - API anahtarı
 * @returns Tamamlama yanıtı
 */
export const createCompletion = async (provider, prompt, apiKey) => {
  switch (provider) {
    case AI_PROVIDERS.OPENAI:
      return OpenAI.createCompletion(prompt, apiKey);
    case AI_PROVIDERS.GEMINI:
      return Gemini.createCompletion(prompt, apiKey);
    default:
      throw new Error(`Desteklenmeyen sağlayıcı: ${provider}`);
  }
};

export default {
  OpenAI,
  Gemini,
  createCompletion
}; 