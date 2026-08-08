import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import firebaseAppletConfig from '../../firebase-applet-config.json';

function sanitizeValue(val: string | undefined): string {
  if (!val || typeof val !== 'string') return '';
  let str = val.trim();
  if (str === 'undefined' || str === 'null') return '';
  str = str.replace(/^["']|["']$/g, '').trim();
  if (str.includes('=')) {
    const parts = str.split('=');
    str = parts[parts.length - 1].trim().replace(/^["']|["']$/g, '');
  }
  return str;
}

function getValidApiKey(envKey: string | undefined, fallbackKey: string | undefined): string {
  const cleanEnv = sanitizeValue(envKey);
  const cleanFallback = sanitizeValue(fallbackKey);

  if (cleanEnv && cleanEnv.startsWith('AIza')) {
    return cleanEnv;
  }
  if (cleanFallback && cleanFallback.startsWith('AIza')) {
    return cleanFallback;
  }
  return cleanEnv || cleanFallback || '';
}

function getValidConfigValue(envVal: string | undefined, fallbackVal: string | undefined): string {
  const cleanEnv = sanitizeValue(envVal);
  const cleanFallback = sanitizeValue(fallbackVal);
  return cleanEnv || cleanFallback || '';
}

const getEffectiveDatabaseId = (): string | undefined => {
  const envDbId = sanitizeValue(import.meta.env.VITE_FIREBASE_DATABASE_ID);
  if (envDbId && envDbId.toLowerCase() !== 'default') {
    return envDbId;
  }
  const appletDbId = sanitizeValue(firebaseAppletConfig.firestoreDatabaseId);
  if (appletDbId && appletDbId.toLowerCase() !== 'default') {
    return appletDbId;
  }
  return undefined;
};

const databaseId = getEffectiveDatabaseId();

const activeConfig = {
  apiKey: getValidApiKey(import.meta.env.VITE_FIREBASE_API_KEY, firebaseAppletConfig.apiKey),
  authDomain: getValidConfigValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, firebaseAppletConfig.authDomain),
  projectId: getValidConfigValue(import.meta.env.VITE_FIREBASE_PROJECT_ID, firebaseAppletConfig.projectId),
  storageBucket: getValidConfigValue(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, firebaseAppletConfig.storageBucket),
  messagingSenderId: getValidConfigValue(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, firebaseAppletConfig.messagingSenderId),
  appId: getValidConfigValue(import.meta.env.VITE_FIREBASE_APP_ID, firebaseAppletConfig.appId),
};

const app = getApps().length === 0 ? initializeApp(activeConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

let dbInstance: ReturnType<typeof getFirestore>;

try {
  if (databaseId) {
    dbInstance = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    }, databaseId);
  } else {
    dbInstance = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
  }
} catch (err) {
  if (databaseId) {
    dbInstance = getFirestore(app, databaseId);
  } else {
    dbInstance = getFirestore(app);
  }
}

export const db = dbInstance;
export default app;
