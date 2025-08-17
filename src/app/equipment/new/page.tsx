'use client';

import { EquipmentForm } from '@/components/equipment-form';
import { BulkUploadForm } from '@/components/bulk-upload-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function NewEquipmentPage() {
  return (
    <div className="p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline">
          Daftarkan Peralatan Baru
        </h1>
        <p className="text-muted-foreground">
          Isi detail di bawah ini atau gunakan fitur unggah massal.
        </p>
      </header>
      <Tabs defaultValue="single">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="single">Satu Barang</TabsTrigger>
          <TabsTrigger value="bulk">Unggah Massal</TabsTrigger>
        </TabsList>
        <TabsContent value="single">
          <EquipmentForm />
        </TabsContent>
        <TabsContent value="bulk">
          <BulkUploadForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
