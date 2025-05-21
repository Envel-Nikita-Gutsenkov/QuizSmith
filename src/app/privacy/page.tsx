
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-3xl">Privacy Policy</CardTitle>
              <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 prose dark:prose-invert max-w-none">
              <p>Your privacy is important to us. This Privacy Policy explains how QuizSmith collects, uses, and protects your information.</p>
              
              <h2 className="text-xl font-semibold">1. Information Collection</h2>
              <p>
                As this is a demo application without a backend database or user authentication, 
                QuizSmith does not actively collect or store personal user data beyond what is entered into forms for the purpose of demonstration within the client-side application.
                Any data entered (e.g., test names, questions) is typically managed in your browser&apos;s local state and is not transmitted to a server for storage.
              </p>

              <h2 className="text-xl font-semibold">2. Use of Information</h2>
              <p>
                Any information you input is used solely for the purpose of demonstrating the application&apos;s features within your current session.
              </p>

              <h2 className="text-xl font-semibold">3. Data Storage and Security</h2>
              <p>
                No persistent data storage on a server is implemented in this demo version.
              </p>
              
              <h2 className="text-xl font-semibold">4. Third-Party Services</h2>
              <p>
                This application may use third-party services like Tailwind CSS (CDN) for styling or placeholder image services. These services may have their own privacy policies.
              </p>

               <h2 className="text-xl font-semibold">5. Placeholder Content</h2>
              <p>
                This Privacy Policy is placeholder content for demonstration purposes. 
                A real application would have a comprehensive policy detailing actual data handling practices.
              </p>

              <h2 className="text-xl font-semibold">6. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
              </p>

              <h2 className="text-xl font-semibold">7. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us (contact information would be here).
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
