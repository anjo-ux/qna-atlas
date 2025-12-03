import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Send, Loader2, Plus, Trash2, Menu, X, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  showSetupMenu?: boolean;
}

interface SessionSetup {
  specialty: string;
  level: string;
  mode: string;
  focusAreas: string;
  difficultyCurve: string;
  numCases: number;
  scoring: boolean;
  hinting: string;
}

export default function OralBoardSimulator({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [sessionSetup, setSessionSetup] = useState<SessionSetup>({
    specialty: 'Plastic Surgery',
    level: 'Fellow',
    mode: 'Oral Boards',
    focusAreas: 'All',
    difficultyCurve: 'Adaptive',
    numCases: 6,
    scoring: true,
    hinting: 'Off'
  });

  // Initialize first thread on mount
  useEffect(() => {
    const initializeFirstThread = async () => {
      try {
        const res = await fetch('/api/oral-board/init', { method: 'POST' });
        const data = await res.json();
        if (data.threadId) {
          setThreadId(data.threadId);
          
          // Create first conversation
          const conversationId = Date.now().toString();
          const newConversation: Conversation = {
            id: conversationId,
            title: 'New Conversation',
            createdAt: new Date(),
            showSetupMenu: true
          };
          
          setConversations([newConversation]);
          setCurrentConversationId(conversationId);
          
          // Show setup menu - no messages yet
          setMessages([]);
        }
      } catch (error) {
        console.error('Failed to initialize thread:', error);
      }
    };
    initializeFirstThread();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set sidebar default open state based on screen size
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleStartSession = async () => {
    // Format the setup as a message
    const setupMessage = `Specialty/subspecialty: ${sessionSetup.specialty}
Level: ${sessionSetup.level}
Mode: ${sessionSetup.mode}
Focus areas: ${sessionSetup.focusAreas}
Difficulty curve: ${sessionSetup.difficultyCurve}
Number of cases: ${sessionSetup.numCases}
Scoring: ${sessionSetup.scoring ? 'on' : 'off'}
Hinting: ${sessionSetup.hinting}`;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: setupMessage,
      timestamp: new Date()
    };

    setMessages([userMessage]);
    setIsLoading(true);

    // Hide setup menu
    setConversations(prev =>
      prev.map(conv =>
        conv.id === currentConversationId ? { ...conv, showSetupMenu: false } : conv
      )
    );

    try {
      const res = await fetch('/api/oral-board/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId,
          message: userMessage.content
        })
      });

      const data = await res.json();
      if (data.response) {
        const responseText = typeof data.response === 'string' ? data.response : data.response.value || '';
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseText,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);

        // Update conversation title
        if (currentConversationId) {
          setConversations(prev =>
            prev.map(conv =>
              conv.id === currentConversationId && conv.title === 'New Conversation'
                ? { ...conv, title: sessionSetup.specialty + ' - ' + sessionSetup.mode }
                : conv
            )
          );
        }
      }
    } catch (error) {
      console.error('Failed to start session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !threadId || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/oral-board/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId,
          message: userMessage.content
        })
      });

      const data = await res.json();
      if (data.response) {
        // Extract text from response object (OpenAI Assistants API returns {value, annotations})
        const responseText = typeof data.response === 'string' ? data.response : data.response.value || '';
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseText,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);

        // Update conversation title if it's still "New Conversation"
        if (currentConversationId) {
          setConversations(prev =>
            prev.map(conv =>
              conv.id === currentConversationId && conv.title === 'New Conversation'
                ? { ...conv, title: userMessage.content.substring(0, 50) + '...' }
                : conv
            )
          );
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = async () => {
    try {
      const res = await fetch('/api/oral-board/init', { method: 'POST' });
      const data = await res.json();
      if (data.threadId) {
        setThreadId(data.threadId);
        
        const conversationId = Date.now().toString();
        const newConversation: Conversation = {
          id: conversationId,
          title: 'New Conversation',
          createdAt: new Date(),
          showSetupMenu: true
        };
        
        setConversations(prev => [newConversation, ...prev]);
        setCurrentConversationId(conversationId);
        
        // Reset setup to defaults
        setSessionSetup({
          specialty: 'Plastic Surgery',
          level: 'Fellow',
          mode: 'Oral Boards',
          focusAreas: 'All',
          difficultyCurve: 'Adaptive',
          numCases: 6,
          scoring: true,
          hinting: 'Off'
        });
        
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to create new conversation:', error);
    }
  };

  const handleDeleteConversation = (id: string) => {
    const updatedConversations = conversations.filter(conv => conv.id !== id);
    setConversations(updatedConversations);
    
    if (currentConversationId === id) {
      if (updatedConversations.length > 0) {
        setCurrentConversationId(updatedConversations[0].id);
      } else {
        handleNewConversation();
      }
      setMessages([]);
    }
  };

  return (
    <div className="h-screen w-full flex bg-gradient-to-br from-purple-50 via-lavender-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {/* Left Sidebar - Chat History */}
      <div className={`flex flex-col border-r border-border bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm transition-all duration-300 ${
        isSidebarOpen ? 'w-64' : 'w-0'
      } overflow-hidden lg:w-64 lg:overflow-visible`}>
        {/* Header */}
        <div className="p-4 border-b border-border/50">
          <Button
            onClick={handleNewConversation}
            className="w-full gap-2"
            size="sm"
            variant="outline"
            data-testid="button-new-conversation"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto space-y-1 p-2">
          {conversations.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-4">
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setCurrentConversationId(conv.id)}
                className={`group flex items-center gap-2 p-3 rounded-md cursor-pointer transition-colors ${
                  currentConversationId === conv.id
                    ? 'bg-primary/15 text-primary'
                    : 'hover:bg-accent/50 text-muted-foreground'
                }`}
                data-testid={`conversation-${conv.id}`}
              >
                <span className="flex-1 truncate text-sm">
                  {conv.title}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(conv.id);
                  }}
                  data-testid={`button-delete-${conv.id}`}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden flex-shrink-0"
              data-testid="button-toggle-sidebar"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onBack}
              data-testid="button-back"
              className="flex-shrink-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold truncate">Oral Boards Coach</h1>
              <p className="text-xs text-muted-foreground truncate">
                {conversations.find(c => c.id === currentConversationId)?.title || 'Loading...'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages Container or Setup Menu */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 flex flex-col justify-center">
          {conversations.find(c => c.id === currentConversationId)?.showSetupMenu ? (
            // Setup Menu - Full Width
            <div className="w-full">
              <Card className="p-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
                <h2 className="text-lg font-semibold mb-4">Configure Your Session</h2>
                
                {/* Specialty */}
                <div className="mb-3">
                  <label className="text-xs font-medium mb-1 block">Specialty/Subspecialty</label>
                  <div className="flex gap-1 flex-wrap">
                    {['Plastic Surgery', 'Hand Surgery', 'Burn Surgery'].map(opt => (
                      <Button
                        key={opt}
                        variant={sessionSetup.specialty === opt ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSessionSetup({...sessionSetup, specialty: opt})}
                        className="gap-1 text-xs"
                      >
                        {sessionSetup.specialty === opt && <Check className="h-3 w-3" />}
                        {opt}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Level */}
                <div className="mb-3">
                  <label className="text-xs font-medium mb-1 block">Level</label>
                  <div className="flex gap-1 flex-wrap">
                    {['MS4', 'PGY-1', 'PGY-2', 'Fellow'].map(opt => (
                      <Button
                        key={opt}
                        variant={sessionSetup.level === opt ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSessionSetup({...sessionSetup, level: opt})}
                        className="gap-1 text-xs"
                      >
                        {sessionSetup.level === opt && <Check className="h-3 w-3" />}
                        {opt}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Mode */}
                <div className="mb-3">
                  <label className="text-xs font-medium mb-1 block">Mode</label>
                  <div className="flex gap-1 flex-wrap">
                    {['Oral Boards', 'Written Boards', 'Case Walkthrough'].map(opt => (
                      <Button
                        key={opt}
                        variant={sessionSetup.mode === opt ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSessionSetup({...sessionSetup, mode: opt})}
                        className="gap-1 text-xs"
                      >
                        {sessionSetup.mode === opt && <Check className="h-3 w-3" />}
                        {opt}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Focus Areas */}
                <div className="mb-3">
                  <label className="text-xs font-medium mb-1 block">Focus Areas</label>
                  <div className="flex gap-1 flex-wrap">
                    {['All', 'Procedures', 'Complications', 'Ethics', 'Stats'].map(opt => (
                      <Button
                        key={opt}
                        variant={sessionSetup.focusAreas === opt ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSessionSetup({...sessionSetup, focusAreas: opt})}
                        className="gap-1 text-xs"
                      >
                        {sessionSetup.focusAreas === opt && <Check className="h-3 w-3" />}
                        {opt}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Curve */}
                <div className="mb-3">
                  <label className="text-xs font-medium mb-1 block">Difficulty Curve</label>
                  <div className="flex gap-1 flex-wrap">
                    {['Steady', 'Ramping', 'Adaptive'].map(opt => (
                      <Button
                        key={opt}
                        variant={sessionSetup.difficultyCurve === opt ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSessionSetup({...sessionSetup, difficultyCurve: opt})}
                        className="gap-1 text-xs"
                      >
                        {sessionSetup.difficultyCurve === opt && <Check className="h-3 w-3" />}
                        {opt}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Number of Cases */}
                <div className="mb-3">
                  <label className="text-xs font-medium mb-1 block">Number of Cases</label>
                  <div className="flex gap-1 flex-wrap">
                    {[3, 6, 10, 15].map(num => (
                      <Button
                        key={num}
                        variant={sessionSetup.numCases === num ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSessionSetup({...sessionSetup, numCases: num})}
                        className="gap-1 text-xs"
                      >
                        {sessionSetup.numCases === num && <Check className="h-3 w-3" />}
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Scoring */}
                <div className="mb-3">
                  <label className="text-xs font-medium mb-1 block">Scoring</label>
                  <div className="flex gap-1">
                    <Button
                      variant={sessionSetup.scoring ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSessionSetup({...sessionSetup, scoring: true})}
                      className="gap-1 text-xs"
                    >
                      {sessionSetup.scoring && <Check className="h-3 w-3" />}
                      On
                    </Button>
                    <Button
                      variant={!sessionSetup.scoring ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSessionSetup({...sessionSetup, scoring: false})}
                      className="gap-1 text-xs"
                    >
                      {!sessionSetup.scoring && <Check className="h-3 w-3" />}
                      Off
                    </Button>
                  </div>
                </div>

                {/* Hinting */}
                <div className="mb-4">
                  <label className="text-xs font-medium mb-1 block">Hinting</label>
                  <div className="flex gap-1 flex-wrap">
                    {['Off', 'Minimal', 'Tiered'].map(opt => (
                      <Button
                        key={opt}
                        variant={sessionSetup.hinting === opt ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSessionSetup({...sessionSetup, hinting: opt})}
                        className="gap-1 text-xs"
                      >
                        {sessionSetup.hinting === opt && <Check className="h-3 w-3" />}
                        {opt}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Start Button */}
                <Button
                  onClick={handleStartSession}
                  disabled={isLoading}
                  className="w-full gap-2"
                  size="sm"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Start Session
                </Button>
              </Card>
            </div>
          ) : (
            // Chat Messages
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} space-y-4`}
                  data-testid={`message-${message.role}-${message.id}`}
                >
                  <div
                    className={`max-w-xl px-4 py-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-white/60 dark:bg-slate-800/60 text-foreground rounded-bl-none backdrop-blur-sm border border-white/20 dark:border-slate-700/20'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/60 dark:bg-slate-800/60 text-foreground px-4 py-3 rounded-lg rounded-bl-none backdrop-blur-sm border border-white/20 dark:border-slate-700/20 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Only show when not in setup menu */}
        {!conversations.find(c => c.id === currentConversationId)?.showSetupMenu && (
          <div className="p-6 border-t border-border/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
            <div className="flex gap-2 max-w-4xl mx-auto">
              <Input
                placeholder="Ask about plastic surgery concepts, techniques, or clinical scenarios..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isLoading}
                data-testid="input-message"
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                data-testid="button-send"
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
