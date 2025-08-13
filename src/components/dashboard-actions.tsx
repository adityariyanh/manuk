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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  checkinEquipment,
  checkoutEquipment,
  deleteEquipment,
  markAsRepaired,
} from '@/lib/actions';
import type { Equipment } from '@/lib/types';
import {
  Loader2,
  MoreHorizontal,
  Trash2,
  FileText,
  CalendarIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { addDays, format, type DateRange } from 'date-fns';
import { Checkbox } from './ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';

export function DashboardActions({ equipment }: { equipment: Equipment }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  // State for the checkout modal
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerPhone, setBorrowerPhone] = useState('');
  const [place, setPlace] = useState('');
  const [description, setDescription] = useState('');
  const [isOneDayCheckout, setIsOneDayCheckout] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 4),
  });
  const [isModalOpen, setModalOpen] = useState(false);


  const handleCheckout = () => {
    if (!borrowerName.trim() || !place.trim() || !description.trim()) {
      toast({
        variant: 'destructive',
        title: 'Checkout Error',
        description: 'Name, Place, and Purpose are required.',
      });
      return;
    }
    startTransition(async () => {
      const borrowedUntil = isOneDayCheckout ? addDays(new Date(), 1) : dateRange?.to;
      const result = await checkoutEquipment(
        equipment.id,
        borrowerName,
        place,
        description,
        borrowerPhone,
        borrowedUntil
      );
      if (result.success) {
        toast({ title: 'Success', description: result.message });
        // Reset form and close modal
        setBorrowerName('');
        setPlace('');
        setBorrowerPhone('');
        setDescription('');
        setIsOneDayCheckout(true);
        setModalOpen(false);
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
    switch (equipment.status) {
      case 'Available':
        return (
          <AlertDialog open={isModalOpen} onOpenChange={setModalOpen}>
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
              <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                <div className="space-y-2">
                  <Label htmlFor="borrowerName">Your Name</Label>
                  <Input
                    id="borrowerName"
                    value={borrowerName}
                    onChange={(e) => setBorrowerName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="borrowerPhone">Phone Number (Optional)</Label>
                    <Input
                    id="borrowerPhone"
                    name="borrowerPhone"
                    placeholder="e.g. 08123456789"
                    value={borrowerPhone}
                    onChange={e => setBorrowerPhone(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="place">Place</Label>
                  <Input
                    id="place"
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    placeholder="e.g. Room 201, Offsite Event"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Purpose/Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the purpose of borrowing this item..."
                    required
                  />
                </div>
                 <div className="flex items-center space-x-2">
                    <Checkbox 
                    id="one-day-checkout-modal" 
                    checked={isOneDayCheckout}
                    onCheckedChange={(checked) => setIsOneDayCheckout(Boolean(checked))}
                    />
                    <label
                    htmlFor="one-day-checkout-modal"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                    1-Day Checkout (Return tomorrow)
                    </label>
                </div>

                {!isOneDayCheckout && (
                    <div className="space-y-2">
                    <Label>Select Return Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className="w-full justify-start text-left font-normal"
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                            dateRange.to ? (
                                <>
                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                {format(dateRange.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(dateRange.from, "LLL dd, y")
                            )
                            ) : (
                            <span>Pick a date range</span>
                            )}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={1}
                            disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                        />
                        </PopoverContent>
                    </Popover>
                    </div>
                )}
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
      case 'Reminder':
        return (
          <Button size="sm" onClick={handleCheckin} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 animate-spin" />}
            Check-in
          </Button>
        );

      case 'Under Repair':
        return (
          <Button
            size="sm"
            onClick={handleRepair}
            disabled={isPending}
            variant="outline"
          >
            {isPending && <Loader2 className="mr-2 animate-spin" />}
            Mark Repaired
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {renderAction()}
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/equipment/${equipment.id}`}>
                <FileText className="mr-2" />
                Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2" />
                Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>
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
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
