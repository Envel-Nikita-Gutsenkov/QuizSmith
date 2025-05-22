
'use client'; // Required for Suspense and useLanguage

import Link from 'next/link';
import Image from 'next/image';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Eye, Layers, Copy } from 'lucide-react'; // Added Copy icon
import { pageTemplates } from '@/lib/mockPageTemplates'; 
import { useLanguage } from '@/contexts/LanguageContext';
import { Suspense } from 'react'; 

function ExplorePageTemplatesContent() {
  const { t } = useLanguage();

  return (
    <AppLayout currentPageTitleKey="pageTemplates.explore.pageTitle">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{t('pageTemplates.explore.pageTitle')}</h1>
        <Button asChild>
          <Link href="/templates/editor/new">
            <PlusCircle className="mr-2 h-4 w-4" /> {t('pageTemplates.explore.createButton')}
          </Link>
        </Button>
      </div>

      {pageTemplates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pageTemplates.map((template) => (
            <Card key={template.id} className="flex flex-col overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out">
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={template.previewImageUrl || "https://placehold.co/600x400.png"}
                  alt={template.name}
                  fill 
                  className="rounded-t-md object-cover" 
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
                  data-ai-hint={template.aiHint || "template style"}
                />
              </div>
              <CardHeader className="pt-4">
                <CardTitle>{template.name}</CardTitle>
                <CardDescription className="h-12 overflow-hidden text-ellipsis">{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {template.tags && template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                    {template.tags.map(tag => (
                        <span key={tag} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">{tag}</span>
                    ))}
                    </div>
                )}
              </CardContent>
              <CardFooter className="grid grid-cols-3 gap-2"> {/* Changed to 3 columns */}
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href={`/templates/editor/${template.id}`}>
                    <Eye className="mr-1 h-4 w-4" /> {t('pageTemplates.explore.preview')}
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="flex-1"> {/* Duplicate Button */}
                  <Link href={`/templates/editor/new?from=${template.id}`}>
                    <Copy className="mr-1 h-4 w-4" /> {t('pageTemplates.explore.duplicate')}
                  </Link>
                </Button>
                <Button size="sm" asChild className="flex-1">
                  <Link href={`/editor/new?template=${template.id}`}>
                    {t('pageTemplates.explore.useThisTemplate')}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Layers className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">{t('pageTemplates.explore.noTemplates.title')}</h2>
          <p className="text-muted-foreground mb-6">
            {t('pageTemplates.explore.noTemplates.description')}
          </p>
          <Button asChild>
            <Link href="/templates/editor/new">
              <PlusCircle className="mr-2 h-4 w-4" /> {t('pageTemplates.explore.noTemplates.button')}
            </Link>
          </Button>
        </div>
      )}
    </AppLayout>
  );
}

export default function ExplorePageTemplatesPage() {
  return (
    <Suspense fallback={<div>Loading templates...</div>}>
      <ExplorePageTemplatesContent />
    </Suspense>
  );
}
