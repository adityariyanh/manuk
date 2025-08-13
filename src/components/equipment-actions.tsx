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
  Lightbulb,
  CheckCircle,
} from 'lucide-react';
import { useState, useTransition, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Badge } from './ui/badge';
import { Label } from './ui/label';

function RepairFormFields({ equipmentId }: { equipmentId: string }) {
  const { pending } = useFormStatus();
  return (
    <>
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
    </>
  );
}

function RepairSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Confirm and Get Suggestions
    </Button>
  );
}

export function EquipmentActions({ equipment }: { equipment: Equipment }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isSuggestionOpen, setSuggestionOpen] = useState(false);

  const initialRepairState: RepairState = { message: '' };
  const [repairState, repairDispatch] = useActionState(
    reportForRepair,
    initialRepairState
  );

  useEffect(() => {
    if (repairState.suggestions) {
      setSuggestionOpen(true);
    }
    if (repairState.error) {
      toast({
        variant: 'destructive',
        title: 'Repair Report Failed',
        description: repairState.error,
      });
    }
  }, [repairState, toast]);

  const handleRepair = () => {
    startTransition(async () => {
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
        <Button onClick={handleRepair} disabled={isPending}>
           {isPending ? (
            <Loader2 className="mr-2 animate-spin" />
          ) : (
            <CheckCircle className="mr-2" />
          )}
          Mark as Repaired
        </Button>
      )}

      {equipment.status !== 'Under Repair' && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isPending}>
              <Wrench className="mr-2" />
              Report for Repair
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <form action={repairDispatch}>
              <AlertDialogHeader>
                <AlertDialogTitle>Report for Repair</AlertDialogTitle>
                <AlertDialogDescription>
                  Describe the issue to submit this equipment for repair. Our AI
                  will suggest a replacement.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4 space-y-4">
                <RepairFormFields equipmentId={equipment.id} />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <RepairSubmitButton />
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <Dialog open={isSuggestionOpen} onOpenChange={setSuggestionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="text-primary" />
              AI Replacement Suggestions
            </DialogTitle>
            <DialogDescription>
              Based on historical data, here are some suggested replacements for{' '}
              <strong>{equipment.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Suggested Equipment:</h4>
              <div className="flex flex-wrap gap-2">
                {repairState.suggestions?.suggestedEquipment.map((item) => (
                  <Badge key={item} variant="secondary">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Reasoning:</h4>
              <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                {repairState.suggestions?.reasoning}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
