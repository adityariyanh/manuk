'use client';

import { useAuth } from '@/hooks/use-auth';
import { Dashboard } from '@/components/dashboard';
import { LoginForm } from '@/components/login-form';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  return <LoginForm />;
}
