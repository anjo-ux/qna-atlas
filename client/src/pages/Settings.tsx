import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, Lock, CreditCard, BookOpen, TrendingUp, Target, Save, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuestionStats } from '@/hooks/useQuestionStats';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo, useState, useEffect } from 'react';
import { getUniversityOptions } from '@/data/universities';
import { toast } from 'sonner';

interface SettingsProps {
  onBack: () => void;
}

export function Settings({ onBack }: SettingsProps) {
  const { user, refetch } = useAuth();
  const { getAllStats } = useQuestionStats();
  const overallStats = getAllStats();
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    institutionalAffiliation: user?.institutionalAffiliation || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        institutionalAffiliation: user.institutionalAffiliation || '',
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/auth/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save');

      toast.success('Profile updated successfully');
      await refetch();
    } catch (error) {
      toast.error('Failed to save profile');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = 
    formData.firstName !== (user?.firstName || '') ||
    formData.lastName !== (user?.lastName || '') ||
    formData.institutionalAffiliation !== (user?.institutionalAffiliation || '');

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
        {/* Left Sidebar - Collapsible */}
        <div className={`${sidebarOpen ? 'w-72' : 'w-0'} border-r border-border flex-shrink-0 bg-background transition-all duration-300 overflow-hidden flex flex-col`}>
          <div className="w-72 h-full overflow-y-auto p-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Current Plan</p>
                  <p className="font-semibold text-foreground mt-1">Free Trial</p>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground font-medium">Status</p>
                  <p className="font-semibold text-green-600 dark:text-green-400 mt-1">Active</p>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground font-medium">Time Remaining</p>
                  <p className="font-semibold text-foreground mt-2">29 days</p>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground font-medium mb-3">Subscription History</p>
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

        {/* Sidebar Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex-shrink-0 rounded-none border-r border-border"
          data-testid="button-toggle-sidebar"
        >
          {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>

        {/* Main Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Profile Section */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Profile Information</h2>
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user?.profileImageUrl} />
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-muted-foreground">Profile Picture</p>
                    <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-foreground">Username</Label>
                    <Input 
                      value={user?.id || ''} 
                      disabled 
                      className="mt-1"
                      readOnly
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
                    <Select value={formData.institutionalAffiliation} onValueChange={(value) => setFormData({ ...formData, institutionalAffiliation: value })}>
                      <SelectTrigger className="mt-1" data-testid="select-university">
                        <SelectValue placeholder="Select a university" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {getUniversityOptions().map(uni => (
                          <SelectItem key={uni.value} value={uni.value} data-testid={`option-${uni.value}`}>
                            {uni.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  {connectionMethods.map(method => (
                    <div key={method.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{method.icon}</span>
                        <div>
                          <p className="font-medium text-foreground">{method.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {method.connected ? 'Connected' : 'Not connected'}
                          </p>
                        </div>
                      </div>
                      {method.connected && (
                        <span className="text-xs px-2 py-1 bg-green-500/20 text-green-700 dark:text-green-400 rounded">
                          Active
                        </span>
                      )}
                    </div>
                  ))}
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
