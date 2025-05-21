
'use client'; // Required for useLanguage hook

import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bell, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext'; // Added

export default function SettingsPage() {
  const { t } = useLanguage(); // Added

  // These would ideally be translation keys too
  const profileTab = "Profile";
  const notificationsTab = "Notifications";
  const securityTab = "Security";

  return (
    <AppLayout currentPageTitleKey="settings.pageTitle"> {/* Changed to currentPageTitleKey */}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold tracking-tight mb-8">{t('settings.pageTitle')}</h1>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 mb-6">
            <TabsTrigger value="profile"><User className="mr-1 h-4 w-4 hidden sm:inline-block" />{profileTab}</TabsTrigger>
            <TabsTrigger value="notifications"><Bell className="mr-1 h-4 w-4 hidden sm:inline-block" />{notificationsTab}</TabsTrigger>
            <TabsTrigger value="security"><Shield className="mr-1 h-4 w-4 hidden sm:inline-block" />{securityTab}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle> {/* Example: Would become t('settings.profile.title') */}
                <CardDescription>Update your personal details and profile picture.</CardDescription> {/* Example */}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="https://placehold.co/200x200.png" alt="User avatar" data-ai-hint="profile picture" />
                    <AvatarFallback>QS</AvatarFallback>
                  </Avatar>
                  <Button variant="outline">Change Picture</Button> {/* Example */}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label> {/* Example */}
                    <Input id="fullName" defaultValue="Quiz Smithy" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label> {/* Example */}
                    <Input id="email" type="email" defaultValue="user@quizsmith.app" disabled />
                  </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="bio">Short Bio</Label> {/* Example */}
                    <Input id="bio" placeholder="Tell us a bit about yourself" />
                  </div>
                <Button>Save Profile</Button> {/* Example */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle> {/* Example */}
                <CardDescription>Manage how you receive notifications from QuizSmith.</CardDescription> {/* Example */}
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">Notification settings will be available soon.</p> {/* Example */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle> {/* Example */}
                <CardDescription>Manage your account security, like changing password.</CardDescription> {/* Example */}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label> {/* Example */}
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label> {/* Example */}
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">Confirm New Password</Label> {/* Example */}
                  <Input id="confirmNewPassword" type="password" />
                </div>
                <Button>Change Password</Button> {/* Example */}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

