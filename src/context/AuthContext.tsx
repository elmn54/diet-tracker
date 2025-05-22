import React, { createContext, useContext, useEffect, useCallback, useState } from 'react';
import { firebaseAuth, firebaseFirestore } from '../firebase/firebase.config';
import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from '@react-native-firebase/firestore'; // Timestamp hala Firestore'dan okuma için gerekli
import {
  AuthContextProps,
  SignInCredentials,
  SignUpCredentials,
  User,
  UserData
} from '../types/auth';
import GoogleAuthService from '../firebase/google-auth';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { useFoodStore } from '../store/foodStore';
import { useActivityStore } from '../store/activityStore';
import { useCalorieGoalStore } from '../store/calorieGoalStore';

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const initialState: {
  user: User | null;
  userData: UserData | null;
  isLoading: boolean;
  error: string | null;
} = {
  user: null,
  userData: null,
  isLoading: true,
  error: null,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState(initialState);
  const { loadUserSubscription, reset: resetSubscriptionStore } = useSubscriptionStore.getState();
  const { reset: resetFoodStore, loadFoods } = useFoodStore.getState();
  const { reset: resetActivityStore, loadActivities } = useActivityStore.getState();
  const { reset: resetCalorieGoalStore, loadGoals: loadCalorieGoals } = useCalorieGoalStore.getState();

  useEffect(() => {
    GoogleAuthService.init();
  }, []);

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        const user: User = {
          uid: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName,
          photoURL: authUser.photoURL,
        };

        try {
          const userDocRef = doc(firebaseFirestore, 'users', authUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          let firestoreUserData: UserData | null = null;

          if (userDocSnap.exists()) {
            const rawData = userDocSnap.data();
            
            // UserData tipi artık Date beklediği için dönüşüm doğru
            const createdAtDate = rawData.createdAt instanceof Timestamp 
              ? rawData.createdAt.toDate() 
              : (rawData.createdAt ? new Date(rawData.createdAt) : new Date()); // Fallback
            
            const subscriptionEndDateDate = rawData.subscriptionEndDate instanceof Timestamp 
              ? rawData.subscriptionEndDate.toDate() 
              : null;

            let userSettingsWithDate: UserData['userSettings'] = undefined;
            if (rawData.userSettings) {
                userSettingsWithDate = {
                    ...rawData.userSettings,
                    updatedAt: rawData.userSettings.updatedAt instanceof Timestamp
                        ? rawData.userSettings.updatedAt.toDate()
                        : (rawData.userSettings.updatedAt ? new Date(rawData.userSettings.updatedAt) : undefined)
                };
            }

            firestoreUserData = {
              uid: rawData.uid,
              email: rawData.email,
              displayName: rawData.displayName,
              photoURL: rawData.photoURL,
              activePlanId: rawData.activePlanId || 'free',
              createdAt: createdAtDate,
              subscriptionEndDate: subscriptionEndDateDate,
              userSettings: userSettingsWithDate,
            };
          }

          setState(prevState => ({ ...prevState, user, userData: firestoreUserData, isLoading: false, error: null }));
          
          await loadUserSubscription(); // Bu fonksiyon da UserData'daki Date tipine göre ayarlanmalı
          
          const currentPlan = useSubscriptionStore.getState().activePlanId;
          if (currentPlan === 'premium' && firestoreUserData) {
            console.log("Premium user detected, should sync from Firestore (TODO)");
            await loadFoods();
            await loadActivities();
            await loadCalorieGoals();
          } else {
            console.log("Free/Basic user or no specific userData, loading data from local storage.");
            await loadFoods();
            await loadActivities();
            await loadCalorieGoals();
          }

        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
          setState(prevState => ({ ...prevState, user, isLoading: false, error: (error as Error).message }));
          await loadFoods();
          await loadActivities();
          await loadCalorieGoals();
        }

      } else {
        setState({ user: null, userData: null, isLoading: false, error: null });
        await resetSubscriptionStore();
        await resetFoodStore();
        await resetActivityStore();
        await resetCalorieGoalStore();
      }
    });

    return () => unsubscribe();
  }, [loadUserSubscription, resetSubscriptionStore, resetFoodStore, loadFoods, resetActivityStore, loadActivities, resetCalorieGoalStore, loadCalorieGoals]);


  const signIn = useCallback(async (credentials: SignInCredentials): Promise<void> => {
    setState(prevState => ({ ...prevState, isLoading: true, error: null }));
    try {
      await firebaseAuth.signInWithEmailAndPassword(
        credentials.email,
        credentials.password
      );
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: (error as Error).message,
      }));
      throw error;
    }
  }, []);

  const signUp = useCallback(async (credentials: SignUpCredentials): Promise<void> => {
    setState(prevState => ({ ...prevState, isLoading: true, error: null }));
    try {
      const userCredential = await firebaseAuth.createUserWithEmailAndPassword(
        credentials.email,
        credentials.password
      );

      if (userCredential.user) {
        await userCredential.user.updateProfile({
          displayName: credentials.displayName,
        });

        const userDocRef = doc(firebaseFirestore, 'users', userCredential.user.uid);
        // UserData Firestore'a yazılırken createdAt serverTimestamp olmalı,
        // subscriptionEndDate ise Timestamp.fromDate veya null olmalı.
        // Ancak UserData tipimiz artık Date bekliyor, bu yüzden yazarken FieldValue kullanacağız.
        const userDataForFirestore = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: credentials.displayName,
          photoURL: userCredential.user.photoURL,
          createdAt: serverTimestamp(), // Firestore'a serverTimestamp olarak yazılacak
          activePlanId: 'free' as 'free' | 'basic' | 'premium',
          subscriptionEndDate: null, // Firestore'a null olarak yazılacak
        };
        await setDoc(userDocRef, userDataForFirestore);
      }
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: (error as Error).message,
      }));
      throw error;
    }
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<void> => {
    setState(prevState => ({ ...prevState, isLoading: true, error: null }));
    try {
      const googleUserCredential = await GoogleAuthService.signIn();
      if (googleUserCredential && googleUserCredential.user) {
        const userDocRef = doc(firebaseFirestore, 'users', googleUserCredential.user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
          const userDataForFirestore = { // Firestore'a yazılacak tip
            uid: googleUserCredential.user.uid,
            email: googleUserCredential.user.email,
            displayName: googleUserCredential.user.displayName,
            photoURL: googleUserCredential.user.photoURL,
            createdAt: serverTimestamp(),
            activePlanId: 'free' as 'free' | 'basic' | 'premium',
            subscriptionEndDate: null,
          };
          await setDoc(userDocRef, userDataForFirestore);
        }
      }
    } catch (error) {
      console.log('Google sign in error in AuthContext:', error);
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: (error as Error).message,
      }));
      throw error;
    }
  }, []);

  const signOutUser = useCallback(async (): Promise<void> => {
    try {
      await GoogleAuthService.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: (error as Error).message,
      }));
      throw error;
    }
  }, []);

  const resetError = useCallback((): void => {
    setState(prevState => ({ ...prevState, error: null }));
  }, []);


  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        userData: state.userData,
        isLoading: state.isLoading,
        error: state.error,
        signIn,
        signUp,
        signOut: signOutUser,
        resetError,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};