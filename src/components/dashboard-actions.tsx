
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { checkinEquipment, checkoutEquipment, deleteEquipment, markAsRepaired } from '@/lib/actions';
import type { Equipment } from '@/lib/types';
import { Loader2, Trash2 } from 'lucide-react';
import { useState, useTransition } from 'react';

export function DashboardActions({ equipment }: { equipment: Equipment }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [borrowerName, setBorrowerName] = useState('');
  const [place, setPlace] = useState('');
  const [description, setDescription] = useState('');

  const handleCheckout = () => {
    if (!borrowerName.trim() || !place.trim() || !description.trim()) {
      toast({
        variant: 'destructive',
        title: 'Checkout Error',
        description: 'All fields are required.',
      });
      return;
    }
    startTransition(async () => {
      const result = await checkoutEquipment(equipment.id, borrowerName, place, description);
      if (result.success) {
        toast({ title: 'Success', description: result.message });
        setBorrowerName('');
        setPlace('');
        setDescription('');
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
                  Enter the details below to borrow this item.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="borrowerName">Your Name</Label>
                    <Input
                    id="borrowerName"
                    value={borrowerName}
                    onChange={(e) => setBorrowerName(e.target.value)}
                    placeholder="John Doe"
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="place">Place</Label>
                    <Input
                    id="place"
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    placeholder="e.g. Room 201, Offsite Event"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Purpose/Description</Label>
                    <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the purpose of borrowing this item..."
                    />
                </div>
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
