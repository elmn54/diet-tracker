import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type ActivityType = 'walking' | 'running' | 'cycling' | 'swimming' | 'workout' | 'other';

export enum ActivityIntensity {
  Low = 'low',
  Medium = 'medium',
  High = 'high'
}

export interface ActivityItem {
  id: string;
  name: string;
  calories: number;
  activityType: ActivityType;
  duration: number;
  intensity: ActivityIntensity;
  date: string;
  imageUri?: string;
  createdAt?: string | Date | FirebaseFirestoreTypes.Timestamp; // Date eklendi
  updatedAt?: string | Date | FirebaseFirestoreTypes.Timestamp; // Date eklendi
}