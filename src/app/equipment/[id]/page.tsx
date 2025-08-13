
import { getEquipmentById, getLogsForEquipment, getAllEquipment } from '@/lib/data';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { EquipmentStatus } from '@/lib/types';
import { QrCodeCard } from '@/components/qr-code';
import { EquipmentActions } from '@/components/equipment-actions';
import { HistoryTable } from '@/components/history-table';
import { format } from 'date-fns';

export async function generateStaticParams() {
  const equipment = await getAllEquipment();
  return equipment.map((item) => ({
    id: item.id,
  }));
}

function StatusBadge({ status }: { status: EquipmentStatus }) {
  const variant: 'default' | 'secondary' | 'destructive' =
    status === 'Available'
      ? 'default'
      : status === 'Borrowed'
      ? 'secondary'
      : 'destructive';
  return <Badge variant={variant}>{status}</Badge>;
}

export default async function EquipmentDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const equipment = await getEquipmentById(params.id);
  if (!equipment) {
    notFound();
  }
  const logs = await getLogsForEquipment(params.id);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">{equipment.name}</h1>
        <p className="text-muted-foreground">{equipment.model}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={equipment.status} />
              </div>
              {equipment.status === 'Borrowed' && equipment.borrowedBy && (
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Borrowed By</span>
                    <span>{equipment.borrowedBy}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Purchase Date</span>
                <span>{format(equipment.purchaseDate, 'PPP')}</span>
              </div>
               <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Equipment ID</span>
                <span className="font-mono text-sm">{equipment.id}</span>
              </div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <EquipmentActions equipment={equipment} />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <QrCodeCard equipmentId={equipment.id} />
        </div>
      </div>
       <div>
         <HistoryTable logs={logs} />
       </div>
    </div>
  );
}
