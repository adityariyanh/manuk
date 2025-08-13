'use client';

import { notFound, redirect, useParams } from 'next/navigation';
import { getEquipmentById } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { checkinEquipment, checkoutEquipment } from '@/lib/actions';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState } from 'react';
import type { Equipment } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { addDays, format, type DateRange } from 'date-fns';

export default function EquipmentActionPage() {
  const params = useParams();
  const id = params.id as string;
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);

  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerPhone, setBorrowerPhone] = useState('');
  const [place, setPlace] = useState('');
  const [description, setDescription] = useState('');
  const [isOneDayCheckout, setIsOneDayCheckout] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 4)
  });


  useEffect(() => {
    if (!id) return;
    async function fetchEquipment() {
      try {
        const data = await getEquipmentById(id);
        if (data) {
          setEquipment(data);
        } else {
          notFound();
        }
      } catch (e) {
        console.error(e);
        notFound();
      } finally {
        setLoading(false);
      }
    }
    fetchEquipment();
  }, [id]);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (borrowerName) {
      const borrowedUntil = isOneDayCheckout ? addDays(new Date(), 1) : dateRange?.to;
      await checkoutEquipment(id, borrowerName, place, description, borrowerPhone, borrowedUntil);
      redirect(`/equipment/${id}`);
    }
  }

  async function handleCheckin() {
    await checkinEquipment(id);
    redirect(`/equipment/${id}`);
  }

  if (loading || !equipment) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted">
         <Card className="w-full max-w-md">
            <CardHeader>
              <Skeleton className='h-8 w-3/4' />
              <Skeleton className='h-6 w-1/2' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-48 w-full' />
            </CardContent>
         </Card>
      </div>
    )
  }


  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{equipment.name}</CardTitle>
          <CardDescription>{equipment.brand} - {equipment.category}</CardDescription>
        </CardHeader>
        <CardContent>
          {equipment.status === 'Available' && (
            <form onSubmit={handleCheckout} className="space-y-4">
              <h2 className="text-lg font-semibold">Checkout Item</h2>
              
              <div className="space-y-2">
                <Label htmlFor="borrowerName">Your Name</Label>
                <Input
                  id="borrowerName"
                  name="borrowerName"
                  placeholder="John Doe"
                  required
                  value={borrowerName}
                  onChange={e => setBorrowerName(e.target.value)}
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
                  name="place"
                  placeholder="e.g. Room 201, Offsite Event"
                  required
                  value={place}
                  onChange={e => setPlace(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Purpose/Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the purpose of borrowing this item..."
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

               <div className="flex items-center space-x-2">
                <Checkbox 
                  id="one-day-checkout" 
                  checked={isOneDayCheckout}
                  onCheckedChange={(checked) => setIsOneDayCheckout(Boolean(checked))}
                />
                <label
                  htmlFor="one-day-checkout"
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

              <Button type="submit" className="w-full">
                Confirm Checkout
              </Button>
            </form>
          )}

          {(equipment.status === 'Borrowed' || equipment.status === 'Reminder') && (
            <form onSubmit={(e) => { e.preventDefault(); handleCheckin(); }} className="space-y-4">
               <h2 className="text-lg font-semibold">Check-in Item</h2>
               <p>This item is currently borrowed by <strong>{equipment.borrowedBy}</strong>.</p>
                {equipment.borrowedUntil && (
                    <p>It is due to be returned by <strong>{format(equipment.borrowedUntil, "PPP")}</strong>.</p>
                )}
               <Button type="submit" className="w-full">
                Confirm Check-in
               </Button>
            </form>
          )}

          {equipment.status === 'Under Repair' && (
            <div className="text-center space-y-4">
               <h2 className="text-lg font-semibold text-destructive">Item Under Repair</h2>
               <p>This item is currently under repair and cannot be checked out.</p>
                <Button asChild variant="outline">
                    <Link href={`/equipment/${id}`}>View Details</Link>
                </Button>
            </div>
          )}
           <div className="mt-4 text-center">
            <Button asChild variant="link">
              <Link href={`/equipment/${id}`}>Back to Details</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
