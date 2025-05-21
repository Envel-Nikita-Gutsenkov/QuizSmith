import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers, PlusCircle, Edit3 } from 'lucide-react';
import Image from 'next/image';

// Mock data for templates
const mockTemplates = [
  { id: 'tpl1', name: 'Minimalist Multiple Choice', description: 'A clean template for simple MCQs.', lastModified: '3 days ago', usageCount: 12, imageUrl: 'https://placehold.co/600x400.png', aiHint: 'simple clean' },
  { id: 'tpl2', name: 'Interactive Drag & Drop', description: 'Engaging template for DnD questions.', lastModified: '1 week ago', usageCount: 5, imageUrl: 'https://placehold.co/600x400.png', aiHint: 'puzzle pieces' },
];

export default function MyTemplatesPage() {
  return (
    <AppLayout currentPageTitle="My Templates">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">My Templates</h1>
        <Button asChild>
          <Link href="/templates/editor/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Template
          </Link>
        </Button>
      </div>

      {mockTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockTemplates.map((template) => (
            <Card key={template.id} className="flex flex-col shadow-md hover:shadow-lg transition-shadow">
               <CardHeader>
                <Image src={template.imageUrl} alt={template.name} width={600} height={400} className="rounded-t-md object-cover aspect-[16/9]" data-ai-hint={template.aiHint} />
                <CardTitle className="mt-4">{template.name}</CardTitle>
                <CardDescription>
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                 <p className="text-sm text-muted-foreground">Used {template.usageCount} times. Last modified: {template.lastModified}</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/templates/editor/${template.id}`}>
                    <Edit3 className="mr-2 h-4 w-4" /> Edit Template
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
            <CardTitle className="text-xl">You haven&apos;t created any templates yet.</CardTitle>
            <CardDescription>Templates help you build quizzes faster with consistent designs.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" asChild>
              <Link href="/templates/editor/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Template
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
