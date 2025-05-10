// @ts-ignore
import axios from 'axios';
import { AI_PROVIDERS } from '../store/apiKeyStore';

// API endpoint'leri
const API_ENDPOINTS = {
  [AI_PROVIDERS.OPENAI]: 'https://api.openai.com/v1/chat/completions',
  [AI_PROVIDERS.GEMINI]: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent',
  [AI_PROVIDERS.CLAUDE]: 'https://api.anthropic.com/v1/messages',
};

// Yemek ve besin değerleri sonuç yapısı
export interface FoodRecognitionResult {
  foodName: string;
  nutritionFacts: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  confidence?: number;
  ingredients?: string[];
}

// API çağrısı için görüntü türünü tanımla
export interface ImageData {
  uri: string;
  base64?: string;
}

/**
 * Fotoğraftaki yemeği tanımlama servisi
 * @param image - Analiz edilecek görüntü
 * @param provider - Kullanılacak AI sağlayıcısı (OpenAI, Gemini, Claude)
 * @param apiKey - Sağlayıcı API anahtarı
 * @returns Tanımlanan yemek ve besin değerleri
 */
export const identifyFood = async (
  image: ImageData,
  provider: string = AI_PROVIDERS.OPENAI,
  apiKey?: string
): Promise<FoodRecognitionResult> => {
  if (!apiKey) {
    throw new Error('API anahtarı belirtilmedi');
  }

  try {
    // Görüntü verisi uygun formata dönüştür
    const imageBase64 = image.base64 || await convertImageToBase64(image.uri);
    
    switch (provider) {
      case AI_PROVIDERS.OPENAI:
        return await identifyWithOpenAI(imageBase64, apiKey);
      case AI_PROVIDERS.GEMINI:
        return await identifyWithGemini(imageBase64, apiKey);
      case AI_PROVIDERS.CLAUDE:
        return await identifyWithClaude(imageBase64, apiKey);
      default:
        throw new Error('Desteklenmeyen AI sağlayıcısı');
    }
  } catch (error) {
    console.error('Yemek tanıma hatası:', error);
    throw new Error(`Yemek tanınamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
  }
};

/**
 * OpenAI ile yemek tanıma
 * @param imageBase64 - Base64 formatında görüntü
 * @param apiKey - OpenAI API anahtarı
 */
const identifyWithOpenAI = async (imageBase64: string, apiKey: string): Promise<FoodRecognitionResult> => {
  const response = await axios.post(
    API_ENDPOINTS[AI_PROVIDERS.OPENAI],
    {
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'system',
          content: 'Bu fotoğrafta görünen yemeği tanımla ve besin değerlerini tahmin et. JSON formatında cevap ver.',
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Bu yemeği tanımla ve besin değerlerini aşağıdaki formatta tahmin et: {"foodName": "Yemek Adı", "nutritionFacts": {"calories": 000, "protein": 00, "carbs": 00, "fat": 00}}' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ],
        },
      ],
      max_tokens: 500,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    }
  );

  try {
    const content = response.data.choices[0].message.content;
    // JSON içeriğini ayıkla
    const jsonMatch = content.match(/\{.*\}/s);
    if (jsonMatch) {
      const resultData = JSON.parse(jsonMatch[0]);
      return {
        foodName: resultData.foodName,
        nutritionFacts: resultData.nutritionFacts
      };
    }
    throw new Error('Geçerli JSON yanıtı alınamadı');
  } catch (error) {
    console.error('OpenAI yanıtı işlenirken hata:', error);
    throw new Error('Yemek bilgileri işlenemedi');
  }
};

/**
 * Google Gemini ile yemek tanıma
 * @param imageBase64 - Base64 formatında görüntü
 * @param apiKey - Gemini API anahtarı
 */
const identifyWithGemini = async (imageBase64: string, apiKey: string): Promise<FoodRecognitionResult> => {
  const response = await axios.post(
    `${API_ENDPOINTS[AI_PROVIDERS.GEMINI]}?key=${apiKey}`,
    {
      contents: [
        {
          parts: [
            { text: 'Bu fotoğrafta görünen yemeği tanımla ve besin değerlerini aşağıdaki formatta tahmin et: {"foodName": "Yemek Adı", "nutritionFacts": {"calories": 000, "protein": 00, "carbs": 00, "fat": 00}}' },
            { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 500,
      }
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  try {
    const content = response.data.candidates[0].content.parts[0].text;
    // JSON içeriğini ayıkla
    const jsonMatch = content.match(/\{.*\}/s);
    if (jsonMatch) {
      const resultData = JSON.parse(jsonMatch[0]);
      return {
        foodName: resultData.foodName,
        nutritionFacts: resultData.nutritionFacts
      };
    }
    throw new Error('Geçerli JSON yanıtı alınamadı');
  } catch (error) {
    console.error('Gemini yanıtı işlenirken hata:', error);
    throw new Error('Yemek bilgileri işlenemedi');
  }
};

/**
 * Claude ile yemek tanıma
 * @param imageBase64 - Base64 formatında görüntü
 * @param apiKey - Claude API anahtarı
 */
const identifyWithClaude = async (imageBase64: string, apiKey: string): Promise<FoodRecognitionResult> => {
  const response = await axios.post(
    API_ENDPOINTS[AI_PROVIDERS.CLAUDE],
    {
      model: 'claude-3-opus-20240229',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Bu fotoğrafta görünen yemeği tanımla ve besin değerlerini aşağıdaki formatta tahmin et: {"foodName": "Yemek Adı", "nutritionFacts": {"calories": 000, "protein": 00, "carbs": 00, "fat": 00}}' },
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } }
          ]
        }
      ]
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
    }
  );

  try {
    const content = response.data.content[0].text;
    // JSON içeriğini ayıkla
    const jsonMatch = content.match(/\{.*\}/s);
    if (jsonMatch) {
      const resultData = JSON.parse(jsonMatch[0]);
      return {
        foodName: resultData.foodName,
        nutritionFacts: resultData.nutritionFacts
      };
    }
    throw new Error('Geçerli JSON yanıtı alınamadı');
  } catch (error) {
    console.error('Claude yanıtı işlenirken hata:', error);
    throw new Error('Yemek bilgileri işlenemedi');
  }
};

/**
 * Görüntü URI'sini Base64'e dönüştürme
 * @param uri Görüntü URI'si
 * @returns Base64 formatındaki görüntü verisi
 */
const convertImageToBase64 = async (uri: string): Promise<string> => {
  // Not: Gerçek uygulamada, React Native veya Expo için uygun bir kütüphane kullanarak
  // görüntü dosyasını Base64'e dönüştürme kodunu buraya ekleyin
  // Bu bir mock implementasyondur
  try {
    // Örnek yaklaşım (gerçek uygulamada farklı olabilir):
    // 1. Fetch ile dosyayı al
    // 2. Blob'a dönüştür
    // 3. FileReader ile Base64'e çevir
    return 'MOCK_BASE64_IMAGE_DATA';
  } catch (error) {
    console.error('Görüntü Base64\'e dönüştürülürken hata:', error);
    throw new Error('Görüntü formatı dönüştürülemedi');
  }
};

export default {
  identifyFood
}; 