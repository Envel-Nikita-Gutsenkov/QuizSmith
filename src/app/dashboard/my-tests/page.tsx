import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, PlusCircle, ArrowRight } from 'lucide-react';
import Image from 'next/image';

// Mock data for tests
const mockTests = [
  { id: 'test1', name: 'My First Amazing Quiz', lastModified: '2 days ago', questions: 10, status: 'Published', imageUrl: 'https://placehold.co/600x400.png', aiHint: 'certificate design' },
  { id: 'test2', name: 'Advanced JavaScript Challenge', lastModified: '5 days ago', questions: 25, status: 'Draft', imageUrl: 'https://placehold.co/600x400.png', aiHint: 'programming code' },
  { id: 'test3', name: 'History of Ancient Rome', lastModified: '1 week ago', questions: 15, status: 'Published', imageUrl: 'https://placehold.co/600x400.png', aiHint: 'rome colosseum' },
];

export default function MyTestsPage() {
  return (
    <AppLayout currentPageTitle="My Tests">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">My Tests</h1>
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
                <CardDescription>
                  {test.questions} questions &bull; {test.status} &bull; Last modified: {test.lastModified}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {/* Additional info like completion rate, average score if available */}
              </CardContent>
              <CardFooter className="grid grid-cols-2 gap-2">
                <Button variant="outline" asChild>
                  <Link href={`/editor/${test.id}`}>Edit</Link>
                </Button>
                 <Button asChild>
                  <Link href={`/test/${test.id}/results`}>View Results <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16">
          <CardHeader>
            <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="text-xl">You haven&apos;t created any tests yet.</CardTitle>
            <CardDescription>Click the button below to start building your first quiz!</CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" asChild>
              <Link href="/editor/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Test
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
