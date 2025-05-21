
'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Database, Save } from 'lucide-react';

export default function AdminPage() {
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleSaveConfiguration = () => {
    toast({
      title: t('adminPanel.toast.saveConfigTitle', { defaultValue: "Configuration Update" }),
      description: t('adminPanel.toast.saveConfigDescription', { defaultValue: "This feature is not yet implemented. Backend development is required." }),
    });
  };

  const pageTitleKey = "adminPanel.pageTitle";

  return (
    <AppLayout currentPageTitleKey={pageTitleKey}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold tracking-tight mb-8">
          {t(pageTitleKey, { defaultValue: 'Admin Panel' })}
        </h1>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-6 w-6 text-primary" />
              {t('adminPanel.storage.title', { defaultValue: 'Storage Configuration' })}
            </CardTitle>
            <CardDescription>
              {t('adminPanel.storage.description', { defaultValue: 'Select and configure permanent storage options for the application. (Note: This is a UI placeholder. Backend implementation is required for full functionality).' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup defaultValue="firestore" className="space-y-2">
              <Label className="font-semibold text-lg">{t('adminPanel.storage.selectLabel', { defaultValue: 'Choose Storage Type:' })}</Label>
              
              <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="sqlite" id="sqlite" />
                <Label htmlFor="sqlite" className="flex-1 cursor-pointer">
                  <span className="font-medium">{t('adminPanel.storage.sqlite.label', { defaultValue: 'SQLite' })}</span>
                  <p className="text-sm text-muted-foreground">{t('adminPanel.storage.sqlite.description', { defaultValue: 'Local file-based database. Good for development or small single-server deployments.' })}</p>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="mysql" id="mysql" />
                <Label htmlFor="mysql" className="flex-1 cursor-pointer">
                  <span className="font-medium">{t('adminPanel.storage.mysql.label', { defaultValue: 'MySQL' })}</span>
                  <p className="text-sm text-muted-foreground">{t('adminPanel.storage.mysql.description', { defaultValue: 'Robust relational database. Suitable for larger applications.' })}</p>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="firestore" id="firestore" />
                <Label htmlFor="firestore" className="flex-1 cursor-pointer">
                  <span className="font-medium">{t('adminPanel.storage.firestore.label', { defaultValue: 'Firebase Firestore' })}</span>
                  <p className="text-sm text-muted-foreground">{t('adminPanel.storage.firestore.description', { defaultValue: 'Scalable NoSQL cloud database. Recommended for Next.js applications.' })}</p>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="flex-1 cursor-pointer">
                  <span className="font-medium">{t('adminPanel.storage.other.label', { defaultValue: 'Other Database' })}</span>
                  <p className="text-sm text-muted-foreground">{t('adminPanel.storage.other.description', { defaultValue: 'Requires manual backend setup and configuration.' })}</p>
                </Label>
              </div>
            </RadioGroup>

            <Button onClick={handleSaveConfiguration} className="mt-4">
              <Save className="mr-2 h-4 w-4" />
              {t('adminPanel.storage.saveButton', { defaultValue: 'Save Configuration' })}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
