
"use client";

import Link from 'next/link';
import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { LayoutGrid, LogOut, Settings, User as UserIcon, Globe, LayoutDashboard } from 'lucide-react'; // Added LayoutDashboard, renamed User
import { useSidebar } from '@/components/ui/sidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext'; // Added useAuth
import { useState, useEffect } from 'react';

interface AppHeaderProps {
  titleKey?: string;
  titleParams?: Record<string, string | number | undefined>;
}

export function AppHeader({ titleKey, titleParams }: AppHeaderProps) {
  const { toggleSidebar, isMobile } = useSidebar();
  const { language, setLanguage, t } = useLanguage();
  const { currentUser, logout, loading: authLoading } = useAuth(); // Added
  const [renderedTitle, setRenderedTitle] = useState<string | undefined>(undefined);

  const getInitials = (email?: string | null, name?: string | null) => {
    if (name) return name.substring(0, 2).toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return 'QS';
  };

  useEffect(() => {
    if (titleKey) {
      const initialTitle = t(titleKey, titleParams, titleKey);
      setRenderedTitle(initialTitle);
    } else {
      setRenderedTitle(undefined);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleKey, titleParams, language, t]); // Added language to deps to re-render title on lang change


  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      {/* Left part: Toggle, Logo, Title */}
      <div className="flex items-center gap-4">
        {isMobile && (
          <Button variant="outline" size="icon" className="shrink-0" onClick={toggleSidebar} aria-label={t('appHeader.toggleSidebar', {defaultValue: 'Toggle sidebar'})}>
            <LayoutGrid className="h-5 w-5" />
          </Button>
        )}
        {/* Always show Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo className="h-6 w-auto" />
        </Link>
        {/* Desktop Title */}
        {renderedTitle && (
          <h1 className="text-lg font-semibold text-foreground hidden md:block">{renderedTitle}</h1>
        )}
      </div>
      
      {/* Right part: Actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Language Selector Dropdown - Kept as is */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label={t('appHeader.language')}>
              <Globe className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t('appHeader.language')}</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={language} onValueChange={(value) => setLanguage(value as 'en' | 'ru')}>
              <DropdownMenuRadioItem value="en">{t('appHeader.lang.en')}</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="ru">{t('appHeader.lang.ru')}</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Auth Area */}
        {authLoading ? (
          <div className="h-8 w-20 animate-pulse rounded-md bg-muted"></div> // Skeleton loader
        ) : currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser.displayName || currentUser.email || 'User'} />
                  <AvatarFallback>{getInitials(currentUser.email, currentUser.displayName)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {currentUser.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>{t('appHeader.dashboardLink', { defaultValue: 'Dashboard' })}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                 <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('appHeader.settingsLink', { defaultValue: 'Settings' })}</span>
                </Link>
              </DropdownMenuItem>
              {/* The existing profile link also pointed to settings, so this is fine. */}
              {/* <DropdownMenuItem asChild>
                <Link href="/dashboard/settings"> 
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>{t('appHeader.profile', {defaultValue: 'Profile'})}</span>
                </Link>
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('appHeader.logout', { defaultValue: 'Log out' })}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild variant="ghost">
            <Link href="/login">{t('appHeader.login', { defaultValue: 'Login' })}</Link>
          </Button>
          // Sign up is admin managed, so no direct link here.
        )}
      </div>
    </header>
  );
}
