// src/services/syncService.ts
import { FoodItem, useFoodStore } from '../store/foodStore';
import { ActivityItem } from '../types/activity'; // types/activity.ts'den import et
import { useActivityStore } from '../store/activityStore';
import { NutrientGoals, useCalorieGoalStore } from '../store/calorieGoalStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
// UserData tipine ihtiyaç yok gibi, UserSettingsFirestore yeterli
import {
  addOrSetDocument,
  deleteDocument,
  getDocument,
  getCollection,
  updateDocument,
  getCurrentUserId,
  Timestamp, // Timestamp'i firestoreService'den (veya direkt Firebase'den) al
  FieldValue, // FieldValue'yu firestoreService'den import et
} from './firestoreService'; // serverTimestamp zaten firestoreService içinde kullanılıyor

interface UserSettingsFirestore {
  calorieGoal?: number;
  nutrientGoals?: NutrientGoals;
  preferredTheme?: string;
  updatedAt?: FieldValue | Timestamp | Date; // Date eklendi (okuma sonrası için)
}

const isPremiumUser = (): boolean => {
  return useSubscriptionStore.getState().activePlanId === 'premium';
};

export const syncItemUpstream = async (
  collectionName: 'meals' | 'activities',
  item: FoodItem | ActivityItem // Store'dan gelen item Date objeleri içermeli
): Promise<void> => {
  if (!isPremiumUser()) return;
  const userId = getCurrentUserId();
  if (!userId || !item.id) return;

  const docPath = `users/${userId}/${collectionName}/${item.id}`;
  try {
    // `item` objesi zaten Date objelerini içeriyor olmalı (createdAt, updatedAt).
    // `addOrSetDocument` bu Date'leri Firestore Timestamp'lerine çevirecek
    // ve `serverTimestamp()` kullanarak eksikse createdAt'i, her zaman updatedAt'i ayarlayacak.
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
  if (!isPremiumUser()) return;
  const userId = getCurrentUserId();
  if (!userId) return;

  const docPath = `users/${userId}/${collectionName}/${itemId}`;
  try {
    await deleteDocument(docPath);
    console.log(`${collectionName} item ${itemId} deleted from Firestore for user ${userId}`);
  } catch (error) {
    console.error(`Error deleting item ${itemId} from Firestore:`, error);
  }
};

export const syncUserSettingsUpstream = async (settings: {
  calorieGoal: number;
  nutrientGoals: NutrientGoals;
}): Promise<void> => {
  if (!isPremiumUser()) return;
  const userId = getCurrentUserId();
  if (!userId) return;

  const userDocPath = `users/${userId}`;
  const settingsToUpdate = {
    userSettings: {
      calorieGoal: settings.calorieGoal,
      nutrientGoals: settings.nutrientGoals,
      // updatedAt: serverTimestamp(), // updateDocument bunu otomatik ekler
    },
  };

  try {
    // updateDocument içinde data objesi Partial<T> olmalı.
    // userSettings alanı UserData'da opsiyonel olduğu için bu şekilde göndermek uygun.
    await updateDocument<{ userSettings?: Partial<UserSettingsFirestore> }>(userDocPath, settingsToUpdate);
    console.log(`User settings synced upstream for user ${userId}`);
  } catch (error) {
    console.error(`Error syncing user settings upstream for user ${userId}:`, error);
  }
};

export const fetchAllDataForUser = async (): Promise<{
  meals: FoodItem[];
  activities: ActivityItem[];
  userSettings: UserSettingsFirestore | null;
}> => {
  const userId = getCurrentUserId();
  if (!userId || !isPremiumUser()) {
    return { meals: [], activities: [], userSettings: null };
  }

  console.log(`Fetching all data for premium user ${userId}`);
  try {
    const mealsPath = `users/${userId}/meals`;
    const activitiesPath = `users/${userId}/activities`;
    const userDocPath = `users/${userId}`;

    // firestoreService.getDocument UserData'nın userSettings alanını dönecek
    // Bu alan zaten UserSettingsFirestore tipinde (veya ona uyumlu) olmalı
    // ve içindeki Timestamp'ler Date'e çevrilmiş olmalı.
    const [mealsData, activitiesData, userDocData] = await Promise.all([
      getCollection<FoodItem>(mealsPath),
      getCollection<ActivityItem>(activitiesPath),
      getDocument<{ userSettings?: UserSettingsFirestore }>(userDocPath),
    ]);
    
    const userSettings = userDocData?.userSettings || null;

    return {
      meals: mealsData, // Zaten Date objeleri içermeli
      activities: activitiesData, // Zaten Date objeleri içermeli
      userSettings, // Zaten Date objeleri içermeli (updatedAt)
    };
  } catch (error) {
    console.error(`Error fetching all data for user ${userId}:`, error);
    return { meals: [], activities: [], userSettings: null };
  }
};

export const syncDownstreamDataToStores = (data: {
  meals: FoodItem[]; // Date objeleri içermeli
  activities: ActivityItem[]; // Date objeleri içermeli
  userSettings: UserSettingsFirestore | null; // Date objeleri içermeli
}) => {
  const { setFoods, foods: localFoods } = useFoodStore.getState();
  const { setActivities, activities: localActivities } = useActivityStore.getState();

  const mergedMeals = mergeData(localFoods, data.meals);
  setFoods(mergedMeals); // setFoods Date objelerini alıp AsyncStorage'a string olarak yazar

  const mergedActivities = mergeData(localActivities, data.activities);
  setActivities(mergedActivities);

  if (data.userSettings) {
    const { calorieGoal, nutrientGoals } = data.userSettings;
    if (calorieGoal !== undefined) {
      useCalorieGoalStore.setState({ calorieGoal });
    }
    if (nutrientGoals) {
      useCalorieGoalStore.setState({ nutrientGoals });
    }
  }
  console.log('Data synced downstream to stores.');
};

const mergeData = <T extends { id: string; updatedAt?: Date | Timestamp | string | FieldValue }>(
  localData: T[],
  firestoreData: T[] // Bu veri firestoreService.getCollection'dan geldiği için Date objeleri içermeli
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
            return 0; // FieldValue (örn: serverTimestamp()) veya undefined ise
        };

        const localUpdatedAtTime = getTimestampTime(localItem.updatedAt);
        const firestoreUpdatedAtTime = getTimestampTime(firestoreItem.updatedAt);

        // Eğer Firestore'dan gelenin updatedAt'i serverTimestamp() ise (getTimestampTime 0 döner),
        // ve lokalde bir tarih varsa, lokaldeki daha güvenilir olabilir (çünkü henüz sunucuya yazılmamış).
        // Ancak genel kural olarak, sunucudaki daha yeni kabul edilir.
        // Bu mantık daha da karmaşıklaştırılabilir (örn: "pending writes" takibi).
        // Şimdilik basit tutalım:
        if (firestoreUpdatedAtTime >= localUpdatedAtTime) {
            merged.push(firestoreItem);
        } else {
            merged.push(localItem);
        }
        firestoreMap.delete(localItem.id);
    } else {
        // Lokal item Firestore'da yoksa, ekle (çevrimdışı oluşturulmuş olabilir)
        merged.push(localItem);
    }
  });

  // Firestore'da olup lokalde olmayan item'ları ekle
  firestoreMap.forEach(firestoreItem => merged.push(firestoreItem));
  return merged;
};