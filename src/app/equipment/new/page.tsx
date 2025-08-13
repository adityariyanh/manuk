'use client';

import { EquipmentForm } from '@/components/equipment-form';
import { BulkUploadForm } from '@/components/bulk-upload-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function NewEquipmentPage() {
  return (
    <div className="p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline">
          Register New Equipment
        </h1>
        <p className="text-muted-foreground">
          Fill in the details below or use the bulk upload feature.
        </p>
      </header>
      <Tabs defaultValue="single">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="single">Single Item</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
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
