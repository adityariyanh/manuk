
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
import { checkReminders } from '@/lib/actions';

function StatusBadge({ status }: { status: EquipmentStatus }) {
  const variant: 'default' | 'secondary' | 'destructive' =
    status === 'Available'
      ? 'default'
      : status === 'Borrowed'
      ? 'secondary'
      : 'destructive';

  if (status === 'Follow Up') {
     return <Badge variant='destructive'>Follow Up</Badge>;
  }

  return <Badge variant={variant}>{status}</Badge>;
}

export default async function DashboardPage() {
  // Run the reminder check every time the dashboard is loaded.
  await checkReminders();
  const equipment = await getAllEquipment();

  return (
    <div className="flex flex-col h-full">
       <header className="p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline">
            Equipment Dashboard
          </h1>
          <p className="text-muted-foreground">An overview of all equipment in the inventory.</p>
        </div>
         <Button asChild>
          <Link href="/equipment/new">Add Equipment</Link>
        </Button>
      </header>
      <main className="flex-1 p-4 overflow-y-auto">
        {equipment.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipment.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground md:hidden">{item.brand}</div>
                       <div className="sm:hidden mt-2">
                        <StatusBadge status={item.status} />
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DashboardActions equipment={item} />
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
