import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Layers, PlusCircle, ArrowRight } from 'lucide-react';
import Image from 'next/image';

// Mock data - replace with actual data fetching
const mockTests = [
  { id: 'test1', name: 'My First Amazing Quiz', lastModified: '2 days ago', questions: 10, imageUrl: 'https://placehold.co/600x400.png', aiHint: 'quiz document' },
  { id: 'test2', name: 'Advanced JavaScript Challenge', lastModified: '5 days ago', questions: 25, imageUrl: 'https://placehold.co/600x400.png', aiHint: 'code screen' },
];
const mockTemplates = [
  { id: 'tpl1', name: 'Minimalist Multiple Choice', description: 'A clean template for simple MCQs.', imageUrl: 'https://placehold.co/600x400.png', aiHint: 'minimalist design' },
  { id: 'tpl2', name: 'Interactive Drag & Drop', description: 'Engaging template for DnD questions.', imageUrl: 'https://placehold.co/600x400.png', aiHint: 'interactive learning' },
];

export default function DashboardPage() {
  return (
    <AppLayout currentPageTitle="Dashboard">
      <div className="space-y-8">
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">My Tests</h2>
            <Button asChild>
              <Link href="/editor/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Test
              </Link>
            </Button>
          </div>
          {mockTests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTests.map((test) => (
                <Card key={test.id} className="flex flex-col shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <Image src={test.imageUrl} alt={test.name} width={600} height={400} className="rounded-t-md object-cover aspect-[16/9]" data-ai-hint={test.aiHint} />
                    <CardTitle className="mt-4">{test.name}</CardTitle>
                    <CardDescription>{test.questions} questions - Last modified: {test.lastModified}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    {/* Potentially some stats or quick info */}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/editor/${test.id}`}>Edit Test <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardHeader>
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle>No tests created yet</CardTitle>
                <CardDescription>Start by creating your first masterpiece!</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/editor/new">
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Test
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">My Templates</h2>
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
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                   <CardContent className="flex-grow">
                    {/* Info like usage count or tags */}
                  </CardContent>
                  <CardFooter>
                     <Button variant="outline" asChild className="w-full">
                      <Link href={`/templates/editor/${template.id}`}>Edit Template <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
             <Card className="text-center py-12">
              <CardHeader>
                <Layers className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle>No templates created yet</CardTitle>
                <CardDescription>Build reusable designs for your quizzes.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/templates/editor/new">
                     <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Template
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
