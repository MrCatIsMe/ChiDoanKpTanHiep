import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  collection, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';
import { DoanVien, HoatDong, MinhChung, User, TruongHoc } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth();

// Error helper enum
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Successfully connected to Firestore.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
    return false;
  }
}

// Collections Names
const COLL_DOAN_VIEN = 'doanVien';
const COLL_HOAT_DONG = 'hoatDong';
const COLL_MINH_CHUNG = 'minhChung';
const COLL_TRUONG_HOC = 'truongHoc';
const COLL_USERS = 'users';

// --- DOAN VIEN SERVICES ---
export async function dbGetDoanVien(): Promise<DoanVien[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLL_DOAN_VIEN));
    const list: DoanVien[] = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data() as DoanVien);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLL_DOAN_VIEN);
    return [];
  }
}

export async function dbSaveDoanVien(item: DoanVien): Promise<void> {
  try {
    await setDoc(doc(db, COLL_DOAN_VIEN, item.id), item);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLL_DOAN_VIEN}/${item.id}`);
  }
}

export async function dbDeleteDoanVien(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLL_DOAN_VIEN, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLL_DOAN_VIEN}/${id}`);
  }
}

// --- HOAT DONG SERVICES ---
export async function dbGetHoatDong(): Promise<HoatDong[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLL_HOAT_DONG));
    const list: HoatDong[] = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data() as HoatDong);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLL_HOAT_DONG);
    return [];
  }
}

export async function dbSaveHoatDong(item: HoatDong): Promise<void> {
  try {
    await setDoc(doc(db, COLL_HOAT_DONG, item.id), item);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLL_HOAT_DONG}/${item.id}`);
  }
}

export async function dbDeleteHoatDong(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLL_HOAT_DONG, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLL_HOAT_DONG}/${id}`);
  }
}

// --- MINH CHUNG SERVICES ---
export async function dbGetMinhChung(): Promise<MinhChung[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLL_MINH_CHUNG));
    const list: MinhChung[] = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data() as MinhChung);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLL_MINH_CHUNG);
    return [];
  }
}

export async function dbSaveMinhChung(item: MinhChung): Promise<void> {
  try {
    await setDoc(doc(db, COLL_MINH_CHUNG, item.id), item);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLL_MINH_CHUNG}/${item.id}`);
  }
}

export async function dbDeleteMinhChung(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLL_MINH_CHUNG, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLL_MINH_CHUNG}/${id}`);
  }
}

// --- TRUONG HOC SERVICES ---
export async function dbGetTruongHoc(): Promise<TruongHoc[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLL_TRUONG_HOC));
    const list: TruongHoc[] = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data() as TruongHoc);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLL_TRUONG_HOC);
    return [];
  }
}

export async function dbSaveTruongHoc(item: TruongHoc): Promise<void> {
  try {
    await setDoc(doc(db, COLL_TRUONG_HOC, item.id), item);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLL_TRUONG_HOC}/${item.id}`);
  }
}

export async function dbDeleteTruongHoc(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLL_TRUONG_HOC, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLL_TRUONG_HOC}/${id}`);
  }
}

// --- USERS SERVICES ---
export async function dbGetUsers(): Promise<User[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLL_USERS));
    const list: User[] = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data() as User);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLL_USERS);
    return [];
  }
}

export async function dbSaveUser(item: User): Promise<void> {
  try {
    await setDoc(doc(db, COLL_USERS, item.id), item);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLL_USERS}/${item.id}`);
  }
}

export async function dbDeleteUser(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLL_USERS, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLL_USERS}/${id}`);
  }
}

// --- SEED OR BULK SYNC SERVICE ---
export async function dbBulkSync(data: {
  doanVien: DoanVien[];
  hoatDong: HoatDong[];
  minhChung: MinhChung[];
  users: User[];
  truongHoc: TruongHoc[];
}): Promise<void> {
  try {
    // Sync doanVien
    for (const item of data.doanVien) {
      await dbSaveDoanVien(item);
    }
    // Sync hoatDong
    for (const item of data.hoatDong) {
      await dbSaveHoatDong(item);
    }
    // Sync minhChung
    for (const item of data.minhChung) {
      await dbSaveMinhChung(item);
    }
    // Sync users
    for (const item of data.users) {
      await dbSaveUser(item);
    }
    // Sync truongHoc
    for (const item of data.truongHoc) {
      await dbSaveTruongHoc(item);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'bulk-sync');
  }
}

// --- SETTINGS SERVICE ---
export async function dbGetSettings(): Promise<{ attendanceLocked: boolean }> {
  try {
    const docRef = doc(db, 'settings', 'appSettings');
    const docSnap = await getDocFromServer(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as { attendanceLocked: boolean };
    }
    return { attendanceLocked: false };
  } catch (error) {
    console.error('Error loading settings from Firestore:', error);
    return { attendanceLocked: false };
  }
}

export async function dbSaveSettings(settings: { attendanceLocked: boolean }): Promise<void> {
  try {
    await setDoc(doc(db, 'settings', 'appSettings'), settings);
  } catch (error) {
    console.error('Error saving settings to Firestore:', error);
  }
}

