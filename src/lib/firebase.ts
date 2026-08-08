import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  orderBy
} from 'firebase/firestore';
import firebaseAppletConfig from '../../firebase-applet-config.json';

const getEffectiveDatabaseId = (): string | undefined => {
  const envDbId = import.meta.env.VITE_FIREBASE_DATABASE_ID;
  if (envDbId && typeof envDbId === 'string' && envDbId.trim() !== '' && envDbId.trim().toLowerCase() !== 'default') {
    return envDbId.trim();
  }
  const appletDbId = firebaseAppletConfig.firestoreDatabaseId;
  if (appletDbId && typeof appletDbId === 'string' && appletDbId.trim() !== '' && appletDbId.trim().toLowerCase() !== 'default') {
    return appletDbId.trim();
  }
  return undefined;
};

const databaseId = getEffectiveDatabaseId();

const getConfigValue = (envVal: string | undefined, fallbackVal: string | undefined): string => {
  if (envVal && typeof envVal === 'string' && envVal.trim() !== '' && envVal !== 'undefined' && envVal !== 'null') {
    return envVal.trim();
  }
  return (fallbackVal || '').trim();
};

const activeConfig = {
  apiKey: getConfigValue(import.meta.env.VITE_FIREBASE_API_KEY, firebaseAppletConfig.apiKey),
  authDomain: getConfigValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, firebaseAppletConfig.authDomain),
  projectId: getConfigValue(import.meta.env.VITE_FIREBASE_PROJECT_ID, firebaseAppletConfig.projectId),
  storageBucket: getConfigValue(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, firebaseAppletConfig.storageBucket),
  messagingSenderId: getConfigValue(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, firebaseAppletConfig.messagingSenderId),
  appId: getConfigValue(import.meta.env.VITE_FIREBASE_APP_ID, firebaseAppletConfig.appId),
};

const app = getApps().length === 0 ? initializeApp(activeConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  orderBy
};
export type { FirebaseUser };
