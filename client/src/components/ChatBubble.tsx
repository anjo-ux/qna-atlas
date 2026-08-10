import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle, X, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useSpecialty } from '@/hooks/useSpecialty';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { specialty, activeSpecialty } = useSpecialty();
  const isOrthoBank = activeSpecialty === "ortho";

  // Initialize thread on first open
  useEffect(() => {
    if (isOrthoBank) return;
    if (isOpen && !threadId) {
      initializeThread();
    }
  }, [isOpen, isOrthoBank]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOrthoBank) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOrthoBank]);

  const initializeThread = async () => {
    try {
      const res = await fetch('/api/chat-bubble/init', { method: 'POST' });
      const data = await res.json();
      if (data.threadId) {
        setThreadId(data.threadId);
        setMessages([{
          id: '0',
          role: 'assistant',
          content: `I can answer any ${specialty.specialtyName.toLowerCase()} questions you may have using only validated sources.`,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Failed to initialize chat bubble:', error);
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
      const res = await fetch('/api/chat-bubble/chat', {
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
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Atlas Agent is PRS-only for now.
  if (isOrthoBank) return null;

  return (
    <div
      className={cn(
        'fixed',
        !isOpen && 'bottom-6 right-6 z-40',
        isOpen && 'z-[100]',
        isOpen &&
          isExpanded &&
          'max-md:inset-0 max-md:flex max-md:flex-col max-md:pb-[env(safe-area-inset-bottom,0px)] md:bottom-6 md:right-6 md:left-auto md:top-auto',
        isOpen &&
          !isExpanded &&
          'max-md:bottom-6 max-md:left-1/2 max-md:right-auto max-md:w-[min(24rem,calc(100vw-1.5rem))] max-md:-translate-x-1/2 md:bottom-6 md:right-6 md:left-auto md:w-auto md:translate-x-0',
      )}
    >
      <style>{`
        @keyframes chatBubbleGrow {
          from {
            opacity: 0;
            transform: scale(0.1);
            transform-origin: bottom right;
          }
          to {
            opacity: 1;
            transform: scale(1);
            transform-origin: bottom right;
          }
        }
        
        @keyframes chatBubbleShrink {
          from {
            opacity: 1;
            transform: scale(1);
            transform-origin: bottom right;
          }
          to {
            opacity: 0;
            transform: scale(0.1);
            transform-origin: bottom right;
          }
        }
        
        @keyframes expandToFull {
          from {
            transform: scale(1);
          }
          to {
            transform: scale(1);
          }
        }
        
        .chat-window-open {
          animation: chatBubbleGrow 0.4s ease-out forwards;
        }
        
        .chat-window-close {
          animation: chatBubbleShrink 0.3s ease-in forwards;
        }
        
        .chat-window-expanded {
          animation: expandToFull 0.4s ease-out forwards;
        }

      `}</style>

      {isOpen ? (
        // Chat Window (Expanded or Normal)
        <Card
          className={cn(
            'flex flex-col overflow-hidden rounded-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-white/20 dark:border-slate-700/20 shadow-xl',
            !isExpanded && 'chat-window-open h-96 w-full md:w-96',
            isExpanded &&
              'chat-window-expanded max-md:h-full max-md:min-h-0 max-md:w-full max-md:flex-1 max-md:rounded-none max-md:border-x-0 max-md:border-t-0 max-md:pt-[env(safe-area-inset-top)] md:h-[calc(100vh-140px)] md:w-96',
          )}
        >
          {/* Header with Close and Expand Buttons */}
          <div className="flex items-start justify-between gap-3 p-4 border-b border-border/50 bg-primary/10">
            <div className="min-w-0 flex-1 pr-1">
              <h3 className="font-semibold text-sm">Atlas Agent</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-snug">
                Trained specifically in plastic and reconstructive surgery. Ask me any questions you may have.
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                data-testid="button-expand-chat-bubble"
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                onClick={() => {
                  setIsOpen(false);
                  setIsExpanded(false);
                }}
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                data-testid="button-close-chat-bubble"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                data-testid={`chat-bubble-message-${message.role}-${message.id}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted text-foreground rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted px-3 py-2 rounded-lg rounded-bl-none flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-xs">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border/50 bg-background/50">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isLoading}
                data-testid="chat-bubble-input"
                className="text-sm"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                data-testid="chat-bubble-send"
                className="h-9 min-w-14 shrink-0 rounded-full px-5"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        // Chat Bubble Button (Closed)
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
          data-testid="button-chat-bubble"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
