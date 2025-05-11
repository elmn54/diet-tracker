// @ts-ignore
import axios from 'axios';
import { AI_PROVIDERS, AI_PROVIDER_ENDPOINTS } from '../constants/aiProviders';
import { post } from '../api/client';
import { imageToBase64 } from './cameraService';

// API endpoint'leri
const API_ENDPOINTS = {
  [AI_PROVIDERS.OPENAI]: 'https://api.openai.com/v1/chat/completions',
  [AI_PROVIDERS.GEMINI]: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro-vision:generateContent',
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

// OpenAI API response interfaces
interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
    index: number;
  }[];
}

// Gemini API response interfaces
interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

// Claude API response interfaces
interface ClaudeResponse {
  content: {
    text: string;
    type: string;
  }[];
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
  apiKey: string
): Promise<FoodRecognitionResult> => {
  console.log(`Starting food identification with provider: ${provider}`);
  
  if (!image.uri) {
    throw new Error('Image URI is required');
  }

  // If base64 isn't provided, convert the image to base64
  const base64 = image.base64 || await imageToBase64(image.uri);
  if (!base64) {
    throw new Error('Failed to convert image to base64');
  }

  // Get the endpoint for the selected provider
  const endpoint = AI_PROVIDER_ENDPOINTS[provider];
  console.log(`Using endpoint: ${endpoint}`);
  
  if (!endpoint) {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  try {
    switch (provider) {
      case AI_PROVIDERS.OPENAI:
        return await identifyWithOpenAI(base64, apiKey, endpoint);
      case AI_PROVIDERS.GEMINI:
        return await identifyWithGemini(base64, apiKey, endpoint);
      case AI_PROVIDERS.CLAUDE:
        return await identifyWithClaude(base64, apiKey, endpoint);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  } catch (error: any) {
    console.error(`Error identifying food with ${provider}:`, error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      response: error.response?.data
    });
    throw new Error(`Failed to identify food: ${error.message}`);
  }
};

/**
 * OpenAI ile yemek tanıma
 * @param imageBase64 - Base64 formatında görüntü
 * @param apiKey - OpenAI API anahtarı
 */
const identifyWithOpenAI = async (base64: string, apiKey: string, endpoint: string): Promise<FoodRecognitionResult> => {
  const response = await post<OpenAIResponse>(
    endpoint,
    {
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Identify this food and provide its nutritional facts in the following JSON format: {\"foodName\": \"name\", \"nutritionFacts\": {\"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number}}" 
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64}`
              }
            }
          ]
        }
      ],
      max_tokens: 300
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  try {
    // Extract JSON from the response
    const content = response.choices[0].message.content;
    // Find JSON data in the response
    const jsonMatch = content.match(/\{.*\}/s);
    if (jsonMatch) {
      const jsonData = JSON.parse(jsonMatch[0]);
      return jsonData;
    }
    throw new Error('Could not extract JSON from response');
  } catch (error: any) {
    console.error('Error parsing OpenAI response:', error);
    throw new Error('Failed to parse food recognition results');
  }
};

/**
 * Google Gemini ile yemek tanıma
 * @param imageBase64 - Base64 formatında görüntü
 * @param apiKey - Gemini API anahtarı
 */
const identifyWithGemini = async (base64: string, apiKey: string, endpoint: string): Promise<FoodRecognitionResult> => {
  console.log('Sending request to Gemini API:', `${endpoint}?key=${apiKey.substring(0, 5)}...`);
  console.log('Request payload:', {
    contents: [{
      parts: [
        { text: "Prompt text..." },
        { inline_data: { mime_type: "image/jpeg", data: "Base64 data (truncated)..." } }
      ]
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 300
    }
  });

  const response = await post<GeminiResponse>(
    `${endpoint}?key=${apiKey}`,
    {
      contents: [
        {
          parts: [
            {
              text: "Identify this food and provide its nutritional facts in the following JSON format: {\"foodName\": \"name\", \"nutritionFacts\": {\"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number}}"
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 300
      }
    }
  );

  console.log('Received response from Gemini API:', JSON.stringify(response, null, 2).substring(0, 500) + '...');

  try {
    // Extract JSON from the response
    const content = response.candidates[0].content.parts[0].text;
    // Find JSON data in the response
    const jsonMatch = content.match(/\{.*\}/s);
    if (jsonMatch) {
      const jsonData = JSON.parse(jsonMatch[0]);
      return jsonData;
    }
    throw new Error('Could not extract JSON from response');
  } catch (error: any) {
    console.error('Error parsing Gemini response:', error);
    throw new Error('Failed to parse food recognition results');
  }
};

/**
 * Claude ile yemek tanıma
 * @param imageBase64 - Base64 formatında görüntü
 * @param apiKey - Claude API anahtarı
 */
const identifyWithClaude = async (base64: string, apiKey: string, endpoint: string): Promise<FoodRecognitionResult> => {
  const response = await post<ClaudeResponse>(
    endpoint,
    {
      model: "claude-3-opus-20240229",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Identify this food and provide its nutritional facts in the following JSON format: {\"foodName\": \"name\", \"nutritionFacts\": {\"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number}}"
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: base64
              }
            }
          ]
        }
      ],
      max_tokens: 300
    },
    {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      }
    }
  );

  try {
    // Extract JSON from the response
    const content = response.content[0].text;
    // Find JSON data in the response
    const jsonMatch = content.match(/\{.*\}/s);
    if (jsonMatch) {
      const jsonData = JSON.parse(jsonMatch[0]);
      return jsonData;
    }
    throw new Error('Could not extract JSON from response');
  } catch (error: any) {
    console.error('Error parsing Claude response:', error);
    throw new Error('Failed to parse food recognition results');
  }
};

/**
 * Görüntü URI'sini Base64'e dönüştürme
 * @param uri Görüntü URI'si
 * @returns Base64 formatındaki görüntü verisi
 */
const convertImageToBase64 = async (uri: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        // Extract the base64 part after the data URL prefix
        const base64 = base64String.split(',')[1];
        console.log('Image successfully converted to base64');
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new Error('Görüntü formatı dönüştürülemedi');
  }
};

export default {
  identifyFood
}; 