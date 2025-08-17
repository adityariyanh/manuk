
'use client';

import { notFound, useParams, useRouter } from 'next/navigation';
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
import { CalendarIcon, Loader2 } from 'lucide-react';
import { addDays, format, type DateRange } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface PageProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}


export default function EquipmentActionPage({ params }: PageProps) {
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();
  
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerPhone, setBorrowerPhone] = useState('');
  const [place, setPlace] = useState('');
  const [description, setDescription] = useState('');
  const [isOneDayCheckout, setIsOneDayCheckout] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 1)
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
    if (!borrowerName || !place || !description) {
      toast({ variant: 'destructive', title: 'Error', description: 'Silakan isi semua bidang yang wajib diisi.' });
      return;
    }

    setIsSubmitting(true);
    const borrowedUntil = isOneDayCheckout ? addDays(new Date(), 1) : dateRange?.to;
    const result = await checkoutEquipment(id, borrowerName, place, description, borrowerPhone, dateRange?.from, borrowedUntil);

    if (result.success) {
      toast({ title: 'Sukses', description: result.message });
      router.push(`/equipment/${id}`);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
      setIsSubmitting(false);
    }
  }

  async function handleCheckin() {
    setIsSubmitting(true);
    const result = await checkinEquipment(id);
    if (result.success) {
      toast({ title: 'Sukses', description: result.message });
      router.push(`/equipment/${id}`);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
      setIsSubmitting(false);
    }
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
              <h2 className="text-lg font-semibold">Pinjam Barang</h2>
              
              <div className="space-y-2">
                <Label htmlFor="borrowerName">Nama Anda</Label>
                <Input
                  id="borrowerName"
                  name="borrowerName"
                  placeholder="John Doe"
                  required
                  value={borrowerName}
                  onChange={e => setBorrowerName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

               <div className="space-y-2">
                <Label htmlFor="borrowerPhone">Nomor Telepon (Opsional)</Label>
                <Input
                  id="borrowerPhone"
                  name="borrowerPhone"
                  placeholder="cth. 08123456789"
                  value={borrowerPhone}
                  onChange={e => setBorrowerPhone(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

               <div className="space-y-2">
                <Label htmlFor="place">Tempat</Label>
                <Input
                  id="place"
                  name="place"
                  placeholder="cth. Ruang 201, Acara di Luar"
                  required
                  value={place}
                  onChange={e => setPlace(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Tujuan/Deskripsi</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Jelaskan tujuan meminjam barang ini..."
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

               <div className="flex items-center space-x-2">
                <Checkbox 
                  id="one-day-checkout" 
                  checked={isOneDayCheckout}
                  onCheckedChange={(checked) => setIsOneDayCheckout(Boolean(checked))}
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="one-day-checkout"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Pinjam 1 Hari (Kembali besok)
                </label>
              </div>

              {!isOneDayCheckout && (
                <div className="space-y-2">
                   <Label>Pilih Periode Peminjaman</Label>
                   <div className="grid grid-cols-2 gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className="w-full justify-start text-left font-normal"
                            disabled={isSubmitting}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? format(dateRange.from, "LLL dd, y") : <span>Tanggal Pinjam</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateRange?.from}
                            onSelect={(date) => setDateRange(prev => ({...prev, from: date}))}
                            disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                           <Button
                            variant={"outline"}
                            className="w-full justify-start text-left font-normal"
                            disabled={isSubmitting}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.to ? format(dateRange.to, "LLL dd, y") : <span>Tanggal Kembali</span>}
                          </Button>
                        </PopoverTrigger>
                         <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateRange?.to}
                            onSelect={(date) => setDateRange(prev => ({...prev, to: date}))}
                             disabled={(date) => 
                                (dateRange?.from && date < dateRange.from) || 
                                date < new Date(new Date().setHours(0,0,0,0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                   </div>
                   <Button 
                      type="button" 
                      variant="ghost" 
                      className="w-full"
                      onClick={() => setDateRange(prev => ({...prev, from: new Date()}))}
                      disabled={isSubmitting}
                    >
                      Atur Tanggal Pinjam ke Hari Ini
                    </Button>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                Konfirmasi Pinjam
              </Button>
            </form>
          )}

          {(equipment.status === 'Borrowed' || equipment.status === 'Follow Up' || equipment.status === 'Reminder') && (
            <form onSubmit={(e) => { e.preventDefault(); handleCheckin(); }} className="space-y-4">
               <h2 className="text-lg font-semibold">Kembalikan Barang</h2>
               <p>Barang ini sedang dipinjam oleh <strong>{equipment.borrowedBy}</strong>.</p>
                {equipment.borrowedUntil && (
                    <p>Jatuh tempo pengembalian pada <strong>{format(new Date(equipment.borrowedUntil), "PPP")}</strong>.</p>
                )}
               <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                Konfirmasi Kembali
               </Button>
            </form>
          )}

          {equipment.status === 'Under Repair' && (
            <div className="text-center space-y-4">
               <h2 className="text-lg font-semibold text-destructive">Barang Sedang Diperbaiki</h2>
               <p>Barang ini sedang dalam perbaikan dan tidak dapat dipinjam.</p>
                <Button asChild variant="outline">
                    <Link href={`/equipment/${id}`}>Lihat Detail</Link>
                </Button>
            </div>
          )}
           <div className="mt-4 text-center">
            <Button asChild variant="link">
              <Link href={`/equipment/${id}`}>Kembali ke Detail</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
