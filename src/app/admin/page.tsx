
'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Database, Save, ListChecks, History, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdminPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedStorage, setSelectedStorage] = useState('firestore');

  // Effect to set initial selection based on some logic or default
  useEffect(() => {
    // In a real app, you might fetch current config and set selectedStorage
    setSelectedStorage('firestore'); // Default to Firestore
  }, []);


  const handleSaveConfiguration = () => {
    toast({
      title: t('adminPanel.toast.saveConfigTitle', { defaultValue: "Configuration Update" }),
      description: t('adminPanel.toast.saveConfigDescription', { defaultValue: "This feature is not yet implemented. Backend development is required." }),
    });
  };
  
  const handleActionNotImplemented = (featureName: string) => {
    toast({
      title: t('adminPanel.toast.notImplementedTitle', { defaultValue: "Feature Not Implemented"}),
      description: t('adminPanel.toast.notImplementedDescription', { featureName, defaultValue: `${featureName} functionality is not yet available.` }),
    });
  };

  const pageTitleKey = "adminPanel.pageTitle";

  return (
    <AppLayout currentPageTitleKey={pageTitleKey}>
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-semibold tracking-tight mb-8">
          {t(pageTitleKey, { defaultValue: 'Admin Panel' })}
        </h1>

        {/* Storage Configuration Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-6 w-6 text-primary" />
              {t('adminPanel.storage.title', { defaultValue: 'Storage Configuration' })}
            </CardTitle>
            <CardDescription>
              {t('adminPanel.storage.description', { defaultValue: 'Select and configure permanent storage options. (Note: UI placeholder. Backend implementation needed).' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup 
              value={selectedStorage} 
              onValueChange={setSelectedStorage} 
              className="space-y-2"
            >
              <Label className="font-semibold text-lg">{t('adminPanel.storage.selectLabel', { defaultValue: 'Choose Storage Type:' })}</Label>
              
              {/* SQLite Option */}
              <div className="p-4 border rounded-md hover:bg-accent/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="sqlite" id="sqlite" />
                  <Label htmlFor="sqlite" className="flex-1 cursor-pointer">
                    <span className="font-medium">{t('adminPanel.storage.sqlite.label', { defaultValue: 'SQLite' })}</span>
                    <p className="text-sm text-muted-foreground">{t('adminPanel.storage.sqlite.description', { defaultValue: 'Local file-based database.' })}</p>
                  </Label>
                </div>
                {selectedStorage === 'sqlite' && (
                  <div className="mt-4 space-y-3 pl-8">
                    <div>
                      <Label htmlFor="sqlitePath">{t('adminPanel.storage.sqlite.pathLabel', {defaultValue: 'Database File Path'})}</Label>
                      <Input id="sqlitePath" placeholder={t('adminPanel.storage.sqlite.pathPlaceholder', {defaultValue: '/path/to/your/database.sqlite'})} className="mt-1" />
                    </div>
                  </div>
                )}
              </div>
              
              {/* MySQL Option */}
              <div className="p-4 border rounded-md hover:bg-accent/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="mysql" id="mysql" />
                  <Label htmlFor="mysql" className="flex-1 cursor-pointer">
                    <span className="font-medium">{t('adminPanel.storage.mysql.label', { defaultValue: 'MySQL' })}</span>
                    <p className="text-sm text-muted-foreground">{t('adminPanel.storage.mysql.description', { defaultValue: 'Robust relational database.' })}</p>
                  </Label>
                </div>
                {selectedStorage === 'mysql' && (
                  <div className="mt-4 space-y-3 pl-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="mysqlHost">{t('adminPanel.storage.mysql.hostLabel', {defaultValue: 'Host'})}</Label>
                        <Input id="mysqlHost" placeholder="localhost" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="mysqlPort">{t('adminPanel.storage.mysql.portLabel', {defaultValue: 'Port'})}</Label>
                        <Input id="mysqlPort" placeholder="3306" className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="mysqlDbName">{t('adminPanel.storage.mysql.dbNameLabel', {defaultValue: 'Database Name'})}</Label>
                      <Input id="mysqlDbName" placeholder="quizsmith_db" className="mt-1" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="mysqlUser">{t('adminPanel.storage.mysql.userLabel', {defaultValue: 'Username'})}</Label>
                        <Input id="mysqlUser" placeholder="db_user" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="mysqlPassword">{t('adminPanel.storage.mysql.passwordLabel', {defaultValue: 'Password'})}</Label>
                        <Input id="mysqlPassword" type="password" placeholder="••••••••" className="mt-1" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Firebase Firestore Option */}
              <div className="p-4 border rounded-md hover:bg-accent/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="firestore" id="firestore" />
                  <Label htmlFor="firestore" className="flex-1 cursor-pointer">
                    <span className="font-medium">{t('adminPanel.storage.firestore.label', { defaultValue: 'Firebase Firestore' })}</span>
                    <p className="text-sm text-muted-foreground">{t('adminPanel.storage.firestore.description', { defaultValue: 'Scalable NoSQL cloud database.' })}</p>
                  </Label>
                </div>
                {selectedStorage === 'firestore' && (
                  <div className="mt-4 space-y-3 pl-8">
                    <div>
                      <Label htmlFor="firestoreProjectId">{t('adminPanel.storage.firestore.projectIdLabel', {defaultValue: 'Project ID'})}</Label>
                      <Input id="firestoreProjectId" placeholder="your-firebase-project-id" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="firestoreClientEmail">{t('adminPanel.storage.firestore.clientEmailLabel', {defaultValue: 'Client Email'})}</Label>
                      <Input id="firestoreClientEmail" placeholder="service-account@project-id.iam.gserviceaccount.com" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="firestorePrivateKey">{t('adminPanel.storage.firestore.privateKeyLabel', {defaultValue: 'Private Key (JSON)'})}</Label>
                      <Textarea id="firestorePrivateKey" placeholder={t('adminPanel.storage.firestore.privateKeyPlaceholder', {defaultValue: 'Paste your Firebase service account private key JSON here...'})} className="mt-1 font-mono text-xs" rows={5}/>
                    </div>
                  </div>
                )}
              </div>

              {/* Other Database Option */}
               <div className="p-4 border rounded-md hover:bg-accent/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="flex-1 cursor-pointer">
                    <span className="font-medium">{t('adminPanel.storage.other.label', { defaultValue: 'Other Database' })}</span>
                    <p className="text-sm text-muted-foreground">{t('adminPanel.storage.other.description', { defaultValue: 'Requires manual backend setup.' })}</p>
                  </Label>
                </div>
                 {selectedStorage === 'other' && (
                  <div className="mt-4 space-y-3 pl-8">
                    <div>
                      <Label htmlFor="otherConnectionString">{t('adminPanel.storage.other.connectionStringLabel', {defaultValue: 'Connection String / Details'})}</Label>
                      <Textarea id="otherConnectionString" placeholder={t('adminPanel.storage.other.connectionStringPlaceholder', {defaultValue: 'Enter connection details or path...'})} className="mt-1" rows={3}/>
                    </div>
                  </div>
                )}
              </div>
            </RadioGroup>

            <Button onClick={handleSaveConfiguration} className="mt-4">
              <Save className="mr-2 h-4 w-4" />
              {t('adminPanel.storage.saveButton', { defaultValue: 'Save Configuration' })}
            </Button>
          </CardContent>
        </Card>

        {/* Application Logs Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-6 w-6 text-primary" />
              {t('adminPanel.logs.title', {defaultValue: 'Application Logs'})}
            </CardTitle>
            <CardDescription>
              {t('adminPanel.logs.description', {defaultValue: 'View system and application logs. (Placeholder UI)'})}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder={t('adminPanel.logs.placeholder', {defaultValue: 'Log entries would appear here...\n[INFO] 2023-10-27 10:00:00 - Application started.\n[WARN] 2023-10-27 10:05:23 - User login attempt failed.\n...'})} 
              readOnly 
              className="min-h-[200px] bg-muted/50 font-mono text-xs" 
              rows={10}
            />
            <Button onClick={() => handleActionNotImplemented(t('adminPanel.logs.refreshButton', {defaultValue: 'Refresh Logs'}))} variant="outline" className="mt-4">
              {t('adminPanel.logs.refreshButton', {defaultValue: 'Refresh Logs'})}
            </Button>
          </CardContent>
        </Card>

        {/* Version Rollbacks Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="mr-2 h-6 w-6 text-primary" />
              {t('adminPanel.rollbacks.title', {defaultValue: 'Version Rollbacks'})}
            </CardTitle>
            <CardDescription>
              {t('adminPanel.rollbacks.description', {defaultValue: 'Manage and rollback to previous application versions. (Placeholder UI)'})}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-md p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{t('adminPanel.rollbacks.versionLabel', {version: '1.2.3 (Current)', defaultValue: 'Version 1.2.3 (Current)'})}</p>
                  <p className="text-sm text-muted-foreground">{t('adminPanel.rollbacks.deployedDateLabel', {date: 'October 27, 2023', defaultValue: 'Deployed: October 27, 2023'})}</p>
                </div>
                <Button variant="outline" disabled className="opacity-50">
                  {t('adminPanel.rollbacks.currentButton', {defaultValue: 'Current'})}
                </Button>
              </div>
            </div>
            <div className="border rounded-md p-4 hover:bg-accent/30 transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{t('adminPanel.rollbacks.versionLabel', {version: '1.2.2', defaultValue: 'Version 1.2.2'})}</p>
                  <p className="text-sm text-muted-foreground">{t('adminPanel.rollbacks.deployedDateLabel', {date: 'October 25, 2023', defaultValue: 'Deployed: October 25, 2023'})}</p>
                </div>
                <Button onClick={() => handleActionNotImplemented(t('adminPanel.rollbacks.rollbackToButton', {version: '1.2.2', defaultValue: 'Rollback to 1.2.2'}))}>
                  {t('adminPanel.rollbacks.rollbackButton', {defaultValue: 'Rollback'})}
                </Button>
              </div>
            </div>
            <div className="border rounded-md p-4 hover:bg-accent/30 transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{t('adminPanel.rollbacks.versionLabel', {version: '1.2.1', defaultValue: 'Version 1.2.1'})}</p>
                  <p className="text-sm text-muted-foreground">{t('adminPanel.rollbacks.deployedDateLabel', {date: 'October 23, 2023', defaultValue: 'Deployed: October 23, 2023'})}</p>
                </div>
                <Button onClick={() => handleActionNotImplemented(t('adminPanel.rollbacks.rollbackToButton', {version: '1.2.1', defaultValue: 'Rollback to 1.2.1'}))}>
                   {t('adminPanel.rollbacks.rollbackButton', {defaultValue: 'Rollback'})}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
}
