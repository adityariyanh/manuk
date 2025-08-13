import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  orderBy,
  writeBatch,
  deleteField,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Equipment, LogEntry, EquipmentStatus } from './types';

const EQUIPMENT_COLLECTION = 'equipment';
const LOGS_COLLECTION = 'logs';

// Helper to convert Firestore Timestamps to Dates in documents
function docWithDates<T>(docData: any): T {
  const data = { ...docData };
  for (const key in data) {
    if (data[key] instanceof Timestamp) {
      data[key] = data[key].toDate();
    }
  }
  return data as T;
}

// Data access functions
export async function getAllEquipment(): Promise<Equipment[]> {
  try {
    const q = query(
      collection(db, EQUIPMENT_COLLECTION),
      orderBy('name', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) =>
      docWithDates<Equipment>({ ...doc.data(), id: doc.id })
    );
  } catch (error) {
    console.error('Error fetching all equipment:', error);
    return []; // Return empty array on error
  }
}

export async function getEquipmentById(
  id: string
): Promise<Equipment | undefined> {
  try {
    const docRef = doc(db, EQUIPMENT_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docWithDates<Equipment>({ ...docSnap.data(), id: docSnap.id });
    }
    return undefined;
  } catch (error) {
    console.error(`Error fetching equipment by ID (${id}):`, error);
    return undefined;
  }
}

export async function getLogsForEquipment(
  equipmentId: string
): Promise<LogEntry[]> {
  try {
    const q = query(
      collection(db, LOGS_COLLECTION),
      where('equipmentId', '==', equipmentId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) =>
      docWithDates<LogEntry>({ ...doc.data(), id: doc.id })
    );
  } catch (error) {
    console.error(`Error fetching logs for equipment (${equipmentId}):`, error);
    return [];
  }
}

export async function getAllLogs(): Promise<LogEntry[]> {
  try {
    const q = query(
      collection(db, LOGS_COLLECTION),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) =>
      docWithDates<LogEntry>({ ...doc.data(), id: doc.id })
    );
  } catch (error) {
    console.error('Error fetching all logs:', error);
    return [];
  }
}

export async function addEquipment(
  equipmentData: Omit<Equipment, 'id' | 'status'>
): Promise<Equipment> {
  const newEquipmentData = {
    ...equipmentData,
    status: 'Available' as EquipmentStatus,
  };
  const docRef = await addDoc(
    collection(db, EQUIPMENT_COLLECTION),
    newEquipmentData
  );
  return { ...equipmentData, id: docRef.id, status: 'Available' };
}

export async function batchAddEquipment(
  equipmentItems: Omit<Equipment, 'id' | 'status'>[]
) {
  const batch = writeBatch(db);
  const equipmentCollection = collection(db, EQUIPMENT_COLLECTION);
  const logsCollection = collection(db, LOGS_COLLECTION);

  equipmentItems.forEach((item) => {
    const newEquipmentRef = doc(equipmentCollection); // Create a new doc reference with a unique ID
    const newLogRef = doc(logsCollection);

    const newEquipmentData = {
      ...item,
      status: 'Available' as EquipmentStatus,
    };
    batch.set(newEquipmentRef, newEquipmentData);
    
    const newLogData = {
      equipmentId: newEquipmentRef.id,
      action: 'Registered' as const,
      timestamp: Timestamp.now(),
      notes: 'Bulk upload',
    };
    batch.set(newLogRef, newLogData);
  });

  await batch.commit();
}

export async function updateEquipment(
  id: string,
  updates: Partial<Omit<Equipment, 'id'>>
): Promise<Equipment | undefined> {
  const docRef = doc(db, EQUIPMENT_COLLECTION, id);
  // Convert values for Firestore
  const updatesForFirestore: { [key: string]: any } = { ...updates };

  for (const key in updatesForFirestore) {
    const value = updatesForFirestore[key];
    if (value instanceof Date) {
      updatesForFirestore[key] = Timestamp.fromDate(value);
    } else if (value === null) {
      // Use deleteField for null values to remove from document
      updatesForFirestore[key] = deleteField();
    }
  }

  await updateDoc(docRef, updatesForFirestore);
  return getEquipmentById(id);
}

export async function addLog(
  logData: Omit<LogEntry, 'id' | 'timestamp'>
): Promise<LogEntry> {
  const newLog = {
    ...logData,
    timestamp: Timestamp.now(),
  };
  const docRef = await addDoc(collection(db, LOGS_COLLECTION), newLog);
  return { ...newLog, id: docRef.id, timestamp: newLog.timestamp.toDate() };
}

export async function getHistoricalBorrowingDataString(): Promise<string> {
  const q = query(
    collection(db, LOGS_COLLECTION),
    where('action', '==', 'Borrowed'),
    orderBy('timestamp', 'desc')
  );
  const querySnapshot = await getDocs(q);
  const logs = querySnapshot.docs.map((doc) =>
    docWithDates<LogEntry>({ ...doc.data(), id: doc.id })
  );

  const dataString = await Promise.all(
    logs.map(async (log) => {
      const equipment = await getEquipmentById(log.equipmentId);
      return `User ${log.user || 'Unknown'} borrowed a ${
        equipment?.brand || 'Unknown item'
      } (${
        equipment?.name || 'Unknown name'
      }) on ${log.timestamp.toDateString()}.`;
    })
  );

  return dataString.join('\n');
}

export async function deleteEquipment(id: string): Promise<void> {
  const batch = writeBatch(db);

  // Delete the equipment document
  const equipmentRef = doc(db, EQUIPMENT_COLLECTION, id);
  batch.delete(equipmentRef);

  // Find and delete all associated logs
  const logsQuery = query(
    collection(db, LOGS_COLLECTION),
    where('equipmentId', '==', id)
  );
  const logsSnapshot = await getDocs(logsQuery);
  logsSnapshot.forEach((logDoc) => {
    batch.delete(logDoc.ref);
  });

  await batch.commit();
}
