export type EquipmentStatus = 'Available' | 'Borrowed' | 'Under Repair' | 'Reminder';

export interface Equipment {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  status: EquipmentStatus;
  borrowedBy?: string;
  borrowerPhone?: string;
  borrowedUntil?: Date;
  reminderSent?: boolean;
}

export type LogAction = 'Registered' | 'Borrowed' | 'Returned' | 'Reported for Repair' | 'Repaired' | 'Deleted';

export interface LogEntry {
  id: string;
  equipmentId: string;
  action: LogAction;
  user?: string;
  timestamp: Date;
  notes?: string;
}
