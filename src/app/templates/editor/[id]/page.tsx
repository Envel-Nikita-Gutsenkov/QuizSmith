
'use client'; 

import { useState, useEffect, useCallback, Suspense } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, Eye, Layers, Palette, CloudOff, Trash2 } from 'lucide-react'; // Added Trash2
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useParams, useRouter } from 'next/navigation';
// Removed: import { DEFAULT_TEMPLATE_ID } from '@/lib/mockPageTemplates';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
// Removed service imports: import { getPageTemplate, updatePageTemplate, UpdatePageTemplateData } from '@/lib/firestoreTemplates';
import type { PageTemplate } from '@/lib/types'; // Use PageTemplate from lib/types for fetched data
import type { PageTemplateUpdateData } from '@/services/templateService'; // For PUT payload
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
// Import for confirmation dialog
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// UI state might handle tags as an array for easier editing
interface PageTemplateUIData extends Omit<PageTemplate, 'tags' | 'id' | 'createdAt' | 'updatedAt' | 'userId'> {
  name: string; // Ensure name is not optional for UI state if always present
  htmlContent: string; // Ensure htmlContent is not optional
  cssContent: string; // Ensure cssContent is not optional
  description?: string;
  previewImageUrl?: string;
  aiHint?: string;
  tags?: string[]; 
}

// Draft for localStorage, can be more flexible
interface PageTemplateDraft {
  name?: string;
  description?: string;
  htmlContent?: string;
  cssContent?: string;
  previewImageUrl?: string;
  aiHint?: string;
  tags?: string[];
}

function EditPageTemplateEditorPageContent() {
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const templateId = params?.id as string || 'unknown';
  const { toast } = useToast();

  // Consolidate form data into a single state object
  const [templateData, setTemplateData] = useState<Partial<PageTemplateUIData>>({
    name: '',
    description: '',
    htmlContent: '',
    cssContent: '',
    tags: [],
  });
  const [previewContent, setPreviewContent] = useState('');
  
  const [hasUnsavedDraft, setHasUnsavedDraft] = useState(false);
  const localStorageKey = `quizsmith-template-draft-${templateId}`;
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // Added
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const { currentUser } = useAuth();

  const pageTitleKey = "pageTemplateEditor.edit.pageTitle"; 

  useEffect(() => {
    // This effect handles the initial data fetching from Firestore
    if (!templateId || templateId === 'unknown' || templateId === 'new') {
      toast({ title: "Invalid Template ID", description: "This template ID is not valid. Redirecting...", variant: "destructive" });
      router.push('/templates');
      return;
    }

    const fetchTemplateData = async () => {
      setIsLoadingInitialData(true);
      try {
        const response = await fetch(`/api/templates/${templateId}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})); // Try to parse error, default if not
          throw new Error(errorData.message || `Template not found or failed to load: ${response.statusText}`);
        }
        const fetchedTemplate: PageTemplate = await response.json();
        
        // Convert fetched data (especially tags string) to UI state format
        const uiData: PageTemplateUIData = {
          name: fetchedTemplate.name,
          description: fetchedTemplate.description || '',
          htmlContent: fetchedTemplate.htmlContent,
          cssContent: fetchedTemplate.cssContent,
          previewImageUrl: fetchedTemplate.previewImageUrl || '',
          aiHint: fetchedTemplate.aiHint || '',
          tags: fetchedTemplate.tags && typeof fetchedTemplate.tags === 'string' 
                ? fetchedTemplate.tags.split(',').map(tag => tag.trim()).filter(tag => tag) 
                : [], // Ensure tags is always an array for UI state
        };
        setTemplateData(uiData);

        // Check for local draft after setting state from fetched data
        const savedDraftJson = localStorage.getItem(localStorageKey);
        if (savedDraftJson) {
          // For simplicity, just notify. A more complex app might offer to load the draft.
          setHasUnsavedDraft(true); 
          toast({ 
            title: t('pageTemplateEditor.toast.draftFoundTitle', {defaultValue: "Local Draft Found"}), 
            description: t('pageTemplateEditor.toast.draftFoundDescriptionExisting', {defaultValue: "An unsaved local draft was found. Your current changes will be saved to this draft. If you wish to discard it and use the server version, refresh the page before making any edits."}),
            duration: 7000 
          });
        }
      } catch (error: any) {
        console.error("Failed to fetch template:", error);
        toast({ title: "Error Fetching Template", description: error.message, variant: "destructive" });
        router.push('/templates');
      } finally {
        setIsLoadingInitialData(false);
        setIsInitialLoad(false);
      }
    };
    fetchTemplateData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, router, t, toast]); // Dependencies are correct

  
  useEffect(() => {
    if (isInitialLoad || isLoadingInitialData || !templateId || templateId === 'unknown' || templateId === 'new') return;

    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(() => {
      // Construct draft from templateData, ensuring it's PageTemplateDraft structure
      const draftToSave: PageTemplateDraft = {
        name: templateData.name,
        description: templateData.description,
        htmlContent: templateData.htmlContent,
        cssContent: templateData.cssContent,
        previewImageUrl: templateData.previewImageUrl,
        aiHint: templateData.aiHint,
        tags: templateData.tags, // Store tags as array in draft
      };
      localStorage.setItem(localStorageKey, JSON.stringify(draftToSave));
      setHasUnsavedDraft(true);
    }, 1000);
    setDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateData, isInitialLoad, isLoadingInitialData, localStorageKey]); // Use templateData as dependency

  const handleInputChange = (field: keyof PageTemplateUIData, value: string | string[]) => {
    setTemplateData(prev => ({ ...prev, [field]: value }));
  };

  const updatePreview = useCallback(() => {
    let processedHtml = templateData.htmlContent || ''
      .replace(/<script id="quiz-data" type="application\/json">.*<\/script>/s, '<script id="quiz-data" type="application/json">[]<\/script>')
      .replace(/<div id="quiz-name-data"[^>]*>.*<\/div>/s, `<div id="quiz-name-data" style="display:none;">${templateData.name || t('pageTemplateEditor.preview.sampleTitle')}</div>`)
      .replace(/<div id="quiz-end-message-data"[^>]*>.*<\/div>/s, '<div id="quiz-end-message-data" style="display:none;">Sample end message.</div>');

    let stylingVariables = '';
    if (typeof window !== 'undefined') { // Ensure this runs only on client
        const rootStyle = getComputedStyle(document.documentElement);
        stylingVariables = `
          :root {
            --background: ${rootStyle.getPropertyValue('--background').trim()};
            --foreground: ${rootStyle.getPropertyValue('--foreground').trim()};
            --card: ${rootStyle.getPropertyValue('--card').trim()};
            --card-foreground: ${rootStyle.getPropertyValue('--card-foreground').trim()};
            --primary: ${rootStyle.getPropertyValue('--primary').trim()};
            --secondary: ${rootStyle.getPropertyValue('--secondary').trim()};
            --accent: ${rootStyle.getPropertyValue('--accent').trim()};
            --border: ${rootStyle.getPropertyValue('--border').trim()};
            --radius: ${rootStyle.getPropertyValue('--radius').trim()};
            --font-geist-sans: ${rootStyle.getPropertyValue('--font-geist-sans').trim() || 'Arial, sans-serif'};
          }
        `;
    }

    const fullHtml = `
      <html>
        <head>
           <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
           <script src="https://cdn.tailwindcss.com"><\/script>
          <style>
            ${stylingVariables}
            body { margin: 0; font-family: var(--font-geist-sans); background-color: hsl(var(--background)); }
            ${templateData.cssContent || ''}
          </style>
        </head>
        <body>${processedHtml}</body>
      </html>
    `;
    setPreviewContent(fullHtml);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateData.htmlContent, templateData.cssContent, templateData.name, t]);
  
  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  const handleSaveTemplate = async () => {
    if (!currentUser) {
      toast({ title: "Authentication Error", description: "You must be logged in to save changes.", variant: "destructive" });
      return;
    }
    if (!templateId || templateId === 'unknown' || templateId === 'new') {
      toast({ title: "Invalid Template ID", description: "Cannot save changes, template ID is invalid.", variant: "destructive" });
      return;
    }
    if (!templateData.name?.trim() || !templateData.htmlContent?.trim()) {
       toast({ title: "Missing Fields", description: "Template Name and HTML Content are required.", variant: "destructive" });
       return;
    }

    setIsSaving(true);
    // API expects PageTemplateUpdateData. Tags can be string[] as API route handles conversion.
    const apiPayload: PageTemplateUpdateData & { tags?: string[] } = { // Ensure this matches expected API structure
      name: templateData.name,
      description: templateData.description,
      htmlContent: templateData.htmlContent,
      cssContent: templateData.cssContent,
      previewImageUrl: templateData.previewImageUrl,
      aiHint: templateData.aiHint,
      tags: templateData.tags, // Send as array; API route converts to string if needed
    };

    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({ message: "Failed to update template and parse error response."}));
        throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
      }
      
      // const updatedTemplateResult = await response.json(); // Use if API returns updated object
      await response.json(); 
      toast({ title: "Template Updated!", description: "Your changes have been saved successfully." });
      localStorage.removeItem(localStorageKey);
      setHasUnsavedDraft(false);
      // Optionally re-fetch or update state with updatedTemplateResult if needed
    } catch (error: any) {
      console.error("Failed to update template:", error);
      toast({ title: "Update Failed", description: error.message || "Could not save the changes.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateId || templateId === 'unknown' || templateId === 'new') {
      toast({ title: "Invalid Template ID", description: "Cannot delete, template ID is invalid.", variant: "destructive" });
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/templates/${templateId}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({ message: 'Failed to delete template and parse error response.' }));
        throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
      }
      toast({ title: "Template Deleted", description: "The template has been successfully deleted." });
      router.push('/templates');
    } catch (error: any) {
      console.error("Failed to delete template:", error);
      toast({ title: "Delete Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoadingInitialData) {
    return (
      <AppLayout currentPageTitleKey={pageTitleKey} currentPageTitleParams={{ templateIdOrName: templateId }}>
         <div className="flex flex-col h-full">
            <header className="flex items-center justify-between mb-6">
              <Skeleton className="h-8 w-1/2" /> {/* Title skeleton */}
              <div className="space-x-2 flex items-center">
                <Skeleton className="h-9 w-24" /> {/* Preview button skeleton */}
                <Skeleton className="h-9 w-24" /> {/* Save button skeleton */}
              </div>
            </header>
            <div className="grid md:grid-cols-2 gap-6 flex-1 min-h-0">
              <Card className="md:col-span-1 flex flex-col">
                <CardHeader><Skeleton className="h-6 w-1/3 mb-2" /><Skeleton className="h-4 w-2/3" /></CardHeader>
                <CardContent className="space-y-6 p-4">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className={`h-10 w-full ${i === 3 ? 'h-24' : ''}`} />)}
                </CardContent>
              </Card>
              <Card className="md:col-span-1 flex flex-col"><CardHeader><Skeleton className="h-6 w-1/3 mb-2" /><Skeleton className="h-4 w-2/3" /></CardHeader><CardContent className="flex-grow p-0 m-0"><Skeleton className="w-full h-full" /></CardContent></Card>
            </div>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout currentPageTitleKey={pageTitleKey} currentPageTitleParams={{ templateIdOrName: templateName || templateId }}>
      <div className="flex flex-col h-full">
         <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">{t(pageTitleKey, { templateIdOrName: templateName || templateId, defaultValue: `Edit Quiz Engine Template: ${templateName || templateId}` })}</h1>
          <div className="space-x-2 flex items-center">
            {hasUnsavedDraft && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <CloudOff className="h-5 w-5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('pageTemplateEditor.unsavedDraftTooltip')}</p>
                </TooltipContent>
              </Tooltip>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isSaving || isLoadingInitialData || isDeleting}>
                  <Trash2 className="mr-2 h-4 w-4" /> {t('pageTemplateEditor.deleteTemplate', {defaultValue: 'Delete'})}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('pageTemplateEditor.deleteConfirmTitle', {defaultValue: 'Are you sure?'})}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('pageTemplateEditor.deleteConfirmDescription', {defaultValue: "This action cannot be undone. This will permanently delete the page template. Tests using this template might break if not reassigned."})}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>{t('common.cancel', {defaultValue: 'Cancel'})}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteTemplate} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                    {isDeleting ? t('pageTemplateEditor.deleting', {defaultValue: 'Deleting...'}) : t('common.delete', {defaultValue: 'Delete'})}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" onClick={updatePreview} disabled={isSaving || isDeleting}><Eye className="mr-2 h-4 w-4" /> {t('pageTemplateEditor.updatePreview')}</Button>
            <Button onClick={handleSaveTemplate} disabled={isSaving || isLoadingInitialData || isDeleting}>
              <Save className="mr-2 h-4 w-4" /> 
              {isSaving ? t('pageTemplateEditor.saving', {defaultValue: 'Saving...'}) : t('pageTemplateEditor.saveTemplate')}
            </Button>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-6 flex-1 min-h-0">
          <Card className="md:col-span-1 flex flex-col overflow-y-auto shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><Layers className="mr-2 h-5 w-5 text-primary" />{t('pageTemplateEditor.details.title')}</CardTitle>
              <CardDescription>{t('pageTemplateEditor.details.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex-grow p-4">
              <div>
                <Label htmlFor="templateName" className="text-sm font-medium">{t('pageTemplateEditor.details.nameLabel')}</Label>
                <Input
                  id="templateName"
                  placeholder={t('pageTemplateEditor.details.namePlaceholder')}
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="mt-1"
                  disabled={isSaving}
                />
              </div>
              <div>
                <Label htmlFor="templateDescription" className="text-sm font-medium">{t('pageTemplateEditor.details.descriptionLabel')}</Label>
                <Textarea
                  id="templateDescription"
                  placeholder={t('pageTemplateEditor.details.descriptionPlaceholder')}
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  className="mt-1"
                  rows={3}
                  disabled={isSaving}
                />
              </div>
              <Separator/>
              <div>
                <Label htmlFor="htmlContent" className="text-sm font-medium flex items-center"><Palette className="mr-2 h-4 w-4" /> {t('pageTemplateEditor.details.htmlLabel')}</Label>
                <Textarea
                  id="htmlContent"
                  placeholder={t('pageTemplateEditor.details.htmlPlaceholder')}
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="mt-1 font-mono text-xs min-h-[250px] resize-y"
                  rows={12}
                  disabled={isSaving}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('pageTemplateEditor.details.htmlHint')}
                </p>
              </div>
              <div>
                <Label htmlFor="cssContent" className="text-sm font-medium flex items-center"><Palette className="mr-2 h-4 w-4" /> {t('pageTemplateEditor.details.cssLabel')}</Label>
                <Textarea
                  id="cssContent"
                  placeholder={t('pageTemplateEditor.details.cssPlaceholder')}
                  value={cssContent}
                  onChange={(e) => setCssContent(e.target.value)}
                  className="mt-1 font-mono text-xs min-h-[250px] resize-y"
                  rows={12}
                  disabled={isSaving}
                />
                <p className="text-xs text-muted-foreground mt-1">
                   {t('pageTemplateEditor.details.cssHint')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-1 flex flex-col overflow-hidden shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><Eye className="mr-2 h-5 w-5 text-primary" />{t('pageTemplateEditor.preview.titlePane')}</CardTitle>
              <CardDescription>{t('pageTemplateEditor.preview.descriptionPane')}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-0 m-0">
              <iframe
                srcDoc={previewContent}
                title={t('pageTemplateEditor.preview.iframeTitle')}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin" 
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}


function EditPageTemplatePage() {
  return (
    <Suspense fallback={<div>Loading template editor...</div>}>
      <EditPageTemplateEditorPageContent />
    </Suspense>
  );
}

import withAuth from '@/components/auth/withAuth';
export default withAuth(EditPageTemplatePage);
