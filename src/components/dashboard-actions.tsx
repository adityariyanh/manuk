
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
import { checkinEquipment, checkoutEquipment } from '@/lib/actions';
import type { Equipment } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useState, useTransition } from 'react';

export function DashboardActions({ equipment }: { equipment: Equipment }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [borrowerName, setBorrowerName] = useState('');

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
        setBorrowerName('');
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

  if (equipment.status === 'Available') {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" disabled={isPending}>
            Checkout
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Checkout {equipment.name}</AlertDialogTitle>
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
            <AlertDialogAction onClick={handleCheckout} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 animate-spin" />}
              Confirm Checkout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (equipment.status === 'Borrowed') {
    return (
      <Button size="sm" onClick={handleCheckin} disabled={isPending}>
        {isPending && <Loader2 className="mr-2 animate-spin" />}
        Check-in
      </Button>
    );
  }

  return null;
}
