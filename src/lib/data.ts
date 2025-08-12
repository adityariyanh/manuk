import type { Equipment, LogEntry } from './types';

// In-memory store
let equipmentStore: Equipment[] = [
  {
    id: '1',
    name: 'Canon EOS R5',
    model: 'Camera',
    purchaseDate: new Date('2022-03-15'),
    status: 'Available',
  },
  {
    id: '2',
    name: 'MacBook Pro 16"',
    model: 'Laptop',
    purchaseDate: new Date('2023-01-20'),
    status: 'Borrowed',
    borrowedBy: 'Alice',
  },
  {
    id: '3',
    name: 'Wacom Intuos Pro',
    model: 'Drawing Tablet',
    purchaseDate: new Date('2021-11-05'),
    status: 'Under Repair',
  },
  {
    id: '4',
    name: 'Sony WH-1000XM5',
    model: 'Headphones',
    purchaseDate: new Date('2023-05-10'),
    status: 'Available',
  },
];

let logStore: LogEntry[] = [
  { id: 'l1', equipmentId: '1', action: 'Registered', timestamp: new Date('2022-03-15') },
  { id: 'l2', equipmentId: '2', action: 'Registered', timestamp: new Date('2023-01-20') },
  { id: 'l3', equipmentId: '2', action: 'Borrowed', user: 'Alice', timestamp: new Date('2024-05-10') },
  { id: 'l4', equipmentId: '3', action: 'Registered', timestamp: new Date('2021-11-05') },
  { id: 'l5', equipmentId: '3', action: 'Reported for Repair', user: 'Admin', notes: 'Screen is flickering', timestamp: new Date('2024-04-20') },
  { id: 'l6', equipmentId: '4', action: 'Registered', timestamp: new Date('2023-05-10') },
  { id: 'l7', equipmentId: '1', action: 'Borrowed', user: 'Bob', timestamp: new Date('2024-03-01') },
  { id: 'l8', equipmentId: '1', action: 'Returned', user: 'Bob', timestamp: new Date('2024-03-05') },
];

// Data access functions
export async function getAllEquipment(): Promise<Equipment[]> {
  return Promise.resolve(equipmentStore);
}

export async function getEquipmentById(id: string): Promise<Equipment | undefined> {
  return Promise.resolve(equipmentStore.find((e) => e.id === id));
}

export async function getLogsForEquipment(equipmentId: string): Promise<LogEntry[]> {
  return Promise.resolve(logStore.filter((l) => l.equipmentId === equipmentId).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
}

export async function addEquipment(equipment: Omit<Equipment, 'id' | 'status'>): Promise<Equipment> {
  const newEquipment: Equipment = {
    ...equipment,
    id: String(Date.now()),
    status: 'Available',
  };
  equipmentStore.push(newEquipment);
  addLog({ equipmentId: newEquipment.id, action: 'Registered' });
  return Promise.resolve(newEquipment);
}

export async function updateEquipment(id: string, updates: Partial<Equipment>): Promise<Equipment | undefined> {
  const index = equipmentStore.findIndex((e) => e.id === id);
  if (index !== -1) {
    equipmentStore[index] = { ...equipmentStore[index], ...updates };
    return Promise.resolve(equipmentStore[index]);
  }
  return Promise.resolve(undefined);
}

export async function addLog(log: Omit<LogEntry, 'id' | 'timestamp'>): Promise<LogEntry> {
  const newLog: LogEntry = {
    ...log,
    id: `l${Date.now()}`,
    timestamp: new Date(),
  };
  logStore.push(newLog);
  return Promise.resolve(newLog);
}

export async function getHistoricalBorrowingDataString(): Promise<string> {
    const borrowingLogs = logStore.filter(log => log.action === 'Borrowed');
    const dataString = borrowingLogs.map(log => {
        const equipment = equipmentStore.find(e => e.id === log.equipmentId);
        return `User ${log.user || 'Unknown'} borrowed a ${equipment?.model || 'Unknown item'} (${equipment?.name || 'Unknown name'}) on ${log.timestamp.toDateString()}.`;
    }).join('\n');
    return Promise.resolve(dataString);
}
