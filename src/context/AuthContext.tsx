// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useCallback, useState } from 'react';
import { firebaseAuth, firebaseFirestore } from '../firebase/firebase.config';
import { doc, setDoc, getDoc, serverTimestamp, Timestamp, updateDoc } from '@react-native-firebase/firestore';
import {
  AuthContextProps,
  SignInCredentials,
  SignUpCredentials,
  User,
  UserData
} from '../types/auth';
import GoogleAuthService from '../firebase/google-auth';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { useFoodStore, FoodItem } from '../store/foodStore';
import { useActivityStore } from '../store/activityStore';
import { useCalorieGoalStore, NutrientGoals } from '../store/calorieGoalStore';
import { fetchAllDataForUser, processFirestoreDataForStores } from '../services/syncService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const authInitialState: {
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
  const [state, setState] = useState(authInitialState);
  // Store action'larını useEffect dışında alalım veya doğrudan getState() ile çağıralım.
  // useEffect'in bağımlılık dizisini olabildiğince sabit tutmaya çalışalım.

  useEffect(() => {
    GoogleAuthService.init();
  }, []);

  useEffect(() => {
    // Bu fonksiyonlar useEffect dışında tanımlı olmadığı için,
    // her renderda yeniden oluşturulmuyorlar ve bağımlılık dizisinde sorun yaratmazlar.
    // Ancak, store'lardan doğrudan getState() ile erişmek daha temiz olabilir.
    const subStoreActions = useSubscriptionStore.getState();
    const foodStoreActions = useFoodStore.getState();
    const activityStoreActions = useActivityStore.getState();
    const calorieStoreActions = useCalorieGoalStore.getState();

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
            const createdAtDate = rawData.createdAt instanceof Timestamp
              ? rawData.createdAt.toDate()
              : (rawData.createdAt ? new Date(rawData.createdAt as any) : new Date());
            
            const subscriptionEndDateDate = rawData.subscriptionEndDate instanceof Timestamp
              ? rawData.subscriptionEndDate.toDate()
              : null;

            let userSettingsWithDate: UserData['userSettings'] = undefined;
            if (rawData.userSettings) {
                userSettingsWithDate = {
                    ...rawData.userSettings,
                    updatedAt: rawData.userSettings.updatedAt instanceof Timestamp
                        ? rawData.userSettings.updatedAt.toDate()
                        : (rawData.userSettings.updatedAt ? new Date(rawData.userSettings.updatedAt as any) : undefined)
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
          
          // Doğrudan getState() üzerinden action'ları çağır
          await useSubscriptionStore.getState().loadUserSubscription();
          
          const activePlan = useSubscriptionStore.getState().activePlanId;

          if (activePlan === 'premium') {
            console.log("Premium user detected. Fetching data from Firestore.");
            const firestoreSyncData = await fetchAllDataForUser(authUser.uid);
            
            const localFoods = useFoodStore.getState().foods;
            const localActivities = useActivityStore.getState().activities;

            const processedData = processFirestoreDataForStores(localFoods, localActivities, firestoreSyncData);
            
            useFoodStore.getState().setFoods(processedData.mergedMeals);
            useActivityStore.getState().setActivities(processedData.mergedActivities);
            if (processedData.newCalorieGoal !== undefined) {
              useCalorieGoalStore.setState({ calorieGoal: processedData.newCalorieGoal });
              await AsyncStorage.setItem('calorie_goal', processedData.newCalorieGoal.toString());
            }
            if (processedData.newNutrientGoals) {
              useCalorieGoalStore.setState({ nutrientGoals: processedData.newNutrientGoals });
              await AsyncStorage.setItem('nutrient_goals', JSON.stringify(processedData.newNutrientGoals));
            }

          } else {
            console.log("Free/Basic user. Loading data from local storage.");
            await useFoodStore.getState().loadFoods();
            await useActivityStore.getState().loadActivities();
            await useCalorieGoalStore.getState().loadGoals();
          }

        } catch (error) {
          console.error("Error during onAuthStateChanged processing:", error);
          setState(prevState => ({ ...prevState, user, isLoading: false, error: (error as Error).message }));
          await useFoodStore.getState().loadFoods();
          await useActivityStore.getState().loadActivities();
          await useCalorieGoalStore.getState().loadGoals();
        }

      } else {
        setState({ user: null, userData: null, isLoading: false, error: null });
        await useSubscriptionStore.getState().reset();
        await useFoodStore.getState().reset();
        await useActivityStore.getState().reset();
        await useCalorieGoalStore.getState().reset();
      }
    });

    return () => unsubscribe();
  }, []); // Bağımlılık dizisini boş bırakmayı deneyelim. Store action'ları zaten global.


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
        const userDataForFirestore = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: credentials.displayName,
          photoURL: userCredential.user.photoURL,
          createdAt: serverTimestamp(),
          activePlanId: 'free' as 'free' | 'basic' | 'premium',
          subscriptionEndDate: null,
          userSettings: {
            calorieGoal: 2000,
            nutrientGoals: { protein: 100, carbs: 250, fat: 65 },
            updatedAt: serverTimestamp(),
          }
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
          const userDataForFirestore = {
            uid: googleUserCredential.user.uid,
            email: googleUserCredential.user.email,
            displayName: googleUserCredential.user.displayName,
            photoURL: googleUserCredential.user.photoURL,
            createdAt: serverTimestamp(),
            activePlanId: 'free' as 'free' | 'basic' | 'premium',
            subscriptionEndDate: null,
            userSettings: {
              calorieGoal: 2000,
              nutrientGoals: { protein: 100, carbs: 250, fat: 65 },
              updatedAt: serverTimestamp(),
            }
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