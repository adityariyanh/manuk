
'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, type User, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const adminRoutes = ['/', '/equipment/new', '/history', '/qr-codes'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAdminRoute = adminRoutes.includes(pathname);

    if (!user && isAdminRoute) {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };
  
  const value = { user, loading, logout };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="w-12 h-12 animate-spin" />
        </div>
    )
  }

  // Allow public access to non-admin routes
  if (!adminRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // For admin routes, only render if the user is authenticated
  if (user && adminRoutes.includes(pathname)) {
     return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  }

  return null; // Or a redirect component
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
