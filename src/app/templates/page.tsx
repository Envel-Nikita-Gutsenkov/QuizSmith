import Link from 'next/link';
import Image from 'next/image';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Eye } from 'lucide-react';

// Mock data for templates - replace with actual data fetching
const mockTemplates = [
  {
    id: 'tpl-mcq-modern',
    name: 'Modern Multiple Choice',
    description: 'A sleek, responsive template for multiple-choice questions with image support.',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'modern template',
    tags: ['MCQ', 'Responsive', 'Popular'],
  },
  {
    id: 'tpl-dnd-interactive',
    name: 'Interactive Drag & Drop Zone',
    description: 'Engage users with a visually appealing drag and drop question format.',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'interactive dragdrop',
    tags: ['Drag & Drop', 'Interactive'],
  },
  {
    id: 'tpl-text-input-classic',
    name: 'Classic Text Input',
    description: 'A straightforward template for open-ended text input questions.',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'classic form',
    tags: ['Text Input', 'Simple'],
  },
  {
    id: 'tpl-image-focus',
    name: 'Image-Centric Quiz',
    description: 'Perfect for visual quizzes where images are key to questions.',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'image gallery',
    tags: ['Visual', 'MCQ', 'Image Heavy'],
  }
];

export default function TemplatesPage() {
  return (
    <AppLayout currentPageTitle="Quiz Templates">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Explore Templates</h1>
        <Button asChild>
          <Link href="/templates/editor/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Template
          </Link>
        </Button>
      </div>

      {mockTemplates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockTemplates.map((template) => (
            <Card key={template.id} className="flex flex-col overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out">
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={template.imageUrl}
                  alt={template.name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-t-md"
                  data-ai-hint={template.aiHint}
                />
              </div>
              <CardHeader className="pt-4">
                <CardTitle>{template.name}</CardTitle>
                <CardDescription className="h-12 overflow-hidden text-ellipsis">{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex flex-wrap gap-2">
                  {template.tags.map(tag => (
                    <span key={tag} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href={`/templates/editor/${template.id}`}>
                    <Eye className="mr-2 h-4 w-4" /> Preview
                  </Link>
                </Button>
                <Button size="sm" asChild className="flex-1">
                  <Link href={`/editor/new?template=${template.id}`}>
                    Use Template
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Layers className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">No Templates Available Yet</h2>
          <p className="text-muted-foreground mb-6">
            Be the first to create a stunning template for QuizSmith!
          </p>
          <Button asChild>
            <Link href="/templates/editor/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Template
            </Link>
          </Button>
        </div>
      )}
    </AppLayout>
  );
}
