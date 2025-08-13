'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  reportForRepair,
  type RepairState,
  markAsRepaired,
} from '@/lib/actions';
import type { Equipment } from '@/lib/types';
import {
  Loader2,
  Wrench,
  CheckCircle,
} from 'lucide-react';
import { useEffect, useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Label } from './ui/label';

function RepairForm({ equipmentId, closeDialog }: { equipmentId: string, closeDialog: () => void }) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  const initialRepairState: RepairState = { message: '' };
  const [repairState, repairDispatch] = useActionState(
    reportForRepair,
    initialRepairState
  );

  useEffect(() => {
    if (repairState.success) {
      toast({
        title: 'Success',
        description: repairState.message,
      });
      formRef.current?.reset();
      closeDialog();
    } else if (repairState.error) {
      toast({
        variant: 'destructive',
        title: 'Repair Report Failed',
        description: repairState.error,
      });
    }
  }, [repairState, toast, closeDialog]);

  const { pending } = useFormStatus();

  return (
    <form action={repairDispatch} ref={formRef}>
      <AlertDialogHeader>
        <AlertDialogTitle>Report for Repair</AlertDialogTitle>
        <AlertDialogDescription>
          Describe the issue to submit this equipment for repair.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div className="py-4 space-y-4">
        <input type="hidden" name="equipmentId" value={equipmentId} />
        <div className="space-y-2">
          <Label htmlFor="userRole">Your Role</Label>
          <Select name="userRole" required disabled={pending}>
            <SelectTrigger>
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="problem">Problem Description</Label>
          <Textarea
            id="problem"
            name="problem"
            placeholder="Describe the issue with the equipment..."
            required
            disabled={pending}
          />
        </div>
      </div>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <Button type="submit" variant="destructive" disabled={pending}>
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Confirm Report
        </Button>
      </AlertDialogFooter>
    </form>
  );
}


export function EquipmentActions({ equipment }: { equipment: Equipment }) {
  const { toast } = useToast();
  const [isRepairing, startRepairTransition] = useActionState(async () => {
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
  }, undefined);

  const [isDialogOpen, setDialogOpen] =
    useActionState<boolean>( (prevState, _: FormData) => !prevState, false);


  return (
    <div className="flex flex-wrap gap-2">
      {equipment.status === 'Under Repair' && (
        <form action={startRepairTransition}>
          <Button type="submit" disabled={isRepairing}>
            {isRepairing ? (
              <Loader2 className="mr-2 animate-spin" />
            ) : (
              <CheckCircle className="mr-2" />
            )}
            Mark as Repaired
          </Button>
        </form>
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
             <RepairForm equipmentId={equipment.id} closeDialog={() => setDialogOpen(new FormData())} />
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
