// src/services/syncService.ts
import { FoodItem } from '../store/foodStore';
import { ActivityItem } from '../types/activity';
import { NutrientGoals } from '../store/calorieGoalStore';
import {
  addOrSetDocument,
  deleteDocument,
  getDocument,
  getCollection,
  updateDocument,
  getCurrentUserId,
  Timestamp,
  FieldValue, // FieldValue'yu firestoreService'den import et
} from './firestoreService';

interface UserSettingsFirestore {
  calorieGoal?: number;
  nutrientGoals?: NutrientGoals;
  preferredTheme?: string;
  updatedAt?: FieldValue | Timestamp | Date;
}

// DÜZELTME: Tüm fonksiyonları export et
export const syncItemUpstream = async (
  collectionName: 'meals' | 'activities',
  item: FoodItem | ActivityItem
): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId || !item.id) return; // Premium kontrolü çağıran yerde yapılacak

  const docPath = `users/${userId}/${collectionName}/${item.id}`;
  try {
    await addOrSetDocument(docPath, { ...item }, item.id, { merge: true });
    console.log(`${collectionName} item ${item.id} synced upstream for user ${userId}`);
  } catch (error) {
    console.error(`Error syncing item ${item.id} upstream:`, error);
  }
};

export const deleteItemFromFirestore = async (
  collectionName: 'meals' | 'activities',
  itemId: string
): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) return; // Premium kontrolü çağıran yerde yapılacak

  const docPath = `users/${userId}/${collectionName}/${itemId}`;
  try {
    await deleteDocument(docPath);
    console.log(`${collectionName} item ${itemId} deleted from Firestore for user ${userId}`);
  } catch (error) {
    console.error(`Error deleting item ${itemId} from Firestore:`, error);
  }
};

export const syncUserSettingsUpstream = async (
  userId: string,
  settings: {
    calorieGoal: number;
    nutrientGoals: NutrientGoals;
  }
): Promise<void> => {
  if (!userId) return; // Premium kontrolü çağıran yerde yapılacak

  const userDocPath = `users/${userId}`;
  const settingsToUpdate = {
    userSettings: {
      calorieGoal: settings.calorieGoal,
      nutrientGoals: settings.nutrientGoals,
    },
  };

  try {
    await updateDocument<{ userSettings?: Partial<UserSettingsFirestore> }>(userDocPath, settingsToUpdate);
    console.log(`User settings synced upstream for user ${userId}`);
  } catch (error) {
    console.error(`Error syncing user settings upstream for user ${userId}:`, error);
  }
};

export const fetchAllDataForUser = async (
  userId: string
): Promise<{
  meals: FoodItem[];
  activities: ActivityItem[];
  userSettings: UserSettingsFirestore | null;
}> => {
  if (!userId) { // Premium kontrolü çağıran yerde yapılacak
    return { meals: [], activities: [], userSettings: null };
  }

  console.log(`Fetching all data for premium user ${userId}`);
  try {
    const mealsPath = `users/${userId}/meals`;
    const activitiesPath = `users/${userId}/activities`;
    const userDocPath = `users/${userId}`;

    const [mealsData, activitiesData, userDocData] = await Promise.all([
      getCollection<FoodItem>(mealsPath),
      getCollection<ActivityItem>(activitiesPath),
      getDocument<{ userSettings?: UserSettingsFirestore }>(userDocPath),
    ]);
    
    const userSettings = userDocData?.userSettings || null;

    return {
      meals: mealsData,
      activities: activitiesData,
      userSettings,
    };
  } catch (error) {
    console.error(`Error fetching all data for user ${userId}:`, error);
    return { meals: [], activities: [], userSettings: null };
  }
};

export const processFirestoreDataForStores = (
  localFoods: FoodItem[],
  localActivities: ActivityItem[],
  data: {
    meals: FoodItem[];
    activities: ActivityItem[];
    userSettings: UserSettingsFirestore | null;
  }
): {
  mergedMeals: FoodItem[];
  mergedActivities: ActivityItem[];
  newCalorieGoal?: number;
  newNutrientGoals?: NutrientGoals;
} => {
  const mergedMeals = mergeData(localFoods, data.meals);
  const mergedActivities = mergeData(localActivities, data.activities);

  let newCalorieGoal: number | undefined;
  let newNutrientGoals: NutrientGoals | undefined;

  if (data.userSettings) {
    if (data.userSettings.calorieGoal !== undefined) {
      newCalorieGoal = data.userSettings.calorieGoal;
    }
    if (data.userSettings.nutrientGoals) {
      newNutrientGoals = data.userSettings.nutrientGoals;
    }
  }
  console.log('Firestore data processed for stores.');
  return { mergedMeals, mergedActivities, newCalorieGoal, newNutrientGoals };
};

const mergeData = <T extends { id: string; updatedAt?: Date | Timestamp | string | FieldValue }>(
  localData: T[],
  firestoreData: T[]
): T[] => {
  const firestoreMap = new Map(firestoreData.map(item => [item.id, item]));
  const merged: T[] = [];

  localData.forEach(localItem => {
    const firestoreItem = firestoreMap.get(localItem.id);
    if (firestoreItem) {
        const getTimestampTime = (dateVal: Date | Timestamp | string | FieldValue | undefined): number => {
            if (dateVal instanceof Date) return dateVal.getTime();
            if (dateVal instanceof Timestamp) return dateVal.toMillis();
            if (typeof dateVal === 'string') {
                const d = new Date(dateVal);
                return isNaN(d.getTime()) ? 0 : d.getTime();
            }
            return 0;
        };

        const localUpdatedAtTime = getTimestampTime(localItem.updatedAt);
        const firestoreUpdatedAtTime = getTimestampTime(firestoreItem.updatedAt);

        if (firestoreUpdatedAtTime >= localUpdatedAtTime) {
            merged.push(firestoreItem);
        } else {
            merged.push(localItem);
        }
        firestoreMap.delete(localItem.id);
    } else {
        merged.push(localItem);
    }
  });

  firestoreMap.forEach(firestoreItem => merged.push(firestoreItem));
  return merged;
};