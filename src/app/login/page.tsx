'use client'; // Ensure this is at the top

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/icons/Logo';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { useState, FormEvent, useEffect } from 'react'; // Added useEffect
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
// For the modal (if using Radix Dialog, which seems to be a dependency)
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';


export default function LoginPage() {
  const { login, resetPassword, currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      // onAuthStateChanged in AuthContext will set currentUser.
      // We can redirect here or let a protected route/layout handle it.
      // router.push('/dashboard'); // This might be premature if auth state isn't updated yet
    } catch (error) {
      // Toast is handled in AuthContext's login method
      console.error("Login page error catch:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordReset = async (event: FormEvent) => {
    event.preventDefault();
    if (!resetEmail) {
      toast({ title: "Email Required", description: "Please enter your email address.", variant: "destructive" });
      return;
    }
    setIsResetting(true);
    try {
      await resetPassword(resetEmail);
      // Toast success is handled in AuthContext
      setIsResetModalOpen(false); // Close modal on success
      setResetEmail(''); // Clear reset email field
    } catch (error) {
      // Toast error is handled in AuthContext
      console.error("Reset password page error catch:", error);
    } finally {
      setIsResetting(false);
    }
  };

  // Redirect if user is already logged in
  useEffect(() => {
    if (!authLoading && currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, authLoading, router]);

  if (authLoading || (!authLoading && currentUser)) {
    // Show loading indicator or null while checking auth state or redirecting
    return <div className="flex min-h-screen items-center justify-center"><p>Loading...</p></div>;
  }

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
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="link" type="button" className="text-sm p-0 h-auto">Forgot password?</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reset Password</DialogTitle>
                      <DialogDescription>
                        Enter your email address below and we&apos;ll send you a link to reset your password.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handlePasswordReset}>
                      <div className="space-y-2 py-4">
                        <Label htmlFor="reset-email">Email</Label>
                        <Input 
                          id="reset-email" 
                          type="email" 
                          placeholder="you@example.com" 
                          value={resetEmail} 
                          onChange={(e) => setResetEmail(e.target.value)} 
                          required 
                          disabled={isResetting}
                        />
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                           <Button type="button" variant="outline" disabled={isResetting}>Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isResetting}>
                          {isResetting ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-semibold text-primary hover:underline">
                Contact Admin
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
