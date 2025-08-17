
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
        description: 'Failed to load dashboard data.',
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
            Equipment Dashboard
          </h1>
          <p className="text-muted-foreground">
            An overview of all equipment in the inventory.
          </p>
        </div>
        <Button asChild>
          <Link href="/equipment/new">Add Equipment</Link>
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
                        <TableHead className="w-[60%]">Name</TableHead>
                        <TableHead className="w-[120px]">Status</TableHead>
                        <TableHead className="text-right w-[150px]">
                          Actions
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
            <h2 className="text-2xl font-bold">No Equipment Found</h2>
            <p className="max-w-md mt-2">
              Get started by adding your first piece of equipment.
            </p>
            <Button asChild className="mt-6">
              <Link href="/equipment/new">Add Equipment</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
