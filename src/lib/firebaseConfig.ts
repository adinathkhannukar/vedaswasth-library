import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const FIREBASE_CONFIG_KEY = 'veda_swasth_firebase_config';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export function getStoredFirebaseConfig(): FirebaseConfig {
  const data = localStorage.getItem(FIREBASE_CONFIG_KEY);
  if (!data) {
    return {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: ''
    };
  }
  try {
    return JSON.parse(data);
  } catch {
    return {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: ''
    };
  }
}

export function saveFirebaseConfig(config: FirebaseConfig) {
  localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
}

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firestoreDb: Firestore | null = null;
let firebaseStorage: FirebaseStorage | null = null;

export function initFirebase() {
  const config = getStoredFirebaseConfig();
  if (!config.apiKey || !config.projectId) {
    return null;
  }
  try {
    const apps = getApps();
    if (apps.length > 0) {
      firebaseApp = apps[0];
    } else {
      firebaseApp = initializeApp(config);
    }
    firebaseAuth = getAuth(firebaseApp);
    firestoreDb = getFirestore(firebaseApp);
    firebaseStorage = getStorage(firebaseApp);
    return { app: firebaseApp, auth: firebaseAuth, db: firestoreDb, storage: firebaseStorage };
  } catch (err) {
    console.error('Error initializing Firebase:', err);
    return null;
  }
}
