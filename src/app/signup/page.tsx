
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/icons/Logo';
import { ShieldCheck } from 'lucide-react';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-2 text-center">
           <Link href="/" className="inline-block mb-4">
            <Logo />
          </Link>
          <CardTitle className="text-2xl flex items-center justify-center">
            <ShieldCheck className="mr-2 h-7 w-7 text-primary" />
            Account Registration
          </CardTitle>
          <CardDescription>
            User registration for QuizSmith is managed by administrators.
            If you need an account, please contact your designated administrator.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            Once your account is created, you can log in using your provided credentials.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
           <p className="text-xs text-muted-foreground text-center px-2">
            By using QuizSmith, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link> and {' '}
            <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
          </p>
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
