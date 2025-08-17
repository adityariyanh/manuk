
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
import { addDays, format, type DateRange, endOfDay } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

export function DashboardActions({ equipment, onActionSuccess }: { equipment: Equipment, onActionSuccess: () => void }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // State for the checkout modal
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerPhone, setBorrowerPhone] = useState('');
  const [place, setPlace] = useState('');
  const [description, setDescription] = useState('');
  const [borrowType, setBorrowType] = useState<'studio' | 'short' | 'long'>('short');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 1),
  });
  const [isModalOpen, setModalOpen] = useState(false);

  const handleCheckout = () => {
    const isStudioUsage = borrowType === 'studio';
    if (!borrowerName.trim() || (!isStudioUsage && !place.trim()) || !description.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error Pinjam',
        description: 'Nama, Tempat (jika relevan), dan Tujuan wajib diisi.',
      });
      return;
    }
    startTransition(async () => {
       let borrowedUntil;
        switch(borrowType) {
          case 'studio':
            borrowedUntil = endOfDay(new Date());
            break;
          case 'short':
            borrowedUntil = addDays(new Date(), 1);
            break;
          case 'long':
            borrowedUntil = dateRange?.to;
            break;
        }
      
      const finalPlace = isStudioUsage ? 'Studio' : place;
      const result = await checkoutEquipment(
        equipment.id,
        borrowerName,
        finalPlace,
        description,
        borrowerPhone,
        dateRange?.from,
        borrowedUntil
      );
      if (result.success) {
        toast({ variant: 'success', title: 'Sukses', description: result.message });
        setBorrowerName('');
        setPlace('');
        setBorrowerPhone('');
        setDescription('');
        setBorrowType('short');
        setModalOpen(false);
        onActionSuccess();
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
        toast({ variant: 'success', title: 'Sukses', description: result.message });
        onActionSuccess();
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
        toast({ variant: 'success', title: 'Sukses', description: result.message });
        onActionSuccess();
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
        toast({ variant: 'success', title: 'Sukses', description: result.message });
        onActionSuccess();
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
                Pinjam
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Pinjam {equipment.name}</AlertDialogTitle>
                <AlertDialogDescription>
                  Masukkan detail di bawah ini untuk meminjam barang ini.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4 -mx-4 px-4 max-h-[60vh] overflow-y-auto">
                <div className='space-y-4 pr-1'>
                  <div className="space-y-2">
                    <Label htmlFor="borrowerName">Nama Anda</Label>
                    <Input
                      id="borrowerName"
                      value={borrowerName}
                      onChange={(e) => setBorrowerName(e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="borrowerPhone">
                      Nomor Telepon (Opsional)
                    </Label>
                    <Input
                      id="borrowerPhone"
                      name="borrowerPhone"
                      placeholder="cth. 08123456789"
                      value={borrowerPhone}
                      onChange={(e) => setBorrowerPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Jenis Peminjaman</Label>
                    <RadioGroup 
                      value={borrowType} 
                      onValueChange={(value) => setBorrowType(value as any)}
                      className="space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="studio" id="studio-modal" />
                        <Label htmlFor="studio-modal">Penggunaan Studio</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="short" id="short-modal" />
                        <Label htmlFor="short-modal">Pinjam Kurang dari 1 Hari</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="long" id="long-modal" />
                        <Label htmlFor="long-modal">Pinjam Lebih dari 1 Hari</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  {borrowType !== 'studio' && (
                    <div className="space-y-2">
                      <Label htmlFor="place">Tempat</Label>
                      <Input
                        id="place"
                        value={place}
                        onChange={(e) => setPlace(e.target.value)}
                        placeholder="cth. Ruang 201, Acara Luar"
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="description">Tujuan/Deskripsi</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Jelaskan tujuan meminjam barang ini..."
                      required
                    />
                  </div>

                  {borrowType === 'long' && (
                    <div className="space-y-2">
                      <Label>Pilih Periode Pinjam</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={'outline'}
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange?.from ? (
                                format(dateRange.from, 'LLL dd, y')
                              ) : (
                                <span>Tanggal Pinjam</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dateRange?.from}
                              onSelect={(date) =>
                                setDateRange((prev) => ({ ...prev, from: date }))
                              }
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={'outline'}
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange?.to ? (
                                format(dateRange.to, 'LLL dd, y')
                              ) : (
                                <span>Tanggal Kembali</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dateRange?.to}
                              onSelect={(date) =>
                                setDateRange((prev) => ({ ...prev, to: date }))
                              }
                              disabled={(date) =>
                                (dateRange?.from && date < dateRange.from) ||
                                date < new Date(new Date().setHours(0, 0, 0, 0))
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
                        onClick={() =>
                          setDateRange((prev) => ({ ...prev, from: new Date() }))
                        }
                      >
                        Atur Tanggal Pinjam ke Hari Ini
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleCheckout} disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 animate-spin" />}
                  Konfirmasi Pinjam
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      case 'Borrowed':
      case 'Follow Up':
      case 'Reminder':
        return (
          <Button size="sm" onClick={handleCheckin} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 animate-spin" />}
            Kembali
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
            Tandai Selesai Diperbaiki
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <AlertDialog>
      <div className="flex items-center justify-end gap-2">
        {renderAction()}

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/equipment/${equipment.id}`}>
              <FileText />
              <span className="ml-2">Detail</span>
            </Link>
          </Button>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon">
              <Trash2 />
              <span className="sr-only">Hapus</span>
            </Button>
          </AlertDialogTrigger>
        </div>

        {/* Mobile Actions */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Aksi lainnya</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/equipment/${equipment.id}`}>
                  <FileText className="mr-2" />
                  Detail
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2" />
                  Hapus
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus secara permanen
            peralatan "{equipment.name}" dan semua riwayatnya.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
