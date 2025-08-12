'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { registerEquipment, type FormState } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Add Equipment
    </Button>
  );
}

export function EquipmentForm() {
  const initialState: FormState = { message: '', errors: {} };
  const [state, dispatch] = useFormState(registerEquipment, initialState);
  const [date, setDate] = useState<Date | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    if (state.message && state.errors) {
        const errorFields = Object.keys(state.errors).join(', ');
        toast({
            variant: "destructive",
            title: "Error adding equipment",
            description: `Please correct the following fields: ${errorFields}`
        });
    }
  }, [state, toast])

  return (
    <form action={dispatch}>
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Equipment Name</Label>
            <Input id="name" name="name" placeholder="e.g. Canon EOS R5" required />
            {state.errors?.name && (
              <p className="text-sm text-destructive">{state.errors.name[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Model/Type</Label>
            <Input id="model" name="model" placeholder="e.g. Camera" required />
            {state.errors?.model && (
              <p className="text-sm text-destructive">{state.errors.model[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="purchaseDate">Purchase Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(d) => d > new Date()}
                />
              </PopoverContent>
            </Popover>
            <input type="hidden" name="purchaseDate" value={date?.toISOString()} />
            {state.errors?.purchaseDate && (
                <p className="text-sm text-destructive">{state.errors.purchaseDate[0]}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <SubmitButton />
        </CardFooter>
      </Card>
    </form>
  );
}
