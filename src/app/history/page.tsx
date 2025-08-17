
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getAllEquipment, getAllLogs } from '@/lib/data';
import { format, formatDistanceToNow } from 'date-fns';
import { History, Download } from 'lucide-react';
import { HistoryItem } from '@/components/history-item';
import { useEffect, useState } from 'react';
import type { Equipment, LogEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { Skeleton } from '@/components/ui/skeleton';

export default function HistoryPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const [logData, equipmentData] = await Promise.all([
          getAllLogs(),
          getAllEquipment(),
        ]);
        setLogs(logData);
        setEquipmentList(equipmentData);
      } catch (error) {
        console.error('Gagal mengambil data riwayat', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Gagal memuat data riwayat.',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  const getEquipmentName = (equipmentId: string) => {
    const equipment = equipmentList.find((e) => e.id === equipmentId);
    return equipment ? equipment.name : 'Tidak Diketahui';
  };

  const exportToCsv = () => {
    if (!logs.length) {
      toast({
        variant: 'destructive',
        title: 'Tidak Ada Data',
        description: 'Tidak ada riwayat untuk diekspor.',
      });
      return;
    }

    const dataToExport = logs.map((log) => ({
      'Nama Peralatan': getEquipmentName(log.equipmentId),
      'Aksi': log.action,
      'Pengguna': log.user || 'N/A',
      'Catatan': log.notes || 'N/A',
      'Tanggal': format(log.timestamp, 'yyyy-MM-dd HH:mm:ss'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Log Riwayat');
    XLSX.writeFile(workbook, 'manuc_log_riwayat.csv');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
            <History />
            Log Riwayat
          </h1>
          <p className="text-muted-foreground">Log lengkap semua aktivitas peralatan.</p>
        </div>
        <Button onClick={exportToCsv} className="w-full md:w-auto">
          <Download className="mr-2" />
          Ekspor sebagai CSV
        </Button>
      </header>
      <main className="flex-1 p-4 overflow-y-auto">
        {loading ? (
           <div className="space-y-4">
            {/* Desktop Skeleton */}
            <div className="hidden md:block border rounded-lg p-4">
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
             {/* Mobile Skeleton */}
            <div className="md:hidden space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
           </div>
        ) : logs.length > 0 ? (
          <>
            {/* Desktop View */}
            <div className="hidden md:block border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px] md:min-w-[200px]">Peralatan</TableHead>
                    <TableHead>Aksi</TableHead>
                    <TableHead className="min-w-[120px]">Pengguna</TableHead>
                    <TableHead className="min-w-[200px] md:min-w-[250px]">Catatan</TableHead>
                    <TableHead className="text-right min-w-[150px]">Tanggal</TableHead>
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
            {/* Mobile View */}
             <div className="md:hidden">
                <div className="border rounded-md">
                   {logs.map((log) => (
                      <HistoryItem key={log.id} log={log} equipmentName={getEquipmentName(log.equipmentId)} />
                    ))}
                </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground bg-card rounded-lg p-8">
            <History className="w-16 h-16 mb-4" />
            <h2 className="text-2xl font-bold">Tidak Ada Riwayat Ditemukan</h2>
            <p>Belum ada aktivitas yang dicatat.</p>
          </div>
        )}
      </main>
    </div>
  );
}
