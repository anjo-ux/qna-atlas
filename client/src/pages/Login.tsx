import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Sun, ChevronsUpDown, Check, Mail } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import atlasLogo from '@assets/atlas_1764093111680.png';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getUniversityOptions } from '@/data/universities';

export default function Login() {
  const [location] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(location === '/signup');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [institution, setInstitution] = useState('');
  const [openCombobox, setOpenCombobox] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);

  const universities = useMemo(() => {
    return getUniversityOptions().map(u => u.value);
  }, []);

  const filteredUniversities = useMemo(() => {
    if (!searchQuery) return universities;
    return universities.filter(uni => 
      uni.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, universities]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const payload = isSignUp
        ? { email, password, confirmPassword, firstName, lastName, institutionalAffiliation: institution }
        : { email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Authentication Failed');
        return;
      }

      // Clear localStorage data for new user session
      localStorage.removeItem('psite-question-responses');
      localStorage.removeItem('psite-highlights');
      localStorage.removeItem('psite-notes');

      // Redirect to home
      window.location.href = '/';
    } catch (error) {
      toast.error('An error occurred, please try again.');
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsForgotPasswordLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Failed to send password retrieval email');
        return;
      }

      toast.success('Password retrieval email sent! Check your inbox.');
      setShowForgotPassword(false);
      setForgotPasswordEmail('');
    } catch (error) {
      toast.error('An error occurred, please try again.');
      console.error('Forgot password error:', error);
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-full ${isDark ? 'dark' : ''}`}>
      <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-surface border-glass border-b flex-shrink-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => window.location.href = '/'} 
            className="flex items-center gap-3 rounded-md p-1 cursor-pointer"
            data-testid="button-home"
          >
            <img src={atlasLogo} alt="Atlas Logo" className="w-8 h-8 object-contain" />
            <h1 className="text-xl font-bold gradient-text">The Atlas Review</h1>
          </button>
          <button onClick={toggleTheme} className="p-2 hover-elevate rounded-md" data-testid="button-theme-toggle">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="flex flex-col items-center justify-center px-4 py-16 flex-1">
          <Card variant="glass" className="w-full max-w-md glow-primary">
            <CardHeader className="space-y-2">
              <div className="flex justify-center mb-4">
                <img src={atlasLogo} alt="Atlas Logo" className="w-16 h-16 object-contain" />
              </div>
              <CardTitle className="text-center text-2xl gradient-text">
                {isSignUp ? 'Create Account' : 'Sign In'}
              </CardTitle>
              <CardDescription className="text-center">
                {isSignUp
                  ? 'Start your 30-day free trial of the Atlas Review.'
                  : 'Access your plastic surgery study materials today.'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium">
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="First"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isLoading}
                      required
                      data-testid="input-first-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium">
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Last"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isLoading}
                      required
                      data-testid="input-last-name"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder={isSignUp ? 'Enter Password' : 'Enter Password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  data-testid="input-password"
                />
              </div>

              {isSignUp && (
                <>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm Password
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      data-testid="input-confirm-password"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Institution</label>
                    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openCombobox}
                          className="w-full justify-between"
                          data-testid="select-institution-signup"
                          disabled={isLoading}
                        >
                          {institution || "Select Institution"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command shouldFilter={false}>
                          <CommandInput 
                            placeholder="Search institutions..." 
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                            data-testid="input-institution-search"
                          />
                          <CommandEmpty>No institution found.</CommandEmpty>
                          <CommandList>
                            <CommandGroup>
                              {filteredUniversities.map((uni) => (
                                <CommandItem
                                  key={uni}
                                  value={uni}
                                  onSelect={(currentValue) => {
                                    setInstitution(currentValue);
                                    setOpenCombobox(false);
                                    setSearchQuery('');
                                  }}
                                  data-testid={`option-${uni}`}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      institution === uni ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {uni}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full glow-primary transition-glow"
                disabled={isLoading}
                data-testid={isSignUp ? 'button-register' : 'button-login'}
              >
                {isLoading
                  ? 'Loading...'
                  : isSignUp
                    ? 'Create Account'
                    : 'Sign In'}
              </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setPassword('');
                    setConfirmPassword('');
                    setFirstName('');
                    setLastName('');
                  }}
                  className="text-primary hover:underline font-medium"
                  data-testid="button-toggle-auth"
                >
                  {isSignUp
                    ? 'Sign In Instead'
                    : "Sign Up Instead"}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="border-t py-6 bg-muted/30 flex-shrink-0">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            Atlas Review © {new Date().getFullYear()} • Empowering Surgical Education
          </div>
        </footer>
      </div>
      </div>
    </div>
  );
}
