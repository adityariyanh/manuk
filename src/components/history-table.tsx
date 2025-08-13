
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { LogEntry } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import { HistoryItem } from './history-item';


export function HistoryTable({ logs }: { logs: LogEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>History Log</CardTitle>
        <CardDescription>
          A log of all activities for this piece of equipment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Mobile View */}
        <div className="md:hidden">
             {logs.length > 0 ? (
                <div className="border rounded-md">
                   {logs.map((log) => <HistoryItem key={log.id} log={log} />)}
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    No history found for this item.
                </div>
            )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell>{log.user || 'N/A'}</TableCell>
                    <TableCell className='max-w-xs truncate'>{log.notes || 'N/A'}</TableCell>
                    <TableCell className="text-right" title={format(log.timestamp, 'PPP p')}>
                      {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    No history found for this item.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
