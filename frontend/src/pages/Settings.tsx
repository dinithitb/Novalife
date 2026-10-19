import { useState } from 'react';
import { Save, User, Lock, Bell, Building2, Shield, Loader2, Eye, EyeOff } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useBranches, useUpdateUser } from '@/hooks/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function Settings() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const { data: branches = [] } = useBranches();
  const updateUser = useUpdateUser();

  // Profile form
  const [profile, setProfile] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  });

  // Password form
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Notification prefs (local — no backend for these yet)
  const [notifPrefs, setNotifPrefs] = useState({
    lowStock: true,
    expiryWarning: true,
    emergencyRequest: true,
    transferRequest: true,
    emailAlerts: false,
  });

  const myBranch = branches.find(b => b.id === user?.branchId);

  const handleSaveProfile = async () => {
    if (!profile.firstName || !profile.lastName || !profile.email) {
      toast({ variant: 'destructive', title: 'Required fields missing' }); return;
    }
    setSavingProfile(true);
    try {
      await updateUser.mutateAsync({
        id: user!.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone || undefined,
      });
      toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    if (!passwords.next || passwords.next.length < 6) {
      toast({ variant: 'destructive', title: 'Password must be at least 6 characters' }); return;
    }
    if (passwords.next !== passwords.confirm) {
      toast({ variant: 'destructive', title: 'Passwords do not match' }); return;
    }
    setSavingPassword(true);
    try {
      await updateUser.mutateAsync({ id: user!.id, password: passwords.next });
      setPasswords({ current: '', next: '', confirm: '' });
      toast({ title: 'Password changed', description: 'Your password has been updated.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header title="Settings" subtitle="Manage your account and system preferences" />

      <div className="p-6 max-w-3xl">
        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile" className="gap-2"><User className="w-4 h-4" />Profile</TabsTrigger>
            <TabsTrigger value="security" className="gap-2"><Lock className="w-4 h-4" />Security</TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2"><Bell className="w-4 h-4" />Notifications</TabsTrigger>
            <TabsTrigger value="account" className="gap-2"><Shield className="w-4 h-4" />Account Info</TabsTrigger>
          </TabsList>

          {/* ── Profile Tab ── */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your name, email, and contact details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                    {user?.firstName[0]}{user?.lastName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{user?.firstName} {user?.lastName}</p>
                    <Badge variant="outline" className="capitalize text-xs mt-1">
                      {user?.role?.replace(/-/g, ' ')}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name *</Label>
                    <Input value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name *</Label>
                    <Input value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Email Address *</Label>
                    <Input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+1 (555) 000-0000" />
                  </div>
                </div>

                <div className="pt-2">
                  <Button onClick={handleSaveProfile} disabled={savingProfile} className="bg-gradient-primary text-primary-foreground">
                    {savingProfile ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : <><Save className="w-4 h-4 mr-2" />Save Profile</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Security Tab ── */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Choose a strong password with at least 6 characters.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <div className="relative">
                    <Input
                      type={showPw ? 'text' : 'password'}
                      value={passwords.next}
                      onChange={e => setPasswords(p => ({ ...p, next: e.target.value }))}
                      placeholder="At least 6 characters"
                      className="pr-10"
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    value={passwords.confirm}
                    onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                    className={cn(passwords.confirm && passwords.next !== passwords.confirm && 'border-destructive')}
                  />
                  {passwords.confirm && passwords.next !== passwords.confirm && (
                    <p className="text-xs text-destructive">Passwords do not match</p>
                  )}
                </div>
                <Button onClick={handleSavePassword} disabled={savingPassword} className="bg-gradient-primary text-primary-foreground">
                  {savingPassword ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Changing…</> : <><Lock className="w-4 h-4 mr-2" />Change Password</>}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Notifications Tab ── */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose which alerts you want to receive in the app.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-0">
                {[
                  { key: 'lowStock',         label: 'Low Stock Alerts',      desc: 'When a blood type falls below minimum threshold' },
                  { key: 'expiryWarning',    label: 'Expiry Warnings',       desc: 'When units are within 7 days of expiry' },
                  { key: 'emergencyRequest', label: 'Emergency Requests',    desc: 'When a hospital submits an emergency request' },
                  { key: 'transferRequest',  label: 'Transfer Requests',     desc: 'When a new inter-branch transfer is requested' },
                  { key: 'emailAlerts',      label: 'Email Alerts',          desc: 'Receive critical alerts by email (requires SMTP config)' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between py-4 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                    <Switch
                      checked={notifPrefs[key as keyof typeof notifPrefs]}
                      onCheckedChange={v => setNotifPrefs(p => ({ ...p, [key]: v }))}
                    />
                  </div>
                ))}
                <p className="text-xs text-muted-foreground pt-4">
                  Note: Notification preferences are stored locally and will reset on next login until a preferences API is added.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Account Info Tab ── */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>Read-only account information managed by your administrator.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'User ID',     value: user?.id },
                    { label: 'Role',        value: user?.role?.replace(/-/g, ' '), capitalize: true },
                    { label: 'Branch',      value: myBranch?.name ?? (user?.branchId ? user.branchId : 'No branch assigned') },
                    { label: 'Account Status', value: 'Active' },
                    { label: 'Last Login',  value: user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A' },
                    { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A' },
                  ].map(({ label, value, capitalize }) => (
                    <div key={label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <span className={cn('text-sm font-medium', capitalize && 'capitalize')}>{value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground">
                    To change your role or branch assignment, contact your system administrator.
                    Your JWT session is valid for 12 hours from last login.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
