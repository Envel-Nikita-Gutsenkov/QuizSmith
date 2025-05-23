
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
import { Database, Save, FileText, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import { useState, useEffect } from 'react';
import withAuth from '@/components/auth/withAuth';
// Removed: import { firebaseConfig } from '@/lib/firebaseConfig'; 
import { Skeleton } from '@/components/ui/skeleton'; // Added for loading state

function AdminPage() {
  const { t } = useLanguage();
  const { toast } = useToast();

  const [selectedStorage, setSelectedStorage] = useState('sqlite'); // Default to SQLite
  const [sqlitePath, setSqlitePath] = useState('file:./dev.db');
  const [mysqlHost, setMysqlHost] = useState('');
  const [mysqlPort, setMysqlPort] = useState('3306');
  const [mysqlDbName, setMysqlDbName] = useState('');
  const [mysqlUser, setMysqlUser] = useState('');
  const [mysqlPassword, setMysqlPassword] = useState(''); // Will not be directly stored in DB as-is by API

  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Fetch current configuration on mount
  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoadingConfig(true);
      try {
        const response = await fetch('/api/admin/get-db-config');
        if (!response.ok) {
          throw new Error(`Failed to fetch config: ${response.statusText}`);
        }
        const config = await response.json();
        if (config.active_database_type) {
          setSelectedStorage(config.active_database_type);
        }
        if (config.sqlite_path) {
          setSqlitePath(config.sqlite_path);
        }
        if (config.mysql_host) setMysqlHost(config.mysql_host);
        if (config.mysql_port) setMysqlPort(config.mysql_port);
        if (config.mysql_dbname) setMysqlDbName(config.mysql_dbname);
        if (config.mysql_user) setMysqlUser(config.mysql_user);
        // mysql_password_status is informational, not setting mysqlPassword state from it
      } catch (error: any) {
        console.error("Error fetching DB config:", error);
        toast({ title: "Error Fetching Config", description: error.message, variant: "destructive" });
      } finally {
        setIsLoadingConfig(false);
      }
    };
    fetchConfig();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array ensures this runs once on mount


  const handleSaveConfiguration = async () => {
    setIsSavingConfig(true);
    const payload = {
      dbType: selectedStorage,
      sqlitePath: selectedStorage === 'sqlite' ? sqlitePath : undefined,
      mysqlConfig: selectedStorage === 'mysql' ? {
        host: mysqlHost,
        port: parseInt(mysqlPort, 10), // Ensure port is a number
        dbName: mysqlDbName,
        user: mysqlUser,
        password: mysqlPassword, // Send to API, API decides how to handle
      } : undefined,
    };

    try {
      const response = await fetch('/api/admin/configure-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Failed to save configuration: ${response.statusText}`);
      }
      
      toast({
        title: t('adminPanel.toast.saveConfigSuccessTitle', { defaultValue: "Configuration Saved" }),
        description: t('adminPanel.toast.saveConfigSuccessDescription', { 
          defaultValue: result.message || "Settings have been recorded. A server restart might be needed if DATABASE_URL changed."
        }),
        duration: 7000,
      });
       // Optionally, re-fetch config to confirm, or trust the save.
       // For simplicity, we don't re-fetch here.
    } catch (error: any) {
      console.error("Error saving DB config:", error);
      toast({ title: "Error Saving Config", description: error.message, variant: "destructive" });
    } finally {
      setIsSavingConfig(false);
    }
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
              {t('adminPanel.storage.description', { defaultValue: 'Select and configure the primary database for application data. Firebase is used for authentication.' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             {isLoadingConfig ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-10 w-1/4 mt-4" />
              </div>
            ) : (
              <>
                <RadioGroup 
                  value={selectedStorage} 
                  onValueChange={(value) => setSelectedStorage(value as 'sqlite' | 'mysql')} 
                  className="space-y-2"
                  disabled={isSavingConfig}
                >
                  <Label className="font-semibold text-lg">{t('adminPanel.storage.selectLabel', { defaultValue: 'Choose Storage Type:' })}</Label>
                  
                  {/* SQLite Option */}
                  <div className={`p-4 border rounded-md transition-colors ${selectedStorage === 'sqlite' ? 'bg-accent/70' : 'hover:bg-accent/50'}`}>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="sqlite" id="sqlite" disabled={isSavingConfig} />
                      <Label htmlFor="sqlite" className="flex-1 cursor-pointer">
                        <span className="font-medium">{t('adminPanel.storage.sqlite.label', { defaultValue: 'SQLite' })}</span>
                        <p className="text-sm text-muted-foreground">{t('adminPanel.storage.sqlite.description', { defaultValue: 'Local file-based database. Good for development or single-instance deployments.' })}</p>
                      </Label>
                    </div>
                    {selectedStorage === 'sqlite' && (
                      <div className="mt-4 space-y-3 pl-8">
                        <div>
                          <Label htmlFor="sqlitePath">{t('adminPanel.storage.sqlite.pathLabel', {defaultValue: 'Database File Path'})}</Label>
                          <Input 
                            id="sqlitePath" 
                            placeholder="file:./dev.db or file:/path/to/your/database.sqlite" 
                            value={sqlitePath}
                            onChange={(e) => setSqlitePath(e.target.value)}
                            className="mt-1" 
                            disabled={isSavingConfig}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* MySQL Option */}
                  <div className={`p-4 border rounded-md transition-colors ${selectedStorage === 'mysql' ? 'bg-accent/70' : 'hover:bg-accent/50'}`}>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="mysql" id="mysql" disabled={isSavingConfig} />
                      <Label htmlFor="mysql" className="flex-1 cursor-pointer">
                        <span className="font-medium">{t('adminPanel.storage.mysql.label', { defaultValue: 'MySQL' })}</span>
                        <p className="text-sm text-muted-foreground">{t('adminPanel.storage.mysql.description', { defaultValue: 'Robust relational database. Recommended for production.' })}</p>
                      </Label>
                    </div>
                    {selectedStorage === 'mysql' && (
                      <div className="mt-4 space-y-3 pl-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="mysqlHost">{t('adminPanel.storage.mysql.hostLabel', {defaultValue: 'Host'})}</Label>
                            <Input id="mysqlHost" placeholder="localhost" value={mysqlHost} onChange={(e) => setMysqlHost(e.target.value)} className="mt-1" disabled={isSavingConfig} />
                          </div>
                          <div>
                            <Label htmlFor="mysqlPort">{t('adminPanel.storage.mysql.portLabel', {defaultValue: 'Port'})}</Label>
                            <Input id="mysqlPort" placeholder="3306" value={mysqlPort} onChange={(e) => setMysqlPort(e.target.value)} className="mt-1" disabled={isSavingConfig} />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="mysqlDbName">{t('adminPanel.storage.mysql.dbNameLabel', {defaultValue: 'Database Name'})}</Label>
                          <Input id="mysqlDbName" placeholder="quizsmith_db" value={mysqlDbName} onChange={(e) => setMysqlDbName(e.target.value)} className="mt-1" disabled={isSavingConfig} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="mysqlUser">{t('adminPanel.storage.mysql.userLabel', {defaultValue: 'Username'})}</Label>
                            <Input id="mysqlUser" placeholder="db_user" value={mysqlUser} onChange={(e) => setMysqlUser(e.target.value)} className="mt-1" disabled={isSavingConfig} />
                          </div>
                          <div>
                            <Label htmlFor="mysqlPassword">{t('adminPanel.storage.mysql.passwordLabel', {defaultValue: 'Password'})}</Label>
                            <Input id="mysqlPassword" type="password" placeholder="••••••••" value={mysqlPassword} onChange={(e) => setMysqlPassword(e.target.value)} className="mt-1" disabled={isSavingConfig} />
                          </div>
                        </div>
                         <div className="mt-3 p-3 bg-muted/50 rounded-md border border-yellow-500/50">
                            <p className="text-xs text-yellow-700 flex items-start">
                                <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                <span>{t('adminPanel.storage.mysql.passwordWarning', {defaultValue: 'The password entered here will be part of the DATABASE_URL. Ensure this admin panel is secure. For production, it is strongly recommended to set the DATABASE_URL directly as an environment variable on your server.'})}</span>
                            </p>
                        </div>
                      </div>
                    )}
                  </div>
                </RadioGroup>

                <Button onClick={handleSaveConfiguration} className="mt-4" disabled={isSavingConfig || isLoadingConfig}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSavingConfig ? t('adminPanel.storage.savingButton', {defaultValue: 'Saving...'}) : t('adminPanel.storage.saveButton', { defaultValue: 'Save Configuration' })}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Firebase Auth Info Card - Replaces previous Firestore config section */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-6 w-6 text-yellow-500"><path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z"></path><path d="M9 8c-2.65 0-4.8 2.15-4.8 4.8 0 2.02 1.21 3.78 3 4.5V20h4v-2.7c1.79-.72 3-2.48 3-4.5C13.8 10.15 11.65 8 9 8Z"></path></svg>
              {t('adminPanel.firebaseAuth.title', {defaultValue: 'Firebase Authentication'})}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('adminPanel.firebaseAuth.description', {defaultValue: 'Firebase is utilized for user authentication and identity management. User accounts, login, and password resets are handled via Firebase Auth.'})}
            </p>
          </CardContent>
        </Card>
        
        {/* Application Logs Card (remains unchanged) */}
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

      </div>
    </AppLayout>
  );
}

export default withAuth(AdminPage);
