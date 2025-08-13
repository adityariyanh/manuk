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
import { Package, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
      <header className="p-4 border-b">
        <h1 className="text-2xl font-bold font-headline">
          Equipment Dashboard
        </h1>
      </header>
      <main className="flex-1 p-4 overflow-y-auto">
        {equipment.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Borrowed By</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/equipment/${item.id}`}>
                              View Details
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
