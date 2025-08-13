
'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Home, PlusCircle, Package, History, QrCode, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/equipment/new', label: 'Add Equipment', icon: PlusCircle },
    { href: '/history', label: 'History', icon: History },
    { href: '/qr-codes', label: 'QR Codes', icon: QrCode },
  ];
  
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold text-primary"
          >
            <Package className="w-6 h-6" />
            <span className="font-headline">MANUC</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          {loading ? (
              <div className='p-2 space-y-2'>
                  <Skeleton className='h-8 w-full' />
                  <Skeleton className='h-8 w-full' />
                  <Skeleton className='h-8 w-full' />
              </div>
          ): user ? (
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          ) : (
            <div className="p-4 text-sm text-muted-foreground">
              Please log in to manage equipment.
            </div>
          )}
        </SidebarContent>
         {user && (
           <SidebarFooter>
              <Button variant="ghost" onClick={logout} className="w-full justify-start">
                <LogOut className="mr-2" />
                Logout
              </Button>
            </SidebarFooter>
         )}
      </Sidebar>
      <SidebarInset>
        <header className="p-4 flex items-center gap-4 md:hidden border-b sticky top-0 bg-background z-10">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold">MANUC</h1>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
