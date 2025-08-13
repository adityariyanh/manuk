
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
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Home, PlusCircle, Package, History, QrCode } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
        </SidebarContent>
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
