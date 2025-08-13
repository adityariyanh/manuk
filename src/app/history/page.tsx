import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getAllEquipment, getAllLogs } from '@/lib/data';
import type { Equipment } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import { History } from 'lucide-react';

export default async function HistoryPage() {
  const logs = await getAllLogs();
  const equipmentList = await getAllEquipment();

  const getEquipmentName = (equipmentId: string) => {
    const equipment = equipmentList.find((e) => e.id === equipmentId);
    return equipment ? equipment.name : 'Unknown';
  };

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b">
        <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
          <History />
          History Log
        </h1>
        <p className="text-muted-foreground">A complete log of all equipment activity.</p>
      </header>
      <main className="flex-1 p-4 overflow-y-auto">
        {logs.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      {getEquipmentName(log.equipmentId)}
                    </TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.user || 'N/A'}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {log.notes || 'N/A'}
                    </TableCell>
                    <TableCell
                      className="text-right"
                      title={format(log.timestamp, 'PPP p')}
                    >
                      {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground bg-card rounded-lg p-8">
            <History className="w-16 h-16 mb-4" />
            <h2 className="text-2xl font-bold">No History Found</h2>
            <p>No activity has been logged yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}
