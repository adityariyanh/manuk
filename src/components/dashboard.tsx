
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
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { Equipment, EquipmentStatus } from '@/lib/types';
import { Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardActions } from '@/components/dashboard-actions';
import { checkReminders } from '@/lib/actions';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

function StatusBadge({ status }: { status: EquipmentStatus }) {
  const variant: 'default' | 'secondary' | 'destructive' =
    status === 'Available'
      ? 'default'
      : status === 'Borrowed'
      ? 'secondary'
      : 'destructive';

  if (status === 'Follow Up') {
    return <Badge variant="destructive">Follow Up</Badge>;
  }

  return <Badge variant={variant}>{status}</Badge>;
}

export function Dashboard() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      await checkReminders();
      const data = await getAllEquipment();
      setEquipment(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal memuat data dasbor.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [toast]);
  
  const groupedEquipment = equipment.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as { [key: string]: Equipment[] });


  if (loading) {
    return (
       <div className="flex items-center justify-center h-full">
         <Loader2 className="w-12 h-12 animate-spin" />
       </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline">
            Dasbor Peralatan
          </h1>
          <p className="text-muted-foreground">
            Gambaran umum semua peralatan dalam inventaris.
          </p>
        </div>
        <Button asChild>
          <Link href="/equipment/new">Tambah Peralatan</Link>
        </Button>
      </header>
      <main className="flex-1 p-4 overflow-y-auto">
        {equipment.length > 0 ? (
          <div className='space-y-8'>
            {Object.entries(groupedEquipment)
             .sort(([a], [b]) => a.localeCompare(b))
             .map(([category, items]) => (
              <div key={category}>
                <h2 className="text-xl font-semibold font-headline mb-4 capitalize">{category}</h2>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40%]">Nama</TableHead>
                        <TableHead className="w-[120px]">Status</TableHead>
                        <TableHead className="w-[20%]">Peminjam</TableHead>
                        <TableHead className="text-right w-[150px]">
                          Aksi
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            <div className="font-medium truncate">{item.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.brand} - {item.model}
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={item.status} />
                          </TableCell>
                          <TableCell>
                             {(item.status === 'Borrowed' || item.status === 'Follow Up' || item.status === 'Reminder') && item.borrowedBy ? (
                              <div className="truncate">{item.borrowedBy}</div>
                            ) : (
                              <div className="text-muted-foreground">-</div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DashboardActions equipment={item} onActionSuccess={fetchData} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground bg-card rounded-lg p-8">
            <Package className="w-16 h-16 mb-4" />
            <h2 className="text-2xl font-bold">Tidak Ada Peralatan Ditemukan</h2>
            <p className="max-w-md mt-2">
              Mulailah dengan menambahkan peralatan pertama Anda.
            </p>
            <Button asChild className="mt-6">
              <Link href="/equipment/new">Tambah Peralatan</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
