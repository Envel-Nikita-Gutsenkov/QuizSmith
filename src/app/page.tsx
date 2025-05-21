
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { CheckCircle, Palette, Zap, LayoutTemplate } from 'lucide-react';

const features = [
  {
    icon: <Palette className="h-10 w-10 text-primary mb-4" />,
    title: 'Fully Customizable Designs',
    description: 'Embed any HTML and CSS to create unique test layouts that match your brand.',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'design abstract',
  },
  {
    icon: <Zap className="h-10 w-10 text-primary mb-4" />,
    title: 'Dynamic Content Generation',
    description: 'Questions and answers seamlessly integrate into your custom designs.',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'dynamic content',
  },
  {
    icon: <CheckCircle className="h-10 w-10 text-primary mb-4" />,
    title: 'Interactive Elements',
    description: 'Engage users with drag-and-drop, text inputs, and various answer types.',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'interactive ui',

  },
  {
    icon: <LayoutTemplate className="h-10 w-10 text-primary mb-4" />,
    title: 'Powerful Template System',
    description: 'Create and use templates for rapid test development and consistent styling.',
    image: 'https://placehold.co/600x400.png',
    aiHint: 'template modern',
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
              Create Stunning, Interactive Quizzes.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              QuizSmith empowers you to build any type of quiz with any design. Your content, your rules.
            </p>
            <Button size="lg" asChild className="shadow-lg hover:shadow-primary/30 transition-shadow">
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <div className="mt-16">
              <Image
                src="https://placehold.co/1200x600.png"
                alt="QuizSmith application screenshot"
                width={1200}
                height={600}
                className="rounded-lg shadow-2xl mx-auto"
                data-ai-hint="quiz interface"
                priority
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-secondary/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
              Why Choose QuizSmith?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature) => (
                <Card key={feature.title} className="shadow-lg hover:shadow-xl transition-shadow flex flex-col">
                  <CardHeader className="items-center text-center">
                    {feature.icon}
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center flex-grow">
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                  <div className="p-4 mt-auto">
                     <Image src={feature.image} alt={feature.title} width={600} height={400} className="rounded-md object-cover aspect-[3/2]" data-ai-hint={feature.aiHint} />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Build Amazing Quizzes?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Join QuizSmith today and unlock a new level of creativity and engagement for your tests.
            </p>
            <Button size="lg" asChild className="shadow-lg hover:shadow-primary/30 transition-shadow">
              <Link href="/signup">Start Creating Now</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
