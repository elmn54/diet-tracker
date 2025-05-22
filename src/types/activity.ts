import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

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
  id: string; // UUID ile oluşturulacak, Firestore'da doküman ID'si olarak kullanılacak
  name: string;
  calories: number; // Yakılan kalori (pozitif değer, hesaplamalarda eksi olarak kullanılır)
  activityType: ActivityType;
  duration: number; // Dakika cinsinden süre
  intensity: ActivityIntensity;
  date: string; // ISO string formatında tarih
  imageUri?: string; // İsteğe bağlı: aktivite görseli
  createdAt?: string | FirebaseFirestoreTypes.Timestamp; // ISO string veya Firestore Timestamp
  updatedAt?: string | FirebaseFirestoreTypes.Timestamp; // ISO string veya Firestore Timestamp
}