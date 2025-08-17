
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateEquipmentDetails } from '@/lib/actions';
import type { Equipment } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export function EditEquipmentForm({ equipment }: { equipment: Equipment }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    name: equipment.name,
    brand: equipment.brand,
    model: equipment.model,
    category: equipment.category,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateEquipmentDetails(equipment.id, formData);
      if (result.success) {
        toast({
          title: 'Sukses!',
          description: result.message,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Pembaruan Gagal',
          description: result.message || 'Terjadi kesalahan yang tidak diketahui.',
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Ubah Detail Peralatan</CardTitle>
          <CardDescription>
            Buat perubahan pada informasi peralatan di bawah ini.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Peralatan</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand">Merek</Label>
            <Input
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Input
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              disabled={isPending}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Perubahan
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
