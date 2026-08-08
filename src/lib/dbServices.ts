import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { auth, googleProvider, db } from './firebase';
import { Tournament, CustomMatch, UserProfile, VerificationRequest } from '../types';

// AUTHENTICATION SERVICES
export const loginWithGoogle = async (): Promise<FirebaseUser> => {
  const result = await signInWithPopup(auth, googleProvider);
  await syncUserProfile(result.user);
  return result.user;
};

export const loginWithEmail = async (email: string, pass: string): Promise<FirebaseUser> => {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  await syncUserProfile(result.user);
  return result.user;
};

export const registerWithEmail = async (
  email: string,
  pass: string,
  displayName: string
): Promise<FirebaseUser> => {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  if (result.user) {
    await updateProfile(result.user, { displayName });
    await syncUserProfile(result.user, displayName);
  }
  return result.user;
};

import { clearStoredUserProfile } from './storage';

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
  clearStoredUserProfile();
};

export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

export const subscribeToAuthChanges = (
  callback: (user: UserProfile | null) => void
) => {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      const userProfile = await fetchOrCreateUserProfile(fbUser);
      callback(userProfile);
    } else {
      callback(null);
    }
  });
};

export const fetchOrCreateUserProfile = async (fbUser: FirebaseUser): Promise<UserProfile> => {
  const userRef = doc(db, 'users', fbUser.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const data = snap.data();
    return {
      id: fbUser.uid,
      uid: fbUser.uid,
      name: data.displayName || fbUser.displayName || 'Gamer',
      email: fbUser.email || '',
      role: data.role || 'player',
      avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
      bgmiId: data.bgmiId || ''
    };
  } else {
    const newProfile: UserProfile = {
      id: fbUser.uid,
      uid: fbUser.uid,
      name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Gamer',
      email: fbUser.email || '',
      role: 'player',
      avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
      bgmiId: ''
    };
    await setDoc(userRef, {
      uid: newProfile.uid,
      displayName: newProfile.name,
      email: newProfile.email,
      role: newProfile.role,
      photoURL: newProfile.avatar,
      bgmiId: '',
      createdAt: new Date().toISOString()
    });
    return newProfile;
  }
};

export const syncUserProfile = async (fbUser: FirebaseUser, customName?: string) => {
  const userRef = doc(db, 'users', fbUser.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: fbUser.uid,
      displayName: customName || fbUser.displayName || fbUser.email?.split('@')[0] || 'Gamer',
      email: fbUser.email || '',
      role: 'player',
      photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
      bgmiId: '',
      createdAt: new Date().toISOString()
    });
  }
};

export const updateUserProfileData = async (uid: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    displayName: data.name,
    bgmiId: data.bgmiId,
    role: data.role
  });
};

// REALTIME TOURNAMENTS SYNC
export const subscribeToTournaments = (callback: (tournaments: Tournament[]) => void) => {
  const tournamentsRef = collection(db, 'tournaments');
  return onSnapshot(tournamentsRef, (snapshot) => {
    const list: Tournament[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Tournament);
    });
    if (list.length > 0) {
      callback(list);
    }
  }, (err) => {
    console.warn("Firestore tournaments subscribe error:", err);
  });
};

export const saveTournamentToFirestore = async (tournament: Tournament) => {
  const tRef = doc(db, 'tournaments', tournament.id);
  await setDoc(tRef, tournament, { merge: true });
};

export const deleteTournamentFromFirestore = async (id: string) => {
  const tRef = doc(db, 'tournaments', id);
  await deleteDoc(tRef);
};

// USER SCHEDULE SYNC (Cross-Device Saved Tournaments)
export const subscribeToUserSchedule = (uid: string, callback: (savedIds: string[]) => void) => {
  const scheduleRef = doc(db, 'userSchedules', uid);
  return onSnapshot(scheduleRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data().savedIds || []);
    }
  });
};

export const saveUserScheduleToFirestore = async (uid: string, savedIds: string[]) => {
  const scheduleRef = doc(db, 'userSchedules', uid);
  await setDoc(scheduleRef, { savedIds, updatedAt: new Date().toISOString() }, { merge: true });
};

// CUSTOM MATCHES SYNC (Cross-Device Custom Rooms)
export const subscribeToUserCustomMatches = (uid: string, callback: (matches: CustomMatch[]) => void) => {
  const matchesRef = collection(db, 'customMatches');
  return onSnapshot(matchesRef, (snapshot) => {
    const list: CustomMatch[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as CustomMatch;
      if (data.userUid === uid || !data.userUid) {
        list.push(data);
      }
    });
    callback(list);
  });
};

export const saveCustomMatchToFirestore = async (match: CustomMatch) => {
  const matchRef = doc(db, 'customMatches', match.id);
  await setDoc(matchRef, match, { merge: true });
};

export const deleteCustomMatchFromFirestore = async (id: string) => {
  const matchRef = doc(db, 'customMatches', id);
  await deleteDoc(matchRef);
};

// VERIFICATION REQUESTS SYNC
export const subscribeToVerificationRequests = (callback: (requests: VerificationRequest[]) => void) => {
  const reqRef = collection(db, 'verificationRequests');
  return onSnapshot(reqRef, (snapshot) => {
    const list: VerificationRequest[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as VerificationRequest);
    });
    callback(list);
  });
};

export const saveVerificationRequestToFirestore = async (req: VerificationRequest) => {
  const reqRef = doc(db, 'verificationRequests', req.id);
  await setDoc(reqRef, req, { merge: true });
};
