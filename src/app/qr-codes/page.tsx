
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getAllEquipment } from '@/lib/data';
import type { Equipment } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { QrCode, Download, Copy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import * as XLSX from 'xlsx';

export default function QrCodesPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    // This will run only on the client side
    setOrigin(window.location.origin);

    async function fetchData() {
      try {
        const data = await getAllEquipment();
        setEquipment(data);
      } catch (error) {
        console.error('Failed to fetch equipment', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load equipment data.',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  const getActionUrl = (equipmentId: string) => {
    if (!origin) return '';
    // The basePath is automatically handled by Next.js routing, so we only need the origin.
    return `${origin}/equipment/${equipmentId}/action`;
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: 'Copied!',
          description: 'URL copied to clipboard.',
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to copy URL.',
        });
      }
    );
  };

  const exportToCsv = () => {
    if (!equipment.length) {
      toast({
        variant: 'destructive',
        title: 'No Data',
        description: 'There is no data to export.',
      });
      return;
    }

    const dataToExport = equipment.map((item) => ({
      'Equipment Name': item.name,
      'QR Code Action URL': getActionUrl(item.id),
      'Status': item.status,
      'Model': item.model,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Equipment QR Codes');
    XLSX.writeFile(workbook, 'equipment_qr_codes.csv');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
            <QrCode />
            Equipment QR Code URLs
          </h1>
          <p className="text-muted-foreground">
            A list of all equipment and their direct action URLs for QR code generation.
          </p>
        </div>
        <Button onClick={exportToCsv} className="w-full md:w-auto">
          <Download className="mr-2" />
          Export as CSV
        </Button>
      </header>
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Equipment Name</TableHead>
                  <TableHead className="hidden md:table-cell min-w-[300px]">QR Code Action URL</TableHead>
                  <TableHead className="text-right w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : equipment.length > 0 ? (
                  equipment.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-sm max-w-sm truncate">
                        {getActionUrl(item.id)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(getActionUrl(item.id))}
                          disabled={!origin}
                        >
                          <Copy className="md:mr-2" />
                          <span className='hidden md:inline'>Copy</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      No equipment found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
      </main>
    </div>
  );
}
