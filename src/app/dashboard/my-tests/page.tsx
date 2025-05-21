
'use client'; // Required for useLanguage hook

import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, PlusCircle, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext'; 
import type { Test } from '@/lib/types';
import { useState, useEffect } from 'react';

export default function MyTestsPage() {
  const { t } = useLanguage(); 
  const [tests, setTests] = useState<Test[]>([]);

  // In a real app, this useEffect would fetch data
  useEffect(() => {
    // Placeholder: Simulate fetching or set to empty to show "no data" state
    // setTests(mockTests);
    setTests([]);
  }, []);

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

      {tests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <Card key={test.id} className="flex flex-col shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <Image 
                  src={(test as any).imageUrl || "https://placehold.co/600x400.png"} 
                  alt={test.name} 
                  width={600} height={400} 
                  className="rounded-t-md object-cover aspect-[16/9]" 
                  data-ai-hint={(test as any).aiHint || "quiz document"}
                />
                <CardTitle className="mt-4">{test.name}</CardTitle> 
                <CardDescription>
                  {test.questions.length} {t('myTests.questionsLabel')} &bull; 
                  {/* Status property not in Test type, add if needed or remove */}
                  {/* {t('myTests.statusLabel')}: {(test as any).status} &bull;  */}
                  {t('myTests.lastModifiedLabel')}: {new Date(test.updatedAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {/* Additional info like completion rate, average score if available */}
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
      ) : (
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
      )}
    </AppLayout>
  );
}
