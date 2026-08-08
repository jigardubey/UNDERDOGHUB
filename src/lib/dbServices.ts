import { 
  db, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  addDoc
} from './firebase';
import { Tournament, VerificationRequest, CustomMatch, UserProfile, ActivityLog, PaymentSettings } from '../types';

// Collection references
const TOURNAMENTS_COL = 'tournaments';
const VERIFICATION_COL = 'verificationRequests';
const SETTINGS_COL = 'settings';
const USERS_COL = 'users';
const USER_DATA_COL = 'userUserData';
const LOGS_COL = 'activityLogs';

/**
 * 1. TOURNAMENTS FIRESTORE SYNC
 */
export function subscribeTournamentsDb(onUpdate: (tournaments: Tournament[]) => void) {
  try {
    const colRef = collection(db, TOURNAMENTS_COL);
    return onSnapshot(
      colRef, 
      (snapshot) => {
        const list: Tournament[] = [];
        snapshot.forEach((docSnap) => {
          if (docSnap.exists()) {
            list.push({ id: docSnap.id, ...docSnap.data() } as Tournament);
          }
        });
        onUpdate(list);
      },
      (error) => {
        console.warn('Firestore tournaments subscription warning:', error.message);
      }
    );
  } catch (err) {
    console.warn('Firestore not reachable yet, falling back to local storage.');
    return () => {};
  }
}

export async function saveTournamentToDb(tournament: Tournament): Promise<boolean> {
  try {
    const docRef = doc(db, TOURNAMENTS_COL, tournament.id);
    await setDoc(docRef, tournament, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving tournament to Firestore:', err);
    return false;
  }
}

export async function deleteTournamentFromDb(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, TOURNAMENTS_COL, id);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Error deleting tournament from Firestore:', err);
    return false;
  }
}

/**
 * 2. VERIFICATION REQUESTS FIRESTORE SYNC
 */
export function subscribeVerificationRequestsDb(onUpdate: (requests: VerificationRequest[]) => void) {
  try {
    const colRef = collection(db, VERIFICATION_COL);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: VerificationRequest[] = [];
        snapshot.forEach((docSnap) => {
          if (docSnap.exists()) {
            list.push({ id: docSnap.id, ...docSnap.data() } as VerificationRequest);
          }
        });
        onUpdate(list);
      },
      (error) => {
        console.warn('Firestore verification subscription warning:', error.message);
      }
    );
  } catch (err) {
    return () => {};
  }
}

export async function saveVerificationRequestToDb(request: VerificationRequest): Promise<boolean> {
  try {
    const docRef = doc(db, VERIFICATION_COL, request.id);
    await setDoc(docRef, request, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving verification request to Firestore:', err);
    return false;
  }
}

/**
 * 3. GLOBAL SETTINGS FIRESTORE SYNC (Fee, PaymentSettings, Admin Passcode)
 */
export function subscribeSettingsDb(onUpdate: (data: { verificationFee?: number; adminPasscode?: string; paymentSettings?: Partial<PaymentSettings> }) => void) {
  try {
    const docRef = doc(db, SETTINGS_COL, 'global');
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate(docSnap.data());
        }
      },
      (error) => {
        console.warn('Firestore settings subscription warning:', error.message);
      }
    );
  } catch (err) {
    return () => {};
  }
}

export async function saveSettingsToDb(data: { verificationFee?: number; adminPasscode?: string; paymentSettings?: Partial<PaymentSettings> }): Promise<boolean> {
  try {
    const docRef = doc(db, SETTINGS_COL, 'global');
    await setDoc(docRef, data, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving settings to Firestore:', err);
    return false;
  }
}

/**
 * 4. USER PROFILE FIRESTORE SYNC
 */
export function subscribeUserProfileDb(uid: string, onUpdate: (profile: UserProfile) => void) {
  if (!uid) return () => {};
  try {
    const docRef = doc(db, USERS_COL, uid);
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate({ id: docSnap.id, ...docSnap.data() } as UserProfile);
        }
      },
      (error) => {
        console.warn('Firestore user profile subscription warning:', error.message);
      }
    );
  } catch (err) {
    return () => {};
  }
}

export async function saveUserProfileToDb(profile: UserProfile): Promise<boolean> {
  if (!profile.id && !profile.uid) return false;
  const uid = profile.uid || profile.id;
  try {
    const docRef = doc(db, USERS_COL, uid);
    await setDoc(docRef, { ...profile, uid }, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving user profile to Firestore:', err);
    return false;
  }
}

/**
 * 5. USER SAVED TOURNAMENTS & CUSTOM MATCHES SYNC
 */
export function subscribeUserSavedDataDb(
  uid: string, 
  onUpdate: (data: { savedIds?: string[]; customMatches?: CustomMatch[] }) => void
) {
  if (!uid) return () => {};
  try {
    const docRef = doc(db, USER_DATA_COL, uid);
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate(docSnap.data() as { savedIds?: string[]; customMatches?: CustomMatch[] });
        }
      },
      (error) => {
        console.warn('Firestore user saved data subscription warning:', error.message);
      }
    );
  } catch (err) {
    return () => {};
  }
}

export async function saveUserSavedDataToDb(
  uid: string, 
  savedIds: string[], 
  customMatches: CustomMatch[]
): Promise<boolean> {
  if (!uid) return false;
  try {
    const docRef = doc(db, USER_DATA_COL, uid);
    await setDoc(docRef, { savedIds, customMatches, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving user saved data to Firestore:', err);
    return false;
  }
}

/**
 * 6. AUDIT & LOGGING
 */
export async function logActivityToDb(type: string, message: string, userUid?: string, userEmail?: string) {
  try {
    const colRef = collection(db, LOGS_COL);
    const log: ActivityLog = {
      type,
      message,
      userUid: userUid || 'guest',
      userEmail: userEmail || 'anonymous',
      timestamp: new Date().toISOString()
    };
    await addDoc(colRef, log);
  } catch (err) {
    // Non-blocking log failure
  }
}
