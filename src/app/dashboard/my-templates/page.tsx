
'use client'; // Required for useLanguage hook

import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers, PlusCircle, Edit3 } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext'; 
import type { Template } from '@/lib/types';
import { useState, useEffect } from 'react';


export default function MyTemplatesPage() {
  const { t } = useLanguage(); 
  const [templates, setTemplates] = useState<Template[]>([]);

  // In a real app, this useEffect would fetch data
  useEffect(() => {
    // Placeholder: Simulate fetching or set to empty to show "no data" state
    // setTemplates(mockTemplates);
    setTemplates([]);
  }, []);

  return (
    <AppLayout currentPageTitleKey="myTemplates.pageTitle"> 
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">{t('myTemplates.pageTitle')}</h1>
        <Button asChild>
          <Link href="/templates/editor/new">
            <PlusCircle className="mr-2 h-4 w-4" /> {t('myTemplates.create')}
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
                  data-ai-hint={(template as any).aiHint || "simple clean"}
                />
                <CardTitle className="mt-4">{template.name}</CardTitle> 
                <CardDescription>
                  {template.description} 
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                 {/* Usage count and last modified would come from real data */}
                 <p className="text-sm text-muted-foreground">
                   {/* {t('myTemplates.usageCountLabel')} {(template as any).usageCount || 0} {t('myTemplates.timesLabel')}.  */}
                   {t('myTemplates.lastModifiedLabel')}: {new Date(template.updatedAt).toLocaleDateString()}
                 </p>
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
