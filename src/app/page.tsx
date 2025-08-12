import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getAllEquipment } from '@/lib/data';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { Equipment, EquipmentStatus } from '@/lib/types';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

function StatusBadge({ status }: { status: EquipmentStatus }) {
  const variant: 'default' | 'secondary' | 'destructive' =
    status === 'Available'
      ? 'default'
      : status === 'Borrowed'
      ? 'secondary'
      : 'destructive';

  return <Badge variant={variant}>{status}</Badge>;
}

function EquipmentCard({ equipment }: { equipment: Equipment }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-headline">
              {equipment.name}
            </CardTitle>
            <CardDescription>{equipment.model}</CardDescription>
          </div>
          <StatusBadge status={equipment.status} />
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <div className="flex-grow">
          {equipment.status === 'Borrowed' && equipment.borrowedBy && (
            <p className="text-sm text-muted-foreground">
              Borrowed by: {equipment.borrowedBy}
            </p>
          )}
        </div>
        <Button asChild className="mt-4 w-full">
          <Link href={`/equipment/${equipment.id}`}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const equipment = await getAllEquipment();

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b">
        <h1 className="text-2xl font-bold font-headline">Equipment Dashboard</h1>
      </header>
      <main className="flex-1 p-4 overflow-y-auto">
        {equipment.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {equipment.map((item) => (
              <EquipmentCard key={item.id} equipment={item} />
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
