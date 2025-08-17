'use client';

import { useFormStatus } from 'react-dom';
import { useActionState } from 'react';
import { registerEquipment, type FormState } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Tambah Peralatan
    </Button>
  );
}

export function EquipmentForm() {
  const initialState: FormState = { message: '', errors: {}, success: false };
  const [state, dispatch] = useActionState(registerEquipment, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast({
        variant: 'success',
        title: 'Sukses!',
        description: state.message,
      });
      formRef.current?.reset();
    } else if (state.message && state.errors) {
        const errorFields = Object.keys(state.errors).join(', ');
        toast({
            variant: "destructive",
            title: "Error menambah peralatan",
            description: `${state.message} Mohon perbaiki bidang berikut: ${errorFields}`
        });
    } else if (state.message) {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <form action={dispatch} ref={formRef}>
      <Card>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Peralatan</Label>
            <Input id="name" name="name" placeholder="cth. Canon EOS R5" required />
            {state.errors?.name && (
              <p className="text-sm text-destructive">{state.errors.name[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand">Merek</Label>
            <Input id="brand" name="brand" placeholder="cth. Canon" required />
            {state.errors?.brand && (
              <p className="text-sm text-destructive">{state.errors.brand[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input id="model" name="model" placeholder="cth. EOS R5" required />
            {state.errors?.model && (
              <p className="text-sm text-destructive">{state.errors.model[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Input id="category" name="category" placeholder="cth. Fotografi, Audio" required />
            {state.errors?.category && (
              <p className="text-sm text-destructive">{state.errors.category[0]}</p>
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
