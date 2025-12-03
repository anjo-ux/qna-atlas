import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Send, Loader2, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

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
}

export default function OralBoardSimulator({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
            createdAt: new Date()
          };
          
          setConversations([newConversation]);
          setCurrentConversationId(conversationId);
          
          // Add initial system message
          setMessages([{
            id: '0',
            role: 'assistant',
            content: 'Welcome to the Oral Board Simulator. I\'m your virtual oral exam interviewer. Let\'s discuss plastic surgery concepts. What topic would you like to review today?',
            timestamp: new Date()
          }]);
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
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
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
          createdAt: new Date()
        };
        
        setConversations(prev => [newConversation, ...prev]);
        setCurrentConversationId(conversationId);
        
        setMessages([{
          id: '0',
          role: 'assistant',
          content: 'Welcome to the Oral Board Simulator. I\'m your virtual oral exam interviewer. Let\'s discuss plastic surgery concepts. What topic would you like to review today?',
          timestamp: new Date()
        }]);
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
      <div className="w-64 flex flex-col border-r border-border bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
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
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={onBack}
              data-testid="button-back"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Oral Board Simulator</h1>
              <p className="text-xs text-muted-foreground">
                {conversations.find(c => c.id === currentConversationId)?.title || 'Loading...'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-4 flex flex-col">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
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
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
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
      </div>
    </div>
  );
}
