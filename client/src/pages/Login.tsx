import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronsUpDown, Check, Mail, Lock, Home, Eye, EyeOff, ArrowRight } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import atlasLogo from '@assets/atlas_1764093111680.png';
import atlasLogoLight from '@assets/logo_light_1774918799268.png';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getUniversityOptions } from '@/data/universities';
import { TRAINING_LEVEL_OPTIONS } from '@shared/trainingLevels';
import { applySpecialtyToDocument, getMarketingSpecialtyId, switchMarketingSpecialty } from '@/lib/specialtyBootstrap';
import { SPECIALTY_LIST, getSpecialty, type SpecialtyId } from '@shared/specialties';
import { SpecialtySubheaderDropdown } from '@/components/SpecialtySubheaderDropdown';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { AuthSplitShell, GoogleMark } from '@/components/ui/travel-connect-signin-1';
import { useHostSpecialty } from '@/hooks/useSpecialty';
import { useTheme } from '@/hooks/useTheme';

/** Google OAuth UI is implemented but hidden until credentials and consent are ready. */
const SHOW_GOOGLE_SIGN_IN = false;

export default function Login() {
  const [location, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(location === '/signup');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [institution, setInstitution] = useState('');
  const [trainingLevel, setTrainingLevel] = useState('');
  const [specialtyId, setSpecialtyId] = useState<SpecialtyId>(() => getMarketingSpecialtyId());
  const [openCombobox, setOpenCombobox] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangePasswordLoading, setIsChangePasswordLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitHovered, setIsSubmitHovered] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const marketingSpecialty = useHostSpecialty();
  const { resolvedTheme } = useTheme();
  const panelSpecialtyId = isSignUp ? specialtyId : marketingSpecialty.id;

  const universities = useMemo(() => {
    return getUniversityOptions().map(u => u.value);
  }, []);

  useEffect(() => {
    if (isSignUp) setSpecialtyId(marketingSpecialty.id);
  }, [isSignUp, marketingSpecialty.id]);

  useEffect(() => {
    applySpecialtyToDocument(isSignUp ? specialtyId : marketingSpecialty.id);
  }, [isSignUp, specialtyId, marketingSpecialty.id]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauth = params.get('oauth');
    if (!oauth) return;
    const messages: Record<string, string> = {
      unavailable: 'Google sign-in is not configured on this server.',
      denied: 'Google sign-in was cancelled.',
      unverified: 'Your Google email must be verified before signing in.',
      invalid: 'Google sign-in could not be verified. Please try again.',
      error: 'Google sign-in failed. Please try again.',
    };
    toast.error(messages[oauth] || 'Google sign-in failed. Please try again.');
    params.delete('oauth');
    const next = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`;
    window.history.replaceState({}, '', next);
  }, []);

  useEffect(() => {
    fetch('/api/auth/google/status')
      .then((res) => res.json())
      .then((data) => setGoogleEnabled(Boolean(data?.enabled)))
      .catch(() => setGoogleEnabled(false));
  }, []);

  const filteredUniversities = useMemo(() => {
    if (!searchQuery) return universities;
    return universities.filter(uni =>
      uni.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, universities]);

  const startGoogleSignIn = () => {
    if (!googleEnabled) {
      toast.error('Google sign-in is not configured on this server.');
      return;
    }
    const specialty = encodeURIComponent(panelSpecialtyId);
    window.location.href = `/api/auth/google?specialty=${specialty}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && !trainingLevel) {
      toast.error('Please select your training level.');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const payload = isSignUp
        ? {
            email,
            password,
            confirmPassword,
            firstName,
            lastName,
            institutionalAffiliation: institution,
            trainingLevel,
            specialtyId,
          }
        : { email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data.message || 'Authentication Failed.';
        toast.error(msg.endsWith('.') || msg.endsWith('!') || msg.endsWith('?') ? msg : msg + '.');
        return;
      }

      if (data.passwordNeedsReset) {
        setShowChangePassword(true);
        setNewPassword('');
        setConfirmNewPassword('');
        return;
      }

      localStorage.removeItem('psite-question-responses');
      localStorage.removeItem('psite-highlights');
      localStorage.removeItem('psite-notes');
      window.location.href = '/';
    } catch (error) {
      toast.error('An error occurred, please try again.');
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
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
        const msg = data.message || 'Failed to send password retrieval email.';
        toast.error(msg.endsWith('.') || msg.endsWith('!') || msg.endsWith('?') ? msg : msg + '.');
        return;
      }

      toast.success('If that account exists, you will receive an email with a link to reset your password.');
      setShowForgotPassword(false);
      setForgotPasswordEmail('');
    } catch (error) {
      toast.error('An error occurred, please try again.');
      console.error('Forgot password error:', error);
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    setIsChangePasswordLoading(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword, confirmPassword: confirmNewPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        const msg = data.message || 'Failed to change password.';
        toast.error(msg.endsWith('.') || msg.endsWith('!') || msg.endsWith('?') ? msg : msg + '.');
        return;
      }

      toast.success('Password changed successfully!');
      setShowChangePassword(false);
      setNewPassword('');
      setConfirmNewPassword('');

      localStorage.removeItem('psite-question-responses');
      localStorage.removeItem('psite-highlights');
      localStorage.removeItem('psite-notes');
      window.location.href = '/';
    } catch (error) {
      toast.error('An error occurred, please try again.');
      console.error('Change password error:', error);
    } finally {
      setIsChangePasswordLoading(false);
    }
  };

  const fieldClass =
    'bg-gray-50 border-gray-200 placeholder:text-gray-400 text-gray-800 dark:bg-muted/40 dark:border-border dark:text-foreground dark:placeholder:text-muted-foreground w-full focus-visible:ring-primary';

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-full flex-col bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="glass-nav static w-full flex-shrink-0 rounded-b-2xl sm:sticky sm:top-0 sm:z-50">
        <div className="container mx-auto px-4 pb-2 pt-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-3 rounded-xl px-4 py-1.5">
              <button
                type="button"
                onClick={() => (window.location.href = '/')}
                className="logo-glass flex flex-shrink-0 cursor-pointer items-center justify-center p-1.5 outline-none ring-1 ring-black/5 hover:opacity-90 focus-visible:ring-0 dark:ring-white/10"
                data-testid="button-home"
                aria-label={`${marketingSpecialty.productName} home`}
              >
                <img src={resolvedTheme === 'dark' ? atlasLogoLight : atlasLogo} alt="Atlas Logo" className="h-7 w-7 object-contain sm:h-8 sm:w-8" />
              </button>
              <div className="hidden min-w-0 flex-col sm:flex">
                <button
                  type="button"
                  onClick={() => (window.location.href = '/')}
                  className="gradient-text cursor-pointer truncate text-left text-base font-bold leading-snug tracking-tight outline-none hover:opacity-90 focus-visible:ring-0 sm:text-lg"
                >
                  {marketingSpecialty.productName}
                </button>
                <SpecialtySubheaderDropdown />
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2">
              <ThemeSwitcher />
              <button
                onClick={() => window.location.href = '/'}
                className="hover-elevate rounded-md p-2 hover:bg-primary/10"
                title="Back to home"
                data-testid="button-home-nav"
              >
                <Home className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div ref={scrollContainerRef} className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
          <AuthSplitShell specialtyId={panelSpecialtyId} isSignUp={isSignUp}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="mb-1 text-2xl font-bold text-gray-800 dark:text-foreground md:text-3xl">
                {isSignUp ? 'Create Your Account' : 'Welcome Back'}
              </h1>
              <p className="mb-8 text-gray-500 dark:text-muted-foreground">
                {isSignUp
                  ? 'Start your 7-day free trial of the Atlas Review today.'
                  : 'Sign in to your account.'}
              </p>

              {SHOW_GOOGLE_SIGN_IN && (
                <>
                  <div className="mb-6">
                    <button
                      type="button"
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-700 shadow-sm transition-all duration-300 hover:bg-gray-100 dark:border-border dark:bg-muted/40 dark:text-foreground dark:hover:bg-muted"
                      onClick={startGoogleSignIn}
                      data-testid="button-google-signin"
                    >
                      <GoogleMark className="h-5 w-5" />
                      <span>{isSignUp ? 'Sign Up With Google' : 'Login With Google'}</span>
                    </button>
                  </div>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-border" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-2 text-gray-500 dark:bg-card dark:text-muted-foreground">OR</span>
                    </div>
                  </div>
                </>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {isSignUp && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-gray-700 dark:text-foreground">
                        First Name
                      </label>
                      <Input
                        id="firstName"
                        type="text"
                        autoComplete="given-name"
                        placeholder="First"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={isLoading}
                        required
                        data-testid="input-first-name"
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-gray-700 dark:text-foreground">
                        Last Name
                      </label>
                      <Input
                        id="lastName"
                        type="text"
                        autoComplete="family-name"
                        placeholder="Last"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={isLoading}
                        required
                        data-testid="input-last-name"
                        className={fieldClass}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700 dark:text-foreground">
                    Email <span className="text-primary">*</span>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                    data-testid="input-email"
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700 dark:text-foreground">
                    Password <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={isPasswordVisible ? 'text' : 'password'}
                      autoComplete={isSignUp ? 'new-password' : 'current-password'}
                      placeholder="Enter Your Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      data-testid="input-password"
                      className={cn(fieldClass, 'pr-10')}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-muted-foreground"
                      onClick={() => setIsPasswordVisible((v) => !v)}
                      aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                    >
                      {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {isSignUp && (
                  <>
                    <div>
                      <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700 dark:text-foreground">
                        Confirm Password
                      </label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                        required
                        data-testid="input-confirm-password"
                        className={fieldClass}
                      />
                    </div>

                    <div>
                      <label htmlFor="specialty" className="mb-1 block text-sm font-medium text-gray-700 dark:text-foreground">
                        Specialty
                      </label>
                      <Select
                        value={specialtyId}
                        onValueChange={(value) => {
                          const next = value as SpecialtyId;
                          setSpecialtyId(next);
                          switchMarketingSpecialty(next);
                        }}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="specialty" className={cn('w-full', fieldClass)} data-testid="select-specialty">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {SPECIALTY_LIST.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.specialtyName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Your question bank. You can subscribe to the other one later from your account.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="training-level" className="mb-1 block text-sm font-medium text-gray-700 dark:text-foreground">
                        Training Level
                      </label>
                      <Select
                        value={trainingLevel || undefined}
                        onValueChange={setTrainingLevel}
                        disabled={isLoading}
                        required
                      >
                        <SelectTrigger
                          id="training-level"
                          className={cn('w-full', fieldClass)}
                          data-testid="select-training-level"
                        >
                          <SelectValue placeholder="Select Training Level" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {TRAINING_LEVEL_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-foreground">Institution</label>
                      <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCombobox}
                            className={cn('w-full justify-between', fieldClass)}
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
                              placeholder="Search Institutions..."
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

                    <p className="text-center text-xs leading-relaxed text-muted-foreground">
                      By signing up, you agree to our{' '}
                      <Link href="/terms" className="font-medium text-primary underline-offset-2 hover:underline">
                        Terms
                      </Link>{' '}
                      and our{' '}
                      <Link href="/privacy" className="font-medium text-primary underline-offset-2 hover:underline">
                        Privacy
                      </Link>{' '}
                      policies.
                    </p>
                  </>
                )}

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onHoverStart={() => setIsSubmitHovered(true)}
                  onHoverEnd={() => setIsSubmitHovered(false)}
                  className="pt-2"
                >
                  <Button
                    type="submit"
                    className={cn(
                      'relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-primary to-secondary py-2 text-primary-foreground transition-all duration-300 hover:opacity-95',
                      isSubmitHovered ? 'shadow-lg shadow-primary/30' : '',
                    )}
                    disabled={isLoading}
                    data-testid={isSignUp ? 'button-register' : 'button-login'}
                  >
                    <span className="flex items-center justify-center">
                      {isLoading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
                      {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </span>
                    {isSubmitHovered && (
                      <motion.span
                        initial={{ left: '-100%' }}
                        animate={{ left: '100%' }}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                        className="absolute bottom-0 left-0 top-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        style={{ filter: 'blur(8px)' }}
                      />
                    )}
                  </Button>
                </motion.div>
              </form>

              <div className="mt-6 space-y-3 text-center text-sm">
                <div>
                  <button
                    onClick={() => {
                      const nextSignUp = !isSignUp;
                      setIsSignUp(nextSignUp);
                      setPassword('');
                      setConfirmPassword('');
                      setFirstName('');
                      setLastName('');
                      setInstitution('');
                      setTrainingLevel('');
                      scrollContainerRef.current?.scrollTo({ top: 0 });
                      setLocation(nextSignUp ? '/signup' : '/login');
                    }}
                    className="font-medium text-primary hover:underline"
                    data-testid="button-toggle-auth"
                  >
                    {isSignUp ? 'Sign In Instead' : 'Sign Up Instead'}
                  </button>
                </div>
                {!isSignUp && (
                  <div>
                    <button
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-primary transition-colors hover:text-primary/80"
                      data-testid="button-forgot-password"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </AuthSplitShell>
        </div>

        <footer className="flex-shrink-0 border-t bg-muted/30 py-6">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            {new Date().getFullYear()} Atlas Review © | {getSpecialty(specialtyId).legalEntity}. All
            Rights Reserved.
          </div>
        </footer>
      </div>
      </div>

      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Retrieve Password
            </DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send your password to your inbox.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="forgot-email" className="text-sm font-medium">
                Email Address
              </label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="your@email.com"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                disabled={isForgotPasswordLoading}
                required
                data-testid="input-forgot-password-email"
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForgotPassword(false)}
                disabled={isForgotPasswordLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isForgotPasswordLoading || !forgotPasswordEmail}
                className="flex-1 glow-primary"
                data-testid="button-send-password"
              >
                {isForgotPasswordLoading ? 'Sending...' : 'Send Password'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Set New Password
            </DialogTitle>
            <DialogDescription>
              You're using a temporary password. Please set a new permanent password to continue.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-medium">
                New Password
              </label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password (min 8 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isChangePasswordLoading}
                required
                data-testid="input-new-password"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirm-new-password" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirm-new-password"
                type="password"
                placeholder="Confirm new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                disabled={isChangePasswordLoading}
                required
                data-testid="input-confirm-new-password"
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isChangePasswordLoading || !newPassword || !confirmNewPassword}
                className="flex-1 glow-primary"
                data-testid="button-set-new-password"
              >
                {isChangePasswordLoading ? 'Setting Password...' : 'Set Password'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
