
'use client'; // Required for useLanguage hook

import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Layers, PlusCircle, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext'; // Added
import type { Test, Template } from '@/lib/types'; // Assuming types for data
import { useState, useEffect } from 'react'; // For managing fetched data

export default function DashboardPage() {
  const { t } = useLanguage(); 

  // State to hold actual data - initially empty
  const [tests, setTests] = useState<Test[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);

  // In a real app, this useEffect would fetch data
  useEffect(() => {
    // Placeholder: Simulate fetching or set to empty to show "no data" state
    // setTests(mockTests); 
    // setTemplates(mockTemplates);
    setTests([]); 
    setTemplates([]);
  }, []);

  return (
    <AppLayout currentPageTitleKey="dashboard.pageTitle"> 
      <div className="space-y-8">
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">{t('dashboard.myTests.heading')}</h2>
            <Button asChild>
              <Link href="/editor/new">
                <PlusCircle className="mr-2 h-4 w-4" /> {t('dashboard.myTests.create')}
              </Link>
            </Button>
          </div>
          {tests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tests.map((test) => (
                <Card key={test.id} className="flex flex-col shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    {/* Assuming test objects might have an imageUrl, provide a placeholder if not */}
                    <Image 
                      src={(test as any).imageUrl || "https://placehold.co/600x400.png"} 
                      alt={test.name} 
                      width={600} height={400} 
                      className="rounded-t-md object-cover aspect-[16/9]" 
                      data-ai-hint={(test as any).aiHint || "quiz document"}
                    />
                    <CardTitle className="mt-4">{test.name}</CardTitle> 
                    <CardDescription>{test.questions.length} {t('myTests.questionsLabel')} - {t('myTests.lastModifiedLabel')}: {new Date(test.updatedAt).toLocaleDateString()}</CardDescription> 
                  </CardHeader>
                  <CardContent className="flex-grow">
                    {/* Potentially some stats or quick info */}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/editor/${test.id}`}>{t('dashboard.editTest')} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardHeader>
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle>{t('dashboard.myTests.noTests.title')}</CardTitle>
                <CardDescription>{t('dashboard.myTests.noTests.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/editor/new">
                    <PlusCircle className="mr-2 h-4 w-4" /> {t('dashboard.myTests.noTests.button')}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">{t('dashboard.myTemplates.heading')}</h2>
            <Button asChild>
              <Link href="/templates/editor/new">
                <PlusCircle className="mr-2 h-4 w-4" /> {t('dashboard.myTemplates.create')}
              </Link>
            </Button>
          </div>
          {templates.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="flex flex-col shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                     <Image 
                        src={template.previewImageUrl || "https://placehold.co/600x400.png"} 
                        alt={template.name} 
                        width={600} height={400} 
                        className="rounded-t-md object-cover aspect-[16/9]" 
                        data-ai-hint={(template as any).aiHint || "modern template"}
                      />
                    <CardTitle className="mt-4">{template.name}</CardTitle> 
                    <CardDescription>{template.description}</CardDescription> 
                  </CardHeader>
                   <CardContent className="flex-grow">
                    {/* Info like usage count or tags */}
                  </CardContent>
                  <CardFooter>
                     <Button variant="outline" asChild className="w-full">
                      <Link href={`/templates/editor/${template.id}`}>{t('dashboard.editTemplate')} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
             <Card className="text-center py-12">
              <CardHeader>
                <Layers className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle>{t('dashboard.myTemplates.noTemplates.title')}</CardTitle>
                <CardDescription>{t('dashboard.myTemplates.noTemplates.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/templates/editor/new">
                     <PlusCircle className="mr-2 h-4 w-4" /> {t('dashboard.myTemplates.noTemplates.button')}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
