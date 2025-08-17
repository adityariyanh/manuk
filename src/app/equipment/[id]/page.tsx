
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
import { EditEquipmentForm } from '@/components/edit-equipment-form';


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

   if (status === 'Follow Up') {
     return <Badge variant='destructive'>Follow Up</Badge>;
   }

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
        <p className="text-muted-foreground">{equipment.brand} {equipment.model} - {equipment.category}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <EditEquipmentForm equipment={equipment} />
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
           <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Current Status</span>
                <StatusBadge status={equipment.status} />
              </div>
              {(equipment.status === 'Borrowed' || equipment.status === 'Follow Up') && equipment.borrowedBy && (
                 <>
                  <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Borrowed By</span>
                      <span>{equipment.borrowedBy}</span>
                  </div>
                   {equipment.borrowerPhone && (
                     <div className="flex justify-between items-center">
                       <span className="text-muted-foreground">Phone</span>
                       <span>{equipment.borrowerPhone}</span>
                     </div>
                   )}
                   {equipment.borrowedFrom && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Borrowed From</span>
                      <span>{format(new Date(equipment.borrowedFrom), 'PPP')}</span>
                    </div>
                  )}
                  {equipment.borrowedUntil && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Return By</span>
                      <span>{format(new Date(equipment.borrowedUntil), 'PPP')}</span>
                    </div>
                  )}
                 </>
              )}
               <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Equipment ID</span>
                <span className="font-mono text-sm">{equipment.id}</span>
              </div>
            </CardContent>
          </Card>
          <QrCodeCard equipmentId={equipment.id} />
        </div>
      </div>
       <div>
         <HistoryTable logs={logs} />
       </div>
    </div>
  );
}
