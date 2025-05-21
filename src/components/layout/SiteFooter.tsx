import Link from 'next/link';
import { Logo } from '@/components/icons/Logo';

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 py-8 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Logo className="hidden h-6 w-auto md:block" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by Your Name/Company. The source code is available on GitHub.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
