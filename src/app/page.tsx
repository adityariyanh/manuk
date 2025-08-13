

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
import type { EquipmentStatus } from '@/lib/types';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardActions } from '@/components/dashboard-actions';

function StatusBadge({ status }: { status: EquipmentStatus }) {
  const variant: 'default' | 'secondary' | 'destructive' =
    status === 'Available'
      ? 'default'
      : status === 'Borrowed'
      ? 'secondary'
      : 'destructive';

  return <Badge variant={variant}>{status}</Badge>;
}

export default async function DashboardPage() {
  const equipment = await getAllEquipment();

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b hidden md:block">
        <h1 className="text-2xl font-bold font-headline">
          Equipment Dashboard
        </h1>
      </header>
      <main className="flex-1 p-4 overflow-y-auto">
        {equipment.length > 0 ? (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Name</TableHead>
                  <TableHead className="min-w-[150px]">Model</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="min-w-[150px]">Borrowed By</TableHead>
                  <TableHead className="w-[220px] text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipment.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.model}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>{item.borrowedBy || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/equipment/${item.id}`}>Details</Link>
                        </Button>
                        <DashboardActions equipment={item} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
