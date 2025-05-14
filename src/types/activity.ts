/**
 * Aktivite öğesi için tip tanımlamaları
 */

/**
 * Aktivite türleri
 */
export type ActivityType = 'walking' | 'running' | 'cycling' | 'swimming' | 'workout' | 'other';

/**
 * Aktivite yoğunluğu
 */
export enum ActivityIntensity {
  Low = 'low',
  Medium = 'medium',
  High = 'high'
}

/**
 * Aktivite öğesi arayüzü
 */
export interface ActivityItem {
  id: string;
  name: string;
  calories: number; // Yakılan kalori (negatif değer olarak hesaplanacak)
  activityType: ActivityType;
  duration: number; // Dakika cinsinden süre
  intensity: ActivityIntensity;
  date: string; // ISO string formatında tarih
  imageUri?: string; // İsteğe bağlı: aktivite görseli
} 