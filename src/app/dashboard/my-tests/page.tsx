
'use client'; // Required for useLanguage hook

import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, PlusCircle, ArrowRight, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext'; 
import type { Test } from '@/lib/types';
import { useState, useEffect } from 'react';
import withAuth from '@/components/auth/withAuth';
import { useAuth } from '@/contexts/AuthContext'; // Added useAuth
import { useToast } from '@/hooks/use-toast'; // Added useToast
import { Skeleton } from '@/components/ui/skeleton'; // Added Skeleton

function MyTestsPage() {
  const { t } = useLanguage(); 
  const { currentUser } = useAuth(); // Get currentUser
  const { toast } = useToast(); // For error notifications
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      // Wait for currentUser to be available.
      // withAuth HOC should handle redirection if user is not authenticated.
      // If currentUser is null and auth is not loading, it means user is not logged in.
      // but withAuth should prevent this page from rendering in that case.
      // If it still occurs, set loading to false.
      setIsLoading(false);
      return;
    }

    const fetchTests = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/tests', {
          headers: {
            'x-test-user-id': currentUser.uid, // Placeholder auth header
          },
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch tests and parse error response.'}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const fetchedTests: Test[] = await response.json();
        setTests(fetchedTests);
      } catch (err: any) {
        console.error("Failed to fetch tests:", err);
        setError(err.message || "An unknown error occurred while fetching tests.");
        toast({ title: "Error Fetching Tests", description: err.message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTests();
  }, [currentUser, toast, t]); // Added currentUser, toast, t to dependency array

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="flex flex-col shadow-md">
              <Skeleton className="h-48 w-full rounded-t-md" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="flex-grow" />
              <CardFooter className="grid grid-cols-2 gap-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Card className="text-center py-16 text-destructive">
          <CardHeader>
            <AlertTriangle className="mx-auto h-16 w-16 mb-4" />
            <CardTitle className="text-xl">{t('myTests.errorLoading.title', {defaultValue: 'Error Loading Tests'})}</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>
              {t('myTests.errorLoading.retry', {defaultValue: 'Retry'})}
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (tests.length === 0) {
      return (
        <Card className="text-center py-16">
          <CardHeader>
            <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="text-xl">{t('myTests.noTests.title')}</CardTitle>
            <CardDescription>{t('myTests.noTests.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" asChild>
              <Link href="/editor/new">
                <PlusCircle className="mr-2 h-4 w-4" /> {t('myTests.noTests.button')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => (
          <Card key={test.id} className="flex flex-col shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              {/* Assuming test.template.previewImageUrl exists, or use a placeholder */}
              <Image 
                src={test.template?.previewImageUrl || "https://placehold.co/600x400.png"} 
                alt={test.name} 
                width={600} height={400} 
                className="rounded-t-md object-cover aspect-[16/9]" 
                data-ai-hint={(test.template as any)?.aiHint || "quiz document"} // Access aiHint from template if available
              />
              <CardTitle className="mt-4">{test.name}</CardTitle> 
              <CardDescription>
                {(Array.isArray(test.questions) ? test.questions.length : 0)} {t('myTests.questionsLabel')} &bull; 
                {t('myTests.lastModifiedLabel')}: {new Date(test.updatedAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              {/* Additional info */}
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-2">
              <Button variant="outline" asChild>
                <Link href={`/editor/${test.id}`}>{t('myTests.edit')}</Link>
              </Button>
               <Button asChild>
                <Link href={`/test/${test.id}/results`}>{t('myTests.viewResults')} <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <AppLayout currentPageTitleKey="myTests.pageTitle"> 
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">{t('myTests.pageTitle')}</h1>
        <Button asChild>
          <Link href="/editor/new">
            <PlusCircle className="mr-2 h-4 w-4" /> {t('myTests.create')}
          </Link>
        </Button>
      </div>
      {renderContent()}
    </AppLayout>
  );
}

export default withAuth(MyTestsPage);
