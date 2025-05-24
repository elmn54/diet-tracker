import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';

// The Firebase app is automatically initialized using the google-services.json
// configuration when the first Firebase service is used.

// Export Firebase services using modular API
export const firebaseAuth = getAuth();
export const firebaseFirestore = getFirestore();