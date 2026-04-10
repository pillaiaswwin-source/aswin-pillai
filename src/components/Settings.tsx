/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuth } from '../AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User as UserIcon, 
  Lock, 
  Bell, 
  Shield, 
  Mail, 
  Phone, 
  UserCircle, 
  Users, 
  Plus, 
  Trash2, 
  Edit2,
  Key
} from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, UserRole } from '../types';

export default function Settings() {
  const { user, users, updateProfile, changePassword, addUser, deleteUser, updateUser, resetUserPassword } = useAuth();
  
  // Profile State
  const [name, setName] = React.useState(user?.name || '');
  const [email, setEmail] = React.useState(user?.email || '');
  const [phone, setPhone] = React.useState(user?.phone || '');
  
  // Password State
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isChangingPass, setIsChangingPass] = React.useState(false);

  // User Management State
  const [isUserDialogOpen, setIsUserDialogOpen] = React.useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = React.useState(false);
  const [resettingUser, setResettingUser] = React.useState<User | null>(null);
  const [newResetPassword, setNewResetPassword] = React.useState('');
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [userFormData, setUserFormData] = React.useState({
    username: '',
    name: '',
    email: '',
    role: 'STAFF' as UserRole,
    password: ''
  });

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      updateUser({
        ...editingUser,
        name: userFormData.name,
        email: userFormData.email,
        role: userFormData.role
      });
      toast.success('User updated successfully');
    } else {
      if (!userFormData.username || !userFormData.password) {
        toast.error('Username and password are required');
        return;
      }
      
      const newUser: User = {
        id: `u-${Date.now()}`,
        username: userFormData.username,
        name: userFormData.name,
        email: userFormData.email,
        role: userFormData.role
      };
      
      addUser(newUser, userFormData.password);
      toast.success('User added successfully');
    }
    
    setIsUserDialogOpen(false);
    setEditingUser(null);
    setUserFormData({ username: '', name: '', email: '', role: 'STAFF', password: '' });
  };

  const openEditUser = (u: User) => {
    setEditingUser(u);
    setUserFormData({
      username: u.username,
      name: u.name,
      email: u.email || '',
      role: u.role as UserRole,
      password: '' // Don't show password
    });
    setIsUserDialogOpen(true);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (resettingUser && newResetPassword) {
      resetUserPassword(resettingUser.username, newResetPassword);
      toast.success(`Password reset for ${resettingUser.name}`);
      setIsResetDialogOpen(false);
      setResettingUser(null);
      setNewResetPassword('');
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email, phone });
    toast.success('Profile updated successfully');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsChangingPass(true);
    try {
      const result = await changePassword(currentPassword, newPassword);
      if (result.success) {
        toast.success(result.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="w-20 h-20 border-4 border-background shadow-xl">
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
            {user?.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{user?.name}</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Shield className="w-4 h-4" /> {user?.role} Account
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className={cn("grid w-full", user?.role === 'OWNER' ? "grid-cols-4 lg:w-[550px]" : "grid-cols-3 lg:w-[400px]")}>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          {user?.role === 'OWNER' && <TabsTrigger value="users">Users</TabsTrigger>}
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your public profile and contact information.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateProfile}>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="username" value={user?.username} disabled className="pl-9 bg-muted" />
                    </div>
                    <p className="text-[10px] text-muted-foreground">Username cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="pl-9"
                        placeholder="owner@depottrack.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="phone" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        className="pl-9"
                        placeholder="+91 00000 00000"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button type="submit">Save Changes</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Password & Security</CardTitle>
              <CardDescription>
                Update your password and manage account security.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleChangePassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input 
                    id="current-password" 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <Separator className="my-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                      id="new-password" 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button type="submit" disabled={isChangingPass}>
                  {isChangingPass ? "Updating..." : "Update Password"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about yard activities.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base">Gate Entry Alerts</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications for every new gate-in/out.</p>
                </div>
                <Button variant="outline" size="sm">Enabled</Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base">Reefer Deviations</Label>
                  <p className="text-sm text-muted-foreground">Critical alerts for temperature deviations.</p>
                </div>
                <Button variant="outline" size="sm">Enabled</Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base">Daily Reports</Label>
                  <p className="text-sm text-muted-foreground">Get a summary of yard stats every morning.</p>
                </div>
                <Button variant="outline" size="sm">Disabled</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {user?.role === 'OWNER' && (
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage system users, roles, and access permissions.
                  </CardDescription>
                </div>
                <Dialog open={isUserDialogOpen} onOpenChange={(open) => {
                  setIsUserDialogOpen(open);
                  if (!open) {
                    setEditingUser(null);
                    setUserFormData({ username: '', name: '', email: '', role: 'STAFF', password: '' });
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="w-4 h-4" /> Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleUserSubmit}>
                      <DialogHeader>
                        <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                        <DialogDescription>
                          {editingUser ? 'Update user details and role.' : 'Create a new user account for the yard system.'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="u-name" className="text-right">Name</Label>
                          <Input 
                            id="u-name" 
                            className="col-span-3" 
                            value={userFormData.name}
                            onChange={(e) => setUserFormData({...userFormData, name: e.target.value})}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="u-username" className="text-right">Username</Label>
                          <Input 
                            id="u-username" 
                            className="col-span-3" 
                            value={userFormData.username}
                            onChange={(e) => setUserFormData({...userFormData, username: e.target.value})}
                            disabled={!!editingUser}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="u-email" className="text-right">Email</Label>
                          <Input 
                            id="u-email" 
                            type="email"
                            className="col-span-3" 
                            value={userFormData.email}
                            onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="u-role" className="text-right">Role</Label>
                          <Select 
                            value={userFormData.role} 
                            onValueChange={(val: UserRole) => setUserFormData({...userFormData, role: val})}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="OWNER">Owner</SelectItem>
                              <SelectItem value="MANAGER">Manager</SelectItem>
                              <SelectItem value="REPAIRMAN">Repairman</SelectItem>
                              <SelectItem value="BILLING">Billing</SelectItem>
                              <SelectItem value="STAFF">Staff</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {!editingUser && (
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="u-pass" className="text-right">Password</Label>
                            <Input 
                              id="u-pass" 
                              type="password"
                              className="col-span-3" 
                              value={userFormData.password}
                              onChange={(e) => setUserFormData({...userFormData, password: e.target.value})}
                              required
                            />
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button type="submit">{editingUser ? 'Update User' : 'Create User'}</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                {u.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{u.name}</p>
                              <p className="text-[10px] text-muted-foreground">@{u.username}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{u.email || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Dialog open={isResetDialogOpen && resettingUser?.id === u.id} onOpenChange={(open) => {
                              if (!open) {
                                setIsResetDialogOpen(false);
                                setResettingUser(null);
                                setNewResetPassword('');
                              }
                            }}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-amber-500 hover:text-amber-600"
                                  onClick={() => {
                                    setResettingUser(u);
                                    setIsResetDialogOpen(true);
                                  }}
                                >
                                  <Key className="w-3.5 h-3.5" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <form onSubmit={handleResetPassword}>
                                  <DialogHeader>
                                    <DialogTitle>Reset Password</DialogTitle>
                                    <DialogDescription>
                                      Set a new password for <strong>{u.name}</strong> (@{u.username}).
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="reset-pass">New Password</Label>
                                      <Input 
                                        id="reset-pass" 
                                        type="password"
                                        value={newResetPassword}
                                        onChange={(e) => setNewResetPassword(e.target.value)}
                                        required
                                        placeholder="Enter new password"
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button type="submit">Reset Password</Button>
                                  </DialogFooter>
                                </form>
                              </DialogContent>
                            </Dialog>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditUser(u)}>
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            {u.id !== user?.id && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete ${u.name}?`)) {
                                    deleteUser(u.id);
                                    toast.success('User deleted');
                                  }
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
