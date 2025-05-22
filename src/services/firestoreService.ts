// src/services/firestoreService.ts
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    serverTimestamp,
    Timestamp,
    onSnapshot,
    FieldValue,
} from '@react-native-firebase/firestore';
import { firebaseFirestore, firebaseAuth } from '../firebase/firebase.config';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type QueryConstraint = ReturnType<typeof where> | ReturnType<typeof orderBy> | ReturnType<typeof limit>;
export type DocumentData = FirebaseFirestoreTypes.DocumentData;
export type DocumentReference<T = DocumentData> = FirebaseFirestoreTypes.DocumentReference<T>;
export type SetOptions = FirebaseFirestoreTypes.SetOptions;
export type Unsubscribe = () => void;

interface FirebaseErrorWithCode extends Error {
  code?: string;
}

const getCurrentUserId = (): string | null => {
  return firebaseAuth.currentUser?.uid || null;
};

const convertDatesToTimestamps = (data: any): any => {
    if (data === null || typeof data !== 'object') {
        return data;
    }
    if (data instanceof Date) {
        return Timestamp.fromDate(data);
    }
    if (data instanceof Timestamp || data instanceof FieldValue) {
        return data;
    }

    const newData: any = Array.isArray(data) ? [] : {};
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const value = data[key];
            if (value instanceof Date) {
                newData[key] = Timestamp.fromDate(value);
            } else if (typeof value === 'object' && value !== null && !(value instanceof Timestamp) && !(value instanceof FieldValue)) {
                newData[key] = convertDatesToTimestamps(value);
            } else {
                newData[key] = value;
            }
        }
    }
    return newData;
};

const handleFirestoreError = (e: unknown, contextMessage: string): never => {
  const error = e as FirebaseErrorWithCode;
  console.error(`${contextMessage}:`, error.message, error.code || '');
  throw error;
};

export const addOrSetDocument = async <T extends object>(
    collectionPath: string,
    data: T,
    docId?: string,
    options?: SetOptions
): Promise<DocumentReference<T> | string> => {
    try {
        const dataForFirestore: any = convertDatesToTimestamps({ ...data }); // any kullandık esneklik için

        if (!Object.prototype.hasOwnProperty.call(dataForFirestore, 'createdAt') || !(dataForFirestore.createdAt instanceof Timestamp)) {
            dataForFirestore.createdAt = serverTimestamp();
        }
        dataForFirestore.updatedAt = serverTimestamp();

        if (docId) {
            const docRef = doc(firebaseFirestore, collectionPath, docId) as DocumentReference<T>;
            await setDoc(docRef, dataForFirestore, options || {});
            return docId;
        } else {
            const collectionRef = collection(firebaseFirestore, collectionPath) as FirebaseFirestoreTypes.CollectionReference<T>;
            const docRef = await addDoc(collectionRef, dataForFirestore);
            return docRef;
        }
    } catch (e) {
        return handleFirestoreError(e, `Error adding/setting document to ${collectionPath}/${docId || '(auto-id)'}`);
    }
};

export const setDocument = async <T extends object>(
    docPath: string,
    data: T,
    options?: SetOptions
): Promise<void> => {
    try {
        const docRef = doc(firebaseFirestore, docPath) as DocumentReference<T>;
        const dataForFirestore: any = convertDatesToTimestamps({ ...data });

        if (!Object.prototype.hasOwnProperty.call(dataForFirestore, 'createdAt') || !(dataForFirestore.createdAt instanceof Timestamp)) {
            dataForFirestore.createdAt = serverTimestamp();
        }
        dataForFirestore.updatedAt = serverTimestamp();

        await setDoc(docRef, dataForFirestore, options || {});
    } catch (e) {
        return handleFirestoreError(e, `Error setting document at ${docPath}`);
    }
};

export const getDocument = async <T extends DocumentData>(docPath: string): Promise<T | null> => {
    try {
        const docRef = doc(firebaseFirestore, docPath) as DocumentReference<T>;
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data() as T;
            const convertedData: any = { id: docSnap.id, ...data };
            for (const key in convertedData) {
                if (convertedData[key] instanceof Timestamp) {
                    convertedData[key] = convertedData[key].toDate();
                }
            }
            return convertedData as T;
        }
        return null;
    } catch (e) {
        return handleFirestoreError(e, `Error getting document from ${docPath}`);
    }
};

export const updateDocument = async <T extends object>(
    docPath: string,
    data: Partial<T>
): Promise<void> => {
    try {
        const docRef = doc(firebaseFirestore, docPath) as DocumentReference<DocumentData>;
        const dataForFirestore = convertDatesToTimestamps({ ...data });

        const dataToUpdate: { [key: string]: any } = {
            ...dataForFirestore,
            updatedAt: serverTimestamp(),
        };
        await updateDoc(docRef, dataToUpdate);
    } catch (e) {
        return handleFirestoreError(e, `Error updating document at ${docPath}`);
    }
};

export const deleteDocument = async (docPath: string): Promise<void> => {
    try {
        const docRef = doc(firebaseFirestore, docPath);
        await deleteDoc(docRef);
    } catch (e) {
        return handleFirestoreError(e, `Error deleting document from ${docPath}`);
    }
};

export const getCollection = async <T extends DocumentData>(
    collectionPath: string,
    queryConstraints: QueryConstraint[] = []
): Promise<T[]> => {
    try {
        const collectionRef = collection(firebaseFirestore, collectionPath) as FirebaseFirestoreTypes.CollectionReference<T>;
        const q = query(collectionRef, ...queryConstraints);
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(docSnap => {
            const data = docSnap.data();
            const convertedData: any = { id: docSnap.id, ...data };
            for (const key in convertedData) {
                if (convertedData[key] instanceof Timestamp) {
                    convertedData[key] = convertedData[key].toDate();
                }
            }
            return convertedData as T;
        });
    } catch (e) {
       return handleFirestoreError(e, `Error getting collection from ${collectionPath}`);
    }
};

export const getCollectionRealtime = <T extends DocumentData>(
    collectionPath: string,
    callback: (data: T[]) => void,
    queryConstraints: QueryConstraint[] = []
): Unsubscribe => {
    const collectionRef = collection(firebaseFirestore, collectionPath) as FirebaseFirestoreTypes.CollectionReference<T>;
    const q = query(collectionRef, ...queryConstraints);

    const unsubscribeFn = onSnapshot(q, (querySnapshot) => {
        const dataList = querySnapshot.docs.map(docSnap => {
            const data = docSnap.data();
            const convertedData: any = { id: docSnap.id, ...data };
            for (const key in convertedData) {
                if (convertedData[key] instanceof Timestamp) {
                    convertedData[key] = convertedData[key].toDate();
                }
            }
            return convertedData as T;
        });
        callback(dataList);
    }, (e) => {
        const error = e as FirebaseErrorWithCode;
        console.error(`Error in realtime listener for ${collectionPath}:`, error.message, error.code || '');
    });

    return unsubscribeFn;
};

export const getDocumentRealtime = <T extends DocumentData>(
    docPath: string,
    callback: (data: T | null) => void
): Unsubscribe => {
    const docRef = doc(firebaseFirestore, docPath) as DocumentReference<T>;

    const unsubscribeFn = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const convertedData: any = { ...data };
            for (const key in convertedData) {
                if (convertedData[key] instanceof Timestamp) {
                    convertedData[key] = convertedData[key].toDate();
                }
            }
            callback(convertedData as T);
        } else {
            callback(null);
        }
    }, (e) => {
        const error = e as FirebaseErrorWithCode;
        console.error(`Error in realtime listener for document ${docPath}:`, error.message, error.code || '');
    });

    return unsubscribeFn;
};

export { getCurrentUserId, serverTimestamp, Timestamp, where, orderBy, limit, startAfter, collection, doc, query, FieldValue };