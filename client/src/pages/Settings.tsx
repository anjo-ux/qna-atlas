import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, Lock, CreditCard, BookOpen, TrendingUp, Target, Save, ChevronRight, ChevronLeft, Check, ChevronsUpDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuestionStats } from '@/hooks/useQuestionStats';
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
import { useMemo, useState, useEffect, useRef } from 'react';
import { getUniversityOptions } from '@/data/universities';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { queryClient } from '@/lib/queryClient';
import { Upload } from 'lucide-react';

interface SettingsProps {
  onBack: () => void;
  subscription?: any;
}

export function Settings({ onBack, subscription }: SettingsProps) {
  const { user } = useAuth();
  const { getAllStats } = useQuestionStats();
  const overallStats = getAllStats();
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine if Emory affiliation grants free access
  const hasEmoryAccess = user?.institutionalAffiliation?.toLowerCase().includes('emory');
  const displaySubscription = subscription || { status: 'none', daysRemaining: 0 };

  const [formData, setFormData] = useState({
    username: user?.username || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    institutionalAffiliation: user?.institutionalAffiliation || '',
    profileImageUrl: user?.profileImageUrl || '',
  });

  const universities = useMemo(() => {
    return getUniversityOptions().map(u => u.value);
  }, []);

  const filteredUniversities = useMemo(() => {
    if (!searchQuery) return universities;
    return universities.filter(uni => 
      uni.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, universities]);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        institutionalAffiliation: user.institutionalAffiliation || '',
        profileImageUrl: user.profileImageUrl || '',
      });
    }
  }, [user]);

  const stats = useMemo(() => {
    const total = overallStats.total;
    const correct = overallStats.correct;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { total, correct, accuracy };
  }, [overallStats]);

  const getInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  const connectionMethods = [
    { name: 'Gmail', connected: true, icon: '📧' },
    { name: 'Apple', connected: false, icon: '🍎' },
    { name: 'Microsoft', connected: false, icon: '💻' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profileImageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/auth/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          firstName: formData.firstName,
          lastName: formData.lastName,
          institutionalAffiliation: formData.institutionalAffiliation,
          profileImageUrl: formData.profileImageUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save');
      }

      toast.success('Profile updated successfully');
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save profile');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const [connectedProviders, setConnectedProviders] = useState<string[]>([]);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const res = await fetch('/api/auth/connections');
        const providers = await res.json();
        setConnectedProviders(providers);
      } catch (error) {
        console.error('Error fetching connections:', error);
      }
    };
    fetchConnections();

    // Check for connection_added in URL params
    const params = new URLSearchParams(window.location.search);
    const addedProvider = params.get('connection_added');
    if (addedProvider) {
      toast.success(`${addedProvider} connection added successfully`);
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Refresh connections
      fetchConnections();
    }
  }, [toast]);

  const hasChanges = 
    formData.username !== (user?.username || '') ||
    formData.firstName !== (user?.firstName || '') ||
    formData.lastName !== (user?.lastName || '') ||
    formData.institutionalAffiliation !== (user?.institutionalAffiliation || '') ||
    formData.profileImageUrl !== (user?.profileImageUrl || '');

  const handleAddConnection = (provider: string) => {
    window.location.href = `/api/login?provider=${provider}&action=connect`;
  };

  const handleRemoveConnection = async (provider: string) => {
    try {
      const res = await fetch(`/api/auth/connections/${provider}`, { method: 'DELETE' });
      if (res.ok) {
        setConnectedProviders(connectedProviders.filter(p => p !== provider));
        toast.success(`${provider} connection removed`);
      } else {
        const error = await res.json();
        toast.error(error.message || `Failed to remove ${provider} connection`);
      }
    } catch (error) {
      toast.error(`Failed to remove ${provider} connection`);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex-shrink-0 rounded-none border-r border-border h-full"
          data-testid="button-toggle-sidebar"
        >
          {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>

        {/* Left Sidebar - Collapsible */}
        {sidebarOpen && (
          <div className="w-72 border-r border-border flex-shrink-0 bg-background overflow-hidden flex flex-col transition-all duration-300">
            <div className="w-full h-full overflow-y-auto p-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Subscription
                </h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Current Plan</p>
                    <p className="font-semibold text-foreground mt-1">
                      {hasEmoryAccess ? 'Institutional Affiliation' : (displaySubscription.status === 'trial' ? 'Free Trial' : displaySubscription.status === 'active' ? 'Premium' : 'Expired')}
                    </p>
                  </div>

                  <div className="border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground font-medium">Status</p>
                    <p className={`font-semibold mt-1 ${hasEmoryAccess ? 'text-green-600 dark:text-green-400' : displaySubscription.status === 'expired' ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`}>
                      {hasEmoryAccess ? 'Unlimited Access' : (displaySubscription.status === 'expired' ? 'Expired' : 'Active')}
                    </p>
                  </div>

                  {!hasEmoryAccess && displaySubscription.status !== 'active' && (
                    <div className="border-t border-border pt-4">
                      <p className="text-xs text-muted-foreground font-medium">Time Remaining</p>
                      <p className="font-semibold text-foreground mt-2">{displaySubscription.daysRemaining} days</p>
                    </div>
                  )}

                  {displaySubscription.trialEndsAt && !hasEmoryAccess && (
                    <div className="border-t border-border pt-4">
                      <p className="text-sm text-muted-foreground font-medium mb-3">Trial Info</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-foreground">Trial Ends</span>
                          <span className="text-muted-foreground">{new Date(displaySubscription.trialEndsAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {hasEmoryAccess && (
                    <div className="border-t border-border pt-4 bg-green-500/5 -m-6 mt-4 p-6 rounded">
                      <p className="text-xs font-medium text-green-600 dark:text-green-400">Special Access</p>
                      <p className="text-sm text-foreground mt-2">Your Emory University affiliation grants unlimited access to all features.</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Main Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Profile Section */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Profile Information</h2>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={formData.profileImageUrl || user?.profileImageUrl} />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="h-5 w-5 text-white" />
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      data-testid="input-profile-image"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Profile Picture</p>
                    <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-foreground">Username</Label>
                    <Input 
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="mt-1"
                      placeholder="Enter username"
                      data-testid="input-username"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-foreground">First Name</Label>
                      <Input 
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="mt-1"
                        placeholder="Enter first name"
                        data-testid="input-first-name"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-foreground">Last Name</Label>
                      <Input 
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="mt-1"
                        placeholder="Enter last name"
                        data-testid="input-last-name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-foreground">Institutional Affiliation</Label>
                    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openCombobox}
                          className="mt-1 w-full justify-between"
                          data-testid="select-university"
                        >
                          {formData.institutionalAffiliation || "Select a university..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command shouldFilter={false}>
                          <CommandInput 
                            placeholder="Search universities..." 
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                            data-testid="input-university-search"
                          />
                          <CommandEmpty>No university found.</CommandEmpty>
                          <CommandList>
                            <CommandGroup>
                              {filteredUniversities.map((uni) => (
                                <CommandItem
                                  key={uni}
                                  value={uni}
                                  onSelect={(currentValue) => {
                                    setFormData({ ...formData, institutionalAffiliation: currentValue });
                                    setOpenCombobox(false);
                                    setSearchQuery('');
                                  }}
                                  data-testid={`option-${uni}`}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.institutionalAffiliation === uni ? "opacity-100" : "opacity-0"
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

                  {hasChanges && (
                    <Button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full gap-2"
                      data-testid="button-save-profile"
                    >
                      <Save className="h-4 w-4" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  )}
                </div>
              </Card>

              {/* Statistics Section */}
              <Card className="p-6 bg-gradient-to-br from-chart-1/10 to-chart-2/10 border-chart-1/20">
                <h2 className="text-lg font-semibold text-foreground mb-4">Learning Statistics</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center p-4 bg-white dark:bg-slate-950 rounded-lg border border-border/50">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-chart-1/20 mb-2">
                      <BookOpen className="h-5 w-5 text-chart-1" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                    <p className="text-xs text-muted-foreground text-center mt-1">Questions Answered</p>
                  </div>

                  <div className="flex flex-col items-center p-4 bg-white dark:bg-slate-950 rounded-lg border border-border/50">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-success/20 mb-2">
                      <TrendingUp className="h-5 w-5 text-success" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stats.correct}</p>
                    <p className="text-xs text-muted-foreground text-center mt-1">Correct Answers</p>
                  </div>

                  <div className="flex flex-col items-center p-4 bg-white dark:bg-slate-950 rounded-lg border border-border/50">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-chart-3/20 mb-2">
                      <Target className="h-5 w-5 text-chart-3" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stats.accuracy}%</p>
                    <p className="text-xs text-muted-foreground text-center mt-1">Accuracy</p>
                  </div>
                </div>
              </Card>

              {/* Account Section */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Account
                </h2>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-foreground">Email Address</Label>
                    <Input 
                      value={user?.email || ''} 
                      disabled 
                      className="mt-1"
                      readOnly
                    />
                  </div>
                </div>
              </Card>

              {/* Connections Section */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Login Connections
                </h2>

                <div className="space-y-3">
                  {connectionMethods.map(method => {
                    const providerKey = method.name.toLowerCase();
                    const isConnected = connectedProviders.includes(providerKey);
                    const canDisconnect = connectedProviders.length > 1;
                    
                    return (
                      <div key={method.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{method.icon}</span>
                          <div>
                            <p className="font-medium text-foreground">{method.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {isConnected ? 'Connected' : 'Not connected'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isConnected ? (
                            <>
                              <span className="text-xs px-2 py-1 bg-green-500/20 text-green-700 dark:text-green-400 rounded">
                                Active
                              </span>
                              {canDisconnect && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveConnection(providerKey)}
                                  className="text-destructive hover:text-destructive"
                                  data-testid={`button-disconnect-${providerKey}`}
                                >
                                  Disconnect
                                </Button>
                              )}
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddConnection(providerKey)}
                              data-testid={`button-connect-${providerKey}`}
                            >
                              Connect
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Mobile Subscription Section */}
              <Card className="p-6 lg:hidden bg-gradient-to-br from-chart-1/10 to-chart-2/10 border-chart-1/20">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Subscription
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Current Plan</p>
                      <p className="font-semibold text-foreground mt-1">Free Trial</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Status</p>
                      <p className="font-semibold text-green-600 dark:text-green-400 mt-1">Active</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Time Remaining</p>
                    <p className="font-semibold text-foreground mt-1">29 days</p>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-3 border border-border">
                    <p className="text-sm text-muted-foreground mb-2">Subscription History</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-foreground">Free Trial Started</span>
                        <span className="text-muted-foreground">Nov 25, 2024</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-foreground">Trial Ends</span>
                        <span className="text-muted-foreground">Dec 25, 2024</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
