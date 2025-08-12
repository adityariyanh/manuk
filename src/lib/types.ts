export type EquipmentStatus = 'Available' | 'Borrowed' | 'Under Repair';

export interface Equipment {
  id: string;
  name: string;
  model: string;
  purchaseDate: Date;
  status: EquipmentStatus;
  borrowedBy?: string;
}

export type LogAction = 'Registered' | 'Borrowed' | 'Returned' | 'Reported for Repair' | 'Repaired';

export interface LogEntry {
  id: string;
  equipmentId: string;
  action: LogAction;
  user?: string;
  timestamp: Date;
  notes?: string;
}
