
import { notFound, redirect } from 'next/navigation';
import { getEquipmentById } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { checkinEquipment, checkoutEquipment } from '@/lib/actions';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';

type Props = {
  params: { id: string };
};

export default async function EquipmentActionPage({ params }: Props) {
  const equipment = await getEquipmentById(params.id);

  if (!equipment) {
    notFound();
  }

  async function handleCheckout(formData: FormData) {
    'use server';
    const borrowerName = formData.get('borrowerName') as string;
    const place = formData.get('place') as string;
    const description = formData.get('description') as string;
    if (borrowerName) {
      await checkoutEquipment(params.id, borrowerName, place, description);
      redirect(`/equipment/${params.id}`);
    }
  }

  async function handleCheckin() {
    'use server';
    await checkinEquipment(params.id);
    redirect(`/equipment/${params.id}`);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{equipment.name}</CardTitle>
          <CardDescription>{equipment.model}</CardDescription>
        </CardHeader>
        <CardContent>
          {equipment.status === 'Available' && (
            <form action={handleCheckout} className="space-y-4">
              <h2 className="text-lg font-semibold">Checkout Item</h2>
              <div className="space-y-2">
                <Label htmlFor="borrowerName">Your Name</Label>
                <Input
                  id="borrowerName"
                  name="borrowerName"
                  placeholder="John Doe"
                  required
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="place">Place</Label>
                <Input
                  id="place"
                  name="place"
                  placeholder="e.g. Room 201, Offsite Event"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Purpose/Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the purpose of borrowing this item..."
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Confirm Checkout
              </Button>
            </form>
          )}

          {equipment.status === 'Borrowed' && (
            <form action={handleCheckin} className="space-y-4">
               <h2 className="text-lg font-semibold">Check-in Item</h2>
               <p>This item is currently borrowed by <strong>{equipment.borrowedBy}</strong>.</p>
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
                    <Link href={`/equipment/${params.id}`}>View Details</Link>
                </Button>
            </div>
          )}
           <div className="mt-4 text-center">
            <Button asChild variant="link">
              <Link href={`/equipment/${params.id}`}>Back to Details</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
