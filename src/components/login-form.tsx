
'use client';

import { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function LoginForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Login Gagal',
        description: 'Email dan password tidak boleh kosong.',
      });
      return;
    }

    startTransition(async () => {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          variant: 'success',
          title: 'Login Berhasil!',
          description: 'Mengarahkan ke dasbor Anda...',
        });
        // The redirect is handled by the useAuth hook and the main page component
      } catch (error: any) {
        let errorMessage = 'Terjadi kesalahan yang tidak diketahui.';
         switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
              errorMessage = 'Email atau password salah.';
              break;
            case 'auth/invalid-email':
              errorMessage = 'Silakan masukkan alamat email yang valid.';
              break;
            default:
              errorMessage = 'Gagal login. Silakan coba lagi nanti.';
              break;
          }
        toast({
          variant: "destructive",
          title: "Login Gagal",
          description: errorMessage,
        });
      }
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold font-headline">
              Login Admin
            </CardTitle>
            <CardDescription>
              Masukkan kredensial Anda untuk mengakses dasbor.
            </CardDescription>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
