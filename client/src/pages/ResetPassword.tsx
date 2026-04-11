import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Sun, Home, Lock } from 'lucide-react';
import atlasLogo from '@assets/atlas_1764093111680.png';
import atlasLogoLight from '@assets/logo_light_1774918799268.png';
import { toast } from 'sonner';

export default function ResetPassword() {
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get('token'));
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Invalid or missing reset link.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/complete-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        const msg = data.message || 'Failed to reset password.';
        toast.error(msg.endsWith('.') || msg.endsWith('!') || msg.endsWith('?') ? msg : `${msg}.`);
        return;
      }

      toast.success('Password reset successfully. Redirecting to sign in.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 800);
    } catch (err) {
      console.error(err);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-full ${isDark ? 'dark' : ''}`}>
      <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <header className="glass-nav w-full sticky top-0 z-50 rounded-b-2xl flex-shrink-0">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => (window.location.href = '/')}
                className="flex items-center gap-3 min-w-0 rounded-xl px-4 py-1.5 cursor-pointer hover:bg-primary/10 outline-none focus-visible:ring-0"
              >
                <div className="logo-glass flex items-center justify-center p-1.5 flex-shrink-0 ring-1 ring-black/5 dark:ring-white/10">
                  <img src={isDark ? atlasLogoLight : atlasLogo} alt="Atlas Logo" className="h-7 w-7 sm:h-8 sm:w-8 object-contain" />
                </div>
                <div className="hidden sm:flex flex-col min-w-0">
                  <span className="text-base sm:text-lg font-bold tracking-tight gradient-text leading-tight truncate">
                    Atlas
                  </span>
                  <span className="text-xs font-medium text-muted-foreground tracking-widest uppercase truncate">
                    Review
                  </span>
                </div>
              </button>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button type="button" onClick={toggleTheme} className="p-2 hover-elevate rounded-md" title="Toggle theme">
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button
                  type="button"
                  onClick={() => (window.location.href = '/')}
                  className="p-2 hover-elevate rounded-md hover:bg-primary/10"
                  title="Back to home"
                >
                  <Home className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex flex-col items-center justify-center px-4 py-16 flex-1">
            <Card variant="glass" className="w-full max-w-md glow-primary">
              <CardHeader className="space-y-2">
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-primary/10 p-4">
                    <Lock className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-center text-2xl gradient-text">Set a new password</CardTitle>
                <CardDescription className="text-center">
                  Choose a new password for your account. This link can only be used once.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!token ? (
                  <p className="text-sm text-muted-foreground text-center">
                    This reset link is invalid or incomplete.{' '}
                    <a href="/login" className="text-primary underline underline-offset-2">
                      Back to sign in
                    </a>
                  </p>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="new-password" className="text-sm font-medium">
                        New password
                      </label>
                      <Input
                        id="new-password"
                        type="password"
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isLoading}
                        required
                        minLength={8}
                        maxLength={128}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="confirm-password" className="text-sm font-medium">
                        Confirm password
                      </label>
                      <Input
                        id="confirm-password"
                        type="password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                        required
                        minLength={8}
                        maxLength={128}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Saving…' : 'Update password'}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                      <a href="/login" className="text-primary underline underline-offset-2">
                        Sign in instead
                      </a>
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
