import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';
import { Platform } from 'react-native';

// Debug: Log Firebase initialization for both development and production
console.log(`Initializing Firebase in ${__DEV__ ? 'DEVELOPMENT' : 'PRODUCTION'} mode on ${Platform.OS}...`);

// Initialize Firebase services
let firebaseAuth;
let firebaseFirestore;

try {
  // Check if Firebase app is available
  const app = getApp();
  console.log('Firebase app found:', app ? 'YES' : 'NO');
  
  // Get Firebase services using modular API
  firebaseAuth = getAuth();
  firebaseFirestore = getFirestore();

  // Log successful initialization
  console.log('Firebase auth and firestore services initialized');
} catch (serviceError) {
  console.error('Error initializing Firebase services:', serviceError);
  // Set default values to prevent app crash
  firebaseAuth = null;
  firebaseFirestore = null;
}

// Export Firebase services
export { firebaseAuth, firebaseFirestore };