import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, CreditCard, BookOpen, TrendingUp, Target, Save, ChevronRight, ChevronLeft, Check, ChevronsUpDown, Award } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { QuestionBreakdownCharts } from '@/components/QuestionBreakdownCharts';
import { SubscriptionManager } from '@/components/SubscriptionManager';
import { MobileSubscriptionWidget } from '@/components/MobileSubscriptionWidget';
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
import { Smile, Sparkles, Zap, Heart, Rocket, Brain, Flame, Crown, Coffee, Moon, Sun, Star } from 'lucide-react';

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
  const [percentile, setPercentile] = useState<number | null>(null);
  const [percentileLoading, setPercentileLoading] = useState(false);

  // Determine if Emory affiliation grants free access
  const hasEmoryAccess = user?.institutionalAffiliation?.toLowerCase().includes('emory');
  const displaySubscription = subscription || { status: 'none', daysRemaining: 0 };

  const [formData, setFormData] = useState({
    username: user?.username || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    institutionalAffiliation: user?.institutionalAffiliation || '',
    avatarIcon: user?.avatarIcon || 'smile',
  });

  const AVATAR_ICONS = [
    { id: 'smile', name: 'Smile', icon: Smile },
    { id: 'sparkles', name: 'Sparkles', icon: Sparkles },
    { id: 'zap', name: 'Zap', icon: Zap },
    { id: 'heart', name: 'Heart', icon: Heart },
    { id: 'rocket', name: 'Rocket', icon: Rocket },
    { id: 'brain', name: 'Brain', icon: Brain },
    { id: 'flame', name: 'Flame', icon: Flame },
    { id: 'crown', name: 'Crown', icon: Crown },
    { id: 'coffee', name: 'Coffee', icon: Coffee },
    { id: 'moon', name: 'Moon', icon: Moon },
    { id: 'sun', name: 'Sun', icon: Sun },
    { id: 'star', name: 'Star', icon: Star },
  ];

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
        avatarIcon: user.avatarIcon || 'smile',
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


  const getAvatarIcon = (iconId: string) => {
    const avatar = AVATAR_ICONS.find(a => a.id === iconId);
    return avatar ? avatar.icon : Smile;
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
          avatarIcon: formData.avatarIcon,
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

  useEffect(() => {
    const fetchPercentile = async () => {
      if (!user) return;
      setPercentileLoading(true);
      try {
        const res = await fetch('/api/user/percentile');
        if (res.ok) {
          const data = await res.json();
          setPercentile(data.percentile);
        }
      } catch (error) {
        console.error('Error fetching percentile:', error);
      } finally {
        setPercentileLoading(false);
      }
    };
    fetchPercentile();
  }, [user]);

  const hasChanges = 
    formData.username !== (user?.username || '') ||
    formData.firstName !== (user?.firstName || '') ||
    formData.lastName !== (user?.lastName || '') ||
    formData.institutionalAffiliation !== (user?.institutionalAffiliation || '') ||
    formData.avatarIcon !== (user?.avatarIcon || 'smile');

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
          <div className="w-72 border-r border-border flex-shrink-0 overflow-hidden flex flex-col transition-all duration-300">
            <div className="w-full h-full overflow-y-auto p-6">
              {hasEmoryAccess ? (
                <Card className="p-6 bg-green-500/5 border-green-500/20">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Subscription
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Status</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">Institutional Access</p>
                    </div>
                    <p className="text-sm text-foreground">Your Emory University affiliation grants unlimited access to all features.</p>
                  </div>
                </Card>
              ) : (
                <SubscriptionManager />
              )}
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
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-3">Avatar Icon</p>
                  <div className="grid grid-cols-6 gap-2">
                    {AVATAR_ICONS.map((avatar) => {
                      const IconComponent = avatar.icon;
                      const isSelected = formData.avatarIcon === avatar.id;
                      return (
                        <Button
                          key={avatar.id}
                          variant={isSelected ? 'default' : 'outline'}
                          size="icon"
                          onClick={() => setFormData({ ...formData, avatarIcon: avatar.id })}
                          title={avatar.name}
                          data-testid={`button-avatar-${avatar.id}`}
                          className="h-12 w-12 hover:text-white"
                        >
                          <IconComponent className="h-6 w-6" />
                        </Button>
                      );
                    })}
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

              {/* Question Breakdown Charts */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Question Analytics
                </h2>
                <QuestionBreakdownCharts />
              </div>

              {/* Percentile Rank Section */}
              <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-500" />
                  Percentile Rank
                </h2>
                {percentileLoading ? (
                  <div className="text-sm text-muted-foreground">Loading rank...</div>
                ) : percentile !== null ? (
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center">
                      <div className="text-5xl font-bold text-purple-500">{percentile}</div>
                      <p className="text-xs text-muted-foreground mt-1">Percentile</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">
                        You're in the <span className="font-semibold text-purple-500">{percentile}th percentile</span> among all users based on your accuracy percentage.
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        100th percentile is the highest score. Your accuracy: {stats.accuracy}%
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Not enough data yet. Answer more questions to see your rank.</div>
                )}
              </Card>

              {/* Mobile Subscription Section */}
              <MobileSubscriptionWidget hasEmoryAccess={hasEmoryAccess} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
