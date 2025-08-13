
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type LoginState, signInWithEmail } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Login
    </Button>
  );
}

export default function LoginPage() {
  const initialState: LoginState = { message: '', success: false };
  const [state, dispatch] = useActionState(signInWithEmail, initialState);
  const { toast } = useToast();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const { user } = useAuth();


  useEffect(() => {
    // If the user is already logged in, redirect them to the dashboard.
    if (user) {
      router.push('/');
    }
  }, [user, router]);


  useEffect(() => {
    // This effect handles the result of the form submission
    if (state.success) {
      toast({
        title: 'Success!',
        description: state.message,
      });
      // The redirect is now handled by the main AuthProvider/hook
      // which waits for the auth state to be confirmed.
    } else if (state.message) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
       <Card className="w-full max-w-sm">
        <form action={dispatch} ref={formRef}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold font-headline">Admin Login</CardTitle>
            <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
