
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext'; // Added import
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/contexts/LanguageContext'; // Added import

const geistSans = GeistSans; // Use the imported object directly
const geistMono = GeistMono;

export const metadata: Metadata = {
  title: 'QuizSmith - Create Stunning Quizzes',
  description: 'Design and embed customizable tests with a flexible graphical editor.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        <LanguageProvider> {/* Added LanguageProvider */}
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
