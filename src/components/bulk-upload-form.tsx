
'use client';

import { useState, useTransition } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { bulkRegisterEquipment } from '@/lib/actions';
import { Download, FileUp, Loader2 } from 'lucide-react';

const REQUIRED_HEADERS = ['name', 'brand', 'model', 'category'];

export function BulkUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const downloadTemplate = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([REQUIRED_HEADERS]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Equipment Template');
    XLSX.writeFile(workbook, 'equipment_template.csv');
  };

  const handleUpload = () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No file selected',
        description: 'Please select a file to upload.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
        }) as any[][];

        if (jsonData.length < 2) {
          throw new Error("File is empty or doesn't contain data rows.");
        }

        const headers = jsonData[0].map((h) => String(h).toLowerCase().trim());
        const missingHeaders = REQUIRED_HEADERS.filter(
          (h) => !headers.includes(h)
        );

        if (missingHeaders.length > 0) {
          throw new Error(
            `Missing required headers: ${missingHeaders.join(', ')}`
          );
        }

        const dataToUpload = jsonData.slice(1).map((row) => {
          const rowData: { [key: string]: any } = {};
          headers.forEach((header, index) => {
             // Explicitly convert every value to a string to handle numbers from the spreadsheet
            rowData[header] = String(row[index] ?? '');
          });
          return rowData;
        });

        startTransition(async () => {
          const result = await bulkRegisterEquipment(dataToUpload);
          if (result.success) {
            toast({
              title: 'Upload Successful!',
              description: result.message,
            });
            setFile(null);
            // Reset file input
            const fileInput = document.getElementById('bulk-upload-input') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
          } else {
            toast({
              variant: 'destructive',
              title: 'Upload Failed',
              description: result.message || 'An unknown error occurred.',
            });
          }
        });
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error processing file',
          description: error.message || 'An unknown error occurred.',
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Upload Equipment</CardTitle>
        <CardDescription>
          Upload a CSV or XLSX file to add multiple equipment items at once.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2 p-4 border rounded-md bg-muted/50">
           <h3 className="font-semibold">Step 1: Download Template</h3>
           <p className="text-sm text-muted-foreground">Download the template file to ensure your data is in the correct format.</p>
           <Button variant="outline" onClick={downloadTemplate} className='w-full sm:w-auto'>
              <Download className="mr-2" />
              Download Template
            </Button>
        </div>
        <div className="space-y-2 p-4 border rounded-md bg-muted/50">
            <h3 className="font-semibold">Step 2: Upload File</h3>
            <p className="text-sm text-muted-foreground">Select the completed CSV or XLSX file from your computer.</p>
            <div className="space-y-2">
                <Label htmlFor="bulk-upload-input" className="sr-only">Choose File</Label>
                <Input
                    id="bulk-upload-input"
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleFileChange}
                    disabled={isPending}
                    className='file:text-foreground'
                />
            </div>
            {file && (
                <p className="text-sm text-muted-foreground">Selected file: {file.name}</p>
            )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleUpload} disabled={isPending || !file} className='w-full sm:w-auto'>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileUp className="mr-2" />
          )}
          Upload File
        </Button>
      </CardFooter>
    </Card>
  );
}
