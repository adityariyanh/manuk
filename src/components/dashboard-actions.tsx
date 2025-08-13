
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
import { checkinEquipment, checkoutEquipment, deleteEquipment, markAsRepaired } from '@/lib/actions';
import type { Equipment } from '@/lib/types';
import { Loader2, Trash2 } from 'lucide-react';
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

  const handleDelete = () => {
    startTransition(async () => {
        const result = await deleteEquipment(equipment.id);
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

  const renderAction = () => {
    switch(equipment.status) {
      case 'Available':
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
      case 'Borrowed':
        return (
          <Button size="sm" onClick={handleCheckin} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 animate-spin" />}
            Check-in
          </Button>
        );

      case 'Under Repair':
        return (
          <Button size="sm" onClick={handleRepair} disabled={isPending} variant="outline">
            {isPending && <Loader2 className="mr-2 animate-spin" />}
            Mark Repaired
          </Button>
        );
      default:
        return null;
    }
  }

  return (
    <div className="flex items-center gap-2">
      {renderAction()}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive" disabled={isPending}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              equipment "{equipment.name}" and all of its history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
