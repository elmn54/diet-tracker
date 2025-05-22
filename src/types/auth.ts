import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  createdAt: Date; 
  activePlanId: 'free' | 'basic' | 'premium';
  subscriptionEndDate: Date | null;
  userSettings?: {
    calorieGoal?: number;
    nutrientGoals?: { protein: number; carbs: number; fat: number };
    preferredTheme?: string;
    updatedAt?: Date; 
  };
}

export interface AuthState {
  user: User | null;
  userData: UserData | null;
  isLoading: boolean;
  error: string | null;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends SignInCredentials {
  displayName: string;
}

export interface AuthContextProps {
  user: User | null;
  userData: UserData | null;
  isLoading: boolean;
  error: string | null;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetError: () => void;
}