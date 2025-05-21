
'use client'; // Required for useLanguage hook

import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers, PlusCircle, Edit3 } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext'; // Added

// Mock data for templates
const mockTemplates = [
  { id: 'tpl1', name: 'Minimalist Multiple Choice', description: 'A clean template for simple MCQs.', lastModified: '3 days ago', usageCount: 12, imageUrl: 'https://placehold.co/600x400.png', aiHint: 'simple clean' },
  { id: 'tpl2', name: 'Interactive Drag & Drop', description: 'Engaging template for DnD questions.', lastModified: '1 week ago', usageCount: 5, imageUrl: 'https://placehold.co/600x400.png', aiHint: 'puzzle pieces' },
];

export default function MyTemplatesPage() {
  const { t } = useLanguage(); // Added

  return (
    <AppLayout currentPageTitleKey="myTemplates.pageTitle"> {/* Changed to currentPageTitleKey */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">{t('myTemplates.pageTitle')}</h1>
        <Button asChild>
          <Link href="/templates/editor/new">
            <PlusCircle className="mr-2 h-4 w-4" /> {t('myTemplates.create')}
          </Link>
        </Button>
      </div>

      {mockTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockTemplates.map((template) => (
            <Card key={template.id} className="flex flex-col shadow-md hover:shadow-lg transition-shadow">
               <CardHeader>
                <Image src={template.imageUrl} alt={template.name} width={600} height={400} className="rounded-t-md object-cover aspect-[16/9]" data-ai-hint={template.aiHint} />
                <CardTitle className="mt-4">{template.name}</CardTitle> {/* Mock data, not translated */}
                <CardDescription>
                  {template.description} {/* Mock data, not translated */}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                 <p className="text-sm text-muted-foreground">{t('myTemplates.usageCountLabel')} {template.usageCount} {t('myTemplates.timesLabel')}. {t('myTemplates.lastModifiedLabel')}: {template.lastModified}</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/templates/editor/${template.id}`}>
                    <Edit3 className="mr-2 h-4 w-4" /> {t('myTemplates.edit')}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16">
          <CardHeader>
            <Layers className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="text-xl">{t('myTemplates.noTemplates.title')}</CardTitle>
            <CardDescription>{t('myTemplates.noTemplates.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" asChild>
              <Link href="/templates/editor/new">
                <PlusCircle className="mr-2 h-4 w-4" /> {t('myTemplates.noTemplates.button')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
