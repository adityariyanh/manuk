'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';

export function QrCodeCard({ equipmentId }: { equipmentId: string }) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  
  useEffect(() => {
    // The QR code now points to the dedicated action URL
    const url = `${window.location.origin}/equipment/${equipmentId}/action`;
    setQrCodeUrl(
      `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        url
      )}&qzone=1`
    );
  }, [equipmentId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Code</CardTitle>
        <CardDescription>Scan to take action on this item.</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center items-center p-6">
        {qrCodeUrl ? (
          <Image
            src={qrCodeUrl}
            alt="Equipment QR Code"
            width={200}
            height={200}
            className="rounded-lg"
          />
        ) : (
          <Skeleton className="w-[200px] h-[200px]" />
        )}
      </CardContent>
    </Card>
  );
}
