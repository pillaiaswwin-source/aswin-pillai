/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuth } from './AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Ship, Lock, User as UserIcon, AlertCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [turnstileToken, setTurnstileToken] = React.useState<string | null>(null);
  const turnstileRef = React.useRef<TurnstileInstance>(null);

  const siteKey = (import.meta as any).env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'; // Testing key

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!turnstileToken) {
      toast.error('Please complete the security check');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(username, password);
      if (success) {
        toast.success('Login successful');
      } else {
        toast.error('Invalid username or password');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl border-t-4 border-t-primary bg-card">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Ship className="w-10 h-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Yard Management System</CardTitle>
          <CardDescription>
            Enter your credentials to access the terminal
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="username" 
                  placeholder="e.g. manager" 
                  className="pl-9"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-center py-2">
              <Turnstile
                ref={turnstileRef}
                siteKey={siteKey}
                onSuccess={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken(null)}
                onError={() => {
                  setTurnstileToken(null);
                  toast.error('Security check failed. Please refresh.');
                }}
                options={{
                  theme: 'light',
                  size: 'normal',
                }}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Authenticating..." : "Sign In"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
