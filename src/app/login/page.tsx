
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/icons/Logo';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <Link href="/" className="inline-block mb-4">
            <Logo />
          </Link>
          <CardTitle className="text-2xl">Welcome Back!</CardTitle>
          <CardDescription>Enter your credentials to access QuizSmith.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/login" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" asChild>
            {/* In a real app, this would attempt authentication */}
            <Link href="/dashboard">Login</Link>
          </Button>
          {/* Removed "Try Demo" button as the context is now for real users */}
          <p className="text-sm text-muted-foreground text-center">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Contact Admin
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
