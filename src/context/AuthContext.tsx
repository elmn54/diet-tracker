import React, { createContext, useContext, useEffect, useCallback, useState } from 'react';
import { firebaseAuth, firebaseFirestore } from '../firebase/firebase.config';
import firebase from '@react-native-firebase/app';
import { 
  AuthContextProps, 
  SignInCredentials, 
  SignUpCredentials, 
  User, 
  UserData 
} from '../types/auth';
import GoogleAuthService from '../firebase/google-auth';

// Create Context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Initial state
const initialState = {
  user: null,
  isLoading: true,
  error: null,
};

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState(initialState);

  // Initialize Google Sign In
  useEffect(() => {
    GoogleAuthService.init();
  }, []);

  // Check if user is already authenticated
  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        // User is logged in
        const user: User = {
          uid: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName,
          photoURL: authUser.photoURL,
        };
        setState({ user, isLoading: false, error: null });
      } else {
        // User is not logged in
        setState({ user: null, isLoading: false, error: null });
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Sign in user
  const signIn = useCallback(async (credentials: SignInCredentials): Promise<void> => {
    setState(prevState => ({ ...prevState, isLoading: true, error: null }));
    try {
      await firebaseAuth.signInWithEmailAndPassword(
        credentials.email,
        credentials.password
      );
      // No need to setState here as the onAuthStateChanged listener will update
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: (error as Error).message,
      }));
    }
  }, []);

  // Sign up user
  const signUp = useCallback(async (credentials: SignUpCredentials): Promise<void> => {
    setState(prevState => ({ ...prevState, isLoading: true, error: null }));
    try {
      // Create user in Firebase Authentication
      const userCredential = await firebaseAuth.createUserWithEmailAndPassword(
        credentials.email,
        credentials.password
      );

      // Update display name
      await userCredential.user.updateProfile({
        displayName: credentials.displayName,
      });

      // Create user document in Firestore
      const userData: UserData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: credentials.displayName,
        photoURL: null,
        createdAt: firebase.firestore.Timestamp.now(),
      };

      await firebaseFirestore.collection('users').doc(userCredential.user.uid).set(userData);
      // No need to setState here as the onAuthStateChanged listener will update
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: (error as Error).message,
      }));
    }
  }, []);

  // Google sign in
  const signInWithGoogle = useCallback(async (): Promise<void> => {
    setState(prevState => ({ ...prevState, isLoading: true, error: null }));
    try {
      await GoogleAuthService.signIn();
      // No need to setState here as the onAuthStateChanged listener will update
    } catch (error) {
      console.log('Google sign in error:', error);
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: (error as Error).message,
      }));
    }
  }, []);

  // Sign out user
  const signOut = useCallback(async (): Promise<void> => {
    setState(prevState => ({ ...prevState, isLoading: true, error: null }));
    try {
      // Use GoogleAuthService for complete sign out (handles both Firebase and Google)
      await GoogleAuthService.signOut();
      
      // No need to setState here as the onAuthStateChanged listener will update
    } catch (error) {
      console.error('Sign out error:', error);
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: (error as Error).message,
      }));
    }
  }, []);

  // Reset error
  const resetError = useCallback((): void => {
    setState(prevState => ({ ...prevState, error: null }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isLoading: state.isLoading,
        error: state.error,
        signIn,
        signUp,
        signOut,
        resetError,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 