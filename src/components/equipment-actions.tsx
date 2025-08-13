'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogTrigger,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  reportForRepair,
  type RepairState,
  markAsRepaired,
} from '@/lib/actions';
import type { Equipment } from '@/lib/types';
import { Loader2, Wrench, CheckCircle } from 'lucide-react';
import { useEffect, useRef, useState, useTransition } from 'react';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Input } from './ui/input';

function RepairForm({
  equipmentId,
  onFormSubmit,
}: {
  equipmentId: string;
  onFormSubmit: (state: RepairState) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await reportForRepair(formData);
      onFormSubmit(result);
      if (result.success) {
        formRef.current?.reset();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} ref={formRef}>
      <AlertDialogHeader>
        <AlertDialogTitle>Report for Repair</AlertDialogTitle>
        <AlertDialogDescription>
          Describe the issue to submit this equipment for repair.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div className="py-4 space-y-4">
        <input type="hidden" name="equipmentId" value={equipmentId} />
        <div className="space-y-2">
          <Label htmlFor="userName">Your Name</Label>
          <Input
            id="userName"
            name="userName"
            placeholder="John Doe"
            required
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="problem">Problem Description</Label>
          <Textarea
            id="problem"
            name="problem"
            placeholder="Describe the issue with the equipment..."
            required
            disabled={isPending}
          />
        </div>
      </div>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
        <Button type="submit" variant="destructive" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Confirm Report
        </Button>
      </AlertDialogFooter>
    </form>
  );
}


export function EquipmentActions({ equipment }: { equipment: Equipment }) {
  const { toast } = useToast();
  const [isRepairing, startRepairTransition] = useTransition();
  const [isDialogOpen, setDialogOpen] = useState(false);
  
  const handleFormSubmit = (result: RepairState) => {
     if (result.success) {
      toast({
        title: 'Success',
        description: result.message,
      });
      setDialogOpen(false);
    } else if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Repair Report Failed',
        description: result.error,
      });
    }
  }

  const handleMarkAsRepaired = () => {
    startRepairTransition(async () => {
      const result = await markAsRepaired(equipment.id);
      if (result.success) {
        toast({ title: 'Success', description: result.message });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {equipment.status === 'Under Repair' && (
        <Button onClick={handleMarkAsRepaired} disabled={isRepairing}>
          {isRepairing ? (
            <Loader2 className="mr-2 animate-spin" />
          ) : (
            <CheckCircle className="mr-2" />
          )}
          Mark as Repaired
        </Button>
      )}

      {equipment.status !== 'Under Repair' && (
        <AlertDialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Wrench className="mr-2" />
              Report for Repair
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
             <RepairForm equipmentId={equipment.id} onFormSubmit={handleFormSubmit} />
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
