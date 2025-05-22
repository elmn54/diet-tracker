import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore'; // Sadece Timestamp.fromDate vb. için gerekirse kalır

export interface User { // Firebase Auth'dan gelen temel kullanıcı bilgisi
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

export interface UserData { // Firestore'da saklanan ve uygulamada kullanılan kullanıcı verisi
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  createdAt: Date; // Firestore'dan okununca Date objesine çevrilecek
  activePlanId: 'free' | 'basic' | 'premium';
  subscriptionEndDate: Date | null; // Firestore'dan okununca Date objesine çevrilecek (null olabilir)
  userSettings?: {
    calorieGoal?: number;
    nutrientGoals?: { protein: number; carbs: number; fat: number };
    preferredTheme?: string;
    updatedAt?: Date; // Bu da Date olabilir
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