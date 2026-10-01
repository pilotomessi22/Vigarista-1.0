import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  deleteField,
} from 'firebase/firestore';
import { db } from '../firebase';
import { LicenseKey, LicensedUser, getStoredKeys, getStoredUsers, saveStoredKeys, saveStoredUsers, getActiveClientSession, clearActiveClientSession } from './licenseManager';

const KEYS_COLLECTION = 'license_keys';
const USERS_COLLECTION = 'licensed_users';

let isSyncingFromRemote = false;

type ChangeListener = () => void;
const listeners = new Set<ChangeListener>();

export const subscribeToCloudSync = (listener: ChangeListener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = () => {
  listeners.forEach((l) => {
    try {
      l();
    } catch (e) {
      console.error('Error notifying sync listener', e);
    }
  });
};

/**
 * Initialize real-time synchronization with Firestore
 */
export const initRealtimeCloudSync = () => {
  try {
    if (!db) {
      console.warn('Firestore db is not initialized. Skipping realtime sync.');
      return;
    }
    // 1. Listen for License Keys in Realtime
    const keysColRef = collection(db, KEYS_COLLECTION);
    onSnapshot(keysColRef, (snapshot) => {
      if (snapshot.empty) {
        // If Firestore is empty, seed it with initial local keys
        const localKeys = getStoredKeys();
        if (localKeys.length > 0) {
          localKeys.forEach((k) => syncKeyToCloud(k));
        } else {
          saveStoredKeys([]);
          notifyListeners();
        }
        return;
      }

      const remoteKeys: LicenseKey[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as LicenseKey;
        if (data && data.key) {
          remoteKeys.push(data);
        }
      });

      isSyncingFromRemote = true;
      saveStoredKeys(remoteKeys);
      isSyncingFromRemote = false;
      
      // Real-time security watchdog: check if current active session relies on an expired key
      const activeSession = getActiveClientSession();
      if (activeSession && activeSession.licenseKey) {
        const matchingKey = remoteKeys.find(
          (k) => k.key.trim().toUpperCase() === activeSession.licenseKey.trim().toUpperCase()
        );
        if (matchingKey && matchingKey.status === 'expired') {
          console.warn('🔒 [SEGURANÇA REALTIME] Chave de licença expirada via Administrador! Revogando acesso.');
          clearActiveClientSession();
        }
      }

      notifyListeners();
    }, (err) => {
      console.warn('Firestore license_keys subscription error:', err);
    });

    // 2. Listen for Licensed Users in Realtime
    const usersColRef = collection(db, USERS_COLLECTION);
    onSnapshot(usersColRef, (snapshot) => {
      if (snapshot.empty) {
        // If Firestore is empty, seed it with initial local users
        const localUsers = getStoredUsers();
        if (localUsers.length > 0) {
          localUsers.forEach((u) => syncUserToCloud(u));
        } else {
          saveStoredUsers([]);
          notifyListeners();
        }
        return;
      }

      const remoteUsers: LicensedUser[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as LicensedUser;
        if (data && data.username) {
          remoteUsers.push(data);
        }
      });

      isSyncingFromRemote = true;
      saveStoredUsers(remoteUsers);
      isSyncingFromRemote = false;

      // Real-time security watchdog: check if active user session has been expired or suspended remotely
      const activeSession = getActiveClientSession();
      if (activeSession) {
        const cleanUser = activeSession.username.trim().toLowerCase();
        const remoteUser = remoteUsers.find((u) => u.username.trim().toLowerCase() === cleanUser);
        if (!remoteUser || remoteUser.status === 'expired' || remoteUser.status === 'suspended') {
          console.warn('🔒 [SEGURANÇA REALTIME] Conta expirada ou revogada via Administrador! Encerrando sessão.');
          clearActiveClientSession();
        }
      }

      notifyListeners();
    }, (err) => {
      console.warn('Firestore licensed_users subscription error:', err);
    });
  } catch (error) {
    console.error('Failed to initialize Firestore real-time sync:', error);
  }
};

/**
 * Sync a single license key to Firestore
 */
export const syncKeyToCloud = async (key: LicenseKey): Promise<void> => {
  if (isSyncingFromRemote) return;
  try {
    const keyDocRef = doc(db, KEYS_COLLECTION, key.key.trim().toUpperCase());
    const payload: Record<string, any> = {};
    for (const [k, val] of Object.entries(key)) {
      payload[k] = val === undefined ? deleteField() : val;
    }
    await setDoc(keyDocRef, payload, { merge: true });
  } catch (err) {
    console.warn('Failed to sync key to cloud:', err);
  }
};

/**
 * Sync a licensed user to Firestore
 */
export const syncUserToCloud = async (user: LicensedUser): Promise<void> => {
  if (isSyncingFromRemote) return;
  try {
    const userDocRef = doc(db, USERS_COLLECTION, user.username.trim().toLowerCase());
    const payload: Record<string, any> = {};
    for (const [k, val] of Object.entries(user)) {
      payload[k] = val === undefined ? deleteField() : val;
    }
    await setDoc(userDocRef, payload, { merge: true });
  } catch (err) {
    console.warn('Failed to sync user to cloud:', err);
  }
};

/**
 * Delete a key from Firestore
 */
export const deleteKeyFromCloud = async (keyString: string): Promise<void> => {
  try {
    const keyDocRef = doc(db, KEYS_COLLECTION, keyString.trim().toUpperCase());
    await deleteDoc(keyDocRef);
  } catch (err) {
    console.warn('Failed to delete key from cloud:', err);
  }
};

/**
 * Delete a user from Firestore
 */
export const deleteUserFromCloud = async (username: string): Promise<void> => {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, username.trim().toLowerCase());
    await deleteDoc(userDocRef);
  } catch (err) {
    console.warn('Failed to delete user from cloud:', err);
  }
};

/**
 * Perform manual one-time full sync from Cloud
 */
export const forceSyncFromCloud = async (): Promise<{ keysCount: number; usersCount: number }> => {
  try {
    const keysSnap = await getDocs(collection(db, KEYS_COLLECTION));
    const usersSnap = await getDocs(collection(db, USERS_COLLECTION));

    const remoteKeys: LicenseKey[] = [];
    keysSnap.forEach((d) => remoteKeys.push(d.data() as LicenseKey));

    const remoteUsers: LicensedUser[] = [];
    usersSnap.forEach((d) => remoteUsers.push(d.data() as LicensedUser));

    if (remoteKeys.length > 0) {
      saveStoredKeys(remoteKeys);
    }
    if (remoteUsers.length > 0) {
      saveStoredUsers(remoteUsers);
    }

    notifyListeners();
    return { keysCount: remoteKeys.length, usersCount: remoteUsers.length };
  } catch (error) {
    console.error('Error in forceSyncFromCloud:', error);
    return { keysCount: 0, usersCount: 0 };
  }
};
