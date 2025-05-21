
'use client'; // Add this directive

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Home, FileText, Layers, PlusCircle, Settings, PanelLeft, Shield, LayoutDashboard } from 'lucide-react';
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
import { Logo } from '@/components/icons/Logo';
import { AppHeader } from './AppHeader';
import { useLanguage } from '@/contexts/LanguageContext';

interface AppLayoutProps {
  children: ReactNode;
  currentPageTitleKey?: string;
  currentPageTitleParams?: Record<string, string | number | undefined>; 
}

export function AppLayout({ children, currentPageTitleKey, currentPageTitleParams }: AppLayoutProps) {
  const { t } = useLanguage(); 

  const mainNavItems = [
    { href: '/dashboard', labelKey: 'nav.dashboard', icon: <Home /> },
    { href: '/dashboard/my-tests', labelKey: 'nav.myTests', icon: <FileText /> },
    { href: '/dashboard/my-templates', labelKey: 'nav.myTemplates', icon: <Layers /> },
  ];

  const createNavItems = [
    { href: '/editor/new', labelKey: 'nav.newTest', icon: <PlusCircle /> },
    { href: '/templates/editor/new', labelKey: 'nav.newTemplate', icon: <PlusCircle /> },
  ];

  const secondaryNavItems = [
    { href: '/dashboard/settings', labelKey: 'nav.settings', icon: <Settings /> },
    { href: '/admin', labelKey: 'nav.adminPanel', icon: <Shield /> },
  ];

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="sidebar" collapsible="icon" className="border-r">
        <SidebarHeader className="p-4 flex items-center justify-between group-data-[collapsible=icon]:group-data-[state=collapsed]:p-2 group-data-[collapsible=icon]:group-data-[state=collapsed]:justify-center">
          <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:group-data-[state=collapsed]:w-full group-data-[collapsible=icon]:group-data-[state=collapsed]:h-full group-data-[collapsible=icon]:group-data-[state=collapsed]:p-1 group-data-[collapsible=icon]:group-data-[state=collapsed]:justify-center">
            <Logo className="h-7 w-auto group-data-[collapsible=icon]:group-data-[state=collapsed]:hidden" />
            <LayoutDashboard className="h-6 w-6 hidden group-data-[collapsible=icon]:group-data-[state=collapsed]:block text-primary" /> {/* Fallback icon */}
          </Link>
           <SidebarTrigger className="group-data-[collapsible=icon]:hidden">
            <PanelLeft />
           </SidebarTrigger>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {mainNavItems.map((item) => (
              <SidebarMenuItem key={item.labelKey}>
                <SidebarMenuButton asChild tooltip={t(item.labelKey)}>
                  <Link href={item.href}>
                    {item.icon}
                    <span>{t(item.labelKey)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          
          <div className="mt-4 mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground group-data-[collapsible=icon]:hidden">
            {t('nav.createNew')}
          </div>
          <SidebarMenu>
            {createNavItems.map((item) => (
              <SidebarMenuItem key={item.labelKey}>
                <SidebarMenuButton asChild tooltip={t(item.labelKey)}>
                  <Link href={item.href}>
                    {item.icon}
                    <span>{t(item.labelKey)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2 border-t">
           <SidebarMenu>
            {secondaryNavItems.map((item) => (
              <SidebarMenuItem key={item.labelKey}>
                <SidebarMenuButton asChild tooltip={t(item.labelKey)}>
                  <Link href={item.href}>
                    {item.icon}
                    <span>{t(item.labelKey)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <AppHeader titleKey={currentPageTitleKey} titleParams={currentPageTitleParams} /> 
        <main className="flex-1 overflow-y-auto p-6 bg-secondary/30">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
