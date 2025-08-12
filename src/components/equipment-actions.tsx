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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  checkinEquipment,
  checkoutEquipment,
  reportForRepair,
  type RepairState,
} from '@/lib/actions';
import type { Equipment } from '@/lib/types';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  Wrench,
  Lightbulb,
} from 'lucide-react';
import { useState, useTransition, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
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
  const [borrowerName, setBorrowerName] = useState('');
  const [isSuggestionOpen, setSuggestionOpen] = useState(false);

  const initialRepairState: RepairState = { message: '' };
  const [repairState, repairDispatch] = useFormState(
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

  const handleCheckout = () => {
    if (!borrowerName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Checkout Error',
        description: 'Borrower name cannot be empty.',
      });
      return;
    }
    startTransition(async () => {
      const result = await checkoutEquipment(equipment.id, borrowerName);
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

  const handleCheckin = () => {
    startTransition(async () => {
      const result = await checkinEquipment(equipment.id);
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
      {equipment.status === 'Available' && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={isPending}>
              <ArrowUpRight className="mr-2" />
              Checkout
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Checkout Equipment</AlertDialogTitle>
              <AlertDialogDescription>
                Enter your name to borrow this item.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="borrowerName">Your Name</Label>
              <Input
                id="borrowerName"
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleCheckout}>
                {isPending && <Loader2 className="mr-2 animate-spin" />}
                Confirm Checkout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {equipment.status === 'Borrowed' && (
        <Button onClick={handleCheckin} disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 animate-spin" />
          ) : (
            <ArrowDownLeft className="mr-2" />
          )}
          Check-in
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
