import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';

// Export Firebase services
export const firebaseAuth = auth(getApp());
export const firebaseFirestore = firestore(getApp());