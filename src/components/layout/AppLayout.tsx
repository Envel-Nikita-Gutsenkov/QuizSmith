import type { ReactNode } from 'react';
import Link from 'next/link';
import { Home, FileText, Layers, PlusCircle, Settings, PanelLeft } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons/Logo';
import { AppHeader } from './AppHeader';

interface AppLayoutProps {
  children: ReactNode;
  currentPageTitle?: string;
}

const mainNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: <Home /> },
  { href: '/dashboard/my-tests', label: 'My Tests', icon: <FileText /> },
  { href: '/dashboard/my-templates', label: 'My Templates', icon: <Layers /> },
];

const createNavItems = [
  { href: '/editor/new', label: 'New Test', icon: <PlusCircle /> },
  { href: '/templates/editor/new', label: 'New Template', icon: <PlusCircle /> },
];

const secondaryNavItems = [
 { href: '/dashboard/settings', label: 'Settings', icon: <Settings /> },
];


export function AppLayout({ children, currentPageTitle }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="sidebar" collapsible="icon" className="border-r">
        <SidebarHeader className="p-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo className="h-7 w-auto" />
          </Link>
           <SidebarTrigger className="group-data-[collapsible=icon]:hidden">
            <PanelLeft />
           </SidebarTrigger>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {mainNavItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild tooltip={item.label}>
                  <Link href={item.href}>
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          
          <div className="mt-4 mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground group-data-[collapsible=icon]:hidden">
            Create New
          </div>
          <SidebarMenu>
            {createNavItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild tooltip={item.label}>
                  <Link href={item.href}>
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2 border-t">
           <SidebarMenu>
            {secondaryNavItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild tooltip={item.label}>
                  <Link href={item.href}>
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <AppHeader title={currentPageTitle} />
        <main className="flex-1 overflow-y-auto p-6 bg-secondary/30">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
