
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
        <CardTitle>Log Riwayat</CardTitle>
        <CardDescription>
          Log semua aktivitas untuk peralatan ini.
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
                    Tidak ada riwayat ditemukan untuk item ini.
                </div>
            )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aksi</TableHead>
                <TableHead>Pengguna</TableHead>
                <TableHead>Catatan</TableHead>
                <TableHead className="text-right">Tanggal</TableHead>
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
                    Tidak ada riwayat ditemukan untuk item ini.
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
