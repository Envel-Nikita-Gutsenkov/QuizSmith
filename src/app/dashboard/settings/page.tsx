import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bell, Shield, CreditCard, Palette } from 'lucide-react';

export default function SettingsPage() {
  return (
    <AppLayout currentPageTitle="Settings">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold tracking-tight mb-8">Settings</h1>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 mb-6">
            <TabsTrigger value="profile"><User className="mr-1 h-4 w-4 hidden sm:inline-block" />Profile</TabsTrigger>
            <TabsTrigger value="notifications"><Bell className="mr-1 h-4 w-4 hidden sm:inline-block" />Notifications</TabsTrigger>
            <TabsTrigger value="security"><Shield className="mr-1 h-4 w-4 hidden sm:inline-block" />Security</TabsTrigger>
            {/* <TabsTrigger value="billing"><CreditCard className="mr-1 h-4 w-4 hidden sm:inline-block" />Billing</TabsTrigger> */}
            {/* <TabsTrigger value="appearance"><Palette className="mr-1 h-4 w-4 hidden sm:inline-block" />Appearance</TabsTrigger> */}
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details and profile picture.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="https://placehold.co/200x200.png" alt="User avatar" data-ai-hint="profile picture" />
                    <AvatarFallback>QS</AvatarFallback>
                  </Avatar>
                  <Button variant="outline">Change Picture</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" defaultValue="Quiz Smithy" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="user@quizsmith.app" disabled />
                  </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="bio">Short Bio</Label>
                    <Input id="bio" placeholder="Tell us a bit about yourself" />
                  </div>
                <Button>Save Profile</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Manage how you receive notifications from QuizSmith.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">Notification settings will be available soon.</p>
                {/* Placeholder for notification toggles */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security, like changing password.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                  <Input id="confirmNewPassword" type="password" />
                </div>
                <Button>Change Password</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
