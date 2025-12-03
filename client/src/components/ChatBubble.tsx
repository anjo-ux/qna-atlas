import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle, X, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

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

  // Initialize thread on first open
  useEffect(() => {
    if (isOpen && !threadId) {
      initializeThread();
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeThread = async () => {
    try {
      const res = await fetch('/api/chat-bubble/init', { method: 'POST' });
      const data = await res.json();
      if (data.threadId) {
        setThreadId(data.threadId);
        setMessages([{
          id: '0',
          role: 'assistant',
          content: 'Hello! How can I help you today?',
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

  return (
    <div className="fixed bottom-6 right-6 z-40">
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
        <Card className={`flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-white/20 dark:border-slate-700/20 shadow-xl ${isExpanded ? 'chat-window-expanded w-96 h-screen' : 'chat-window-open w-96 h-96'}`}>
          {/* Header with Close and Expand Buttons */}
          <div className="flex items-center justify-between p-4 border-b border-border/50 bg-primary/10">
            <h3 className="font-semibold text-sm">Assistant</h3>
            <div className="flex gap-1">
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
                size="icon"
                className="h-9 w-9"
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
