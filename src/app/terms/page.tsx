
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-3xl">Terms of Service</CardTitle>
              <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 prose dark:prose-invert max-w-none">
              <p>Welcome to QuizSmith!</p>
              
              <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
              <p>
                By accessing or using QuizSmith (the &quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). 
                If you disagree with any part of the terms, then you may not access the Service.
              </p>

              <h2 className="text-xl font-semibold">2. Service Description</h2>
              <p>
                QuizSmith provides a platform for creating, customizing, and embedding interactive quizzes. 
                This is a demo application, and functionalities may be limited or subject to change.
              </p>

              <h2 className="text-xl font-semibold">3. User Conduct</h2>
              <p>
                You agree not to use the Service for any unlawful purpose or in any way that might harm, 
                disable, overburden, or impair the Service.
              </p>
              
              <h2 className="text-xl font-semibold">4. Placeholder Content</h2>
              <p>
                These Terms of Service are placeholder content for demonstration purposes. 
                In a real application, comprehensive and legally reviewed terms would be provided.
              </p>

              <h2 className="text-xl font-semibold">5. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
              </p>

              <h2 className="text-xl font-semibold">6. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us (contact information would be here).
              </p>
              
              <div className="mt-8 text-center">
                <Button asChild>
                  <Link href="/">Return to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
