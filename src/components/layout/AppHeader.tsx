
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
import { LayoutGrid, LogOut, Settings, User, Globe } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';

interface AppHeaderProps {
  titleKey?: string;
  titleParams?: Record<string, string | number | undefined>;
}

export function AppHeader({ titleKey, titleParams }: AppHeaderProps) {
  const { toggleSidebar, isMobile } = useSidebar();
  const { language, setLanguage, t } = useLanguage();
  const [renderedTitle, setRenderedTitle] = useState<string | undefined>(undefined);

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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://placehold.co/100x100.png" alt="User avatar" data-ai-hint="person avatar" />
                <AvatarFallback>QS</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{t('appHeader.myAccount')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings"> 
                <User className="mr-2 h-4 w-4" />
                <span>{t('appHeader.profile')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>{t('appHeader.settingsLink')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/login">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('appHeader.logout')}</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
