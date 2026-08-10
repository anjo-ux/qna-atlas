import { useState, useRef, useEffect, useCallback, startTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Send, Loader2, Plus, Trash2, Menu, X, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSpecialty } from '@/hooks/useSpecialty';
import { Card } from '@/components/ui/card';
import {
  OralBoardAssistantContent,
  normalizeCommandHelpHeaders,
  stripStreamingMarkdownDecorators,
} from '@/components/OralBoardMessageContent';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  /** True while assistant tokens are still arriving from the server */
  streaming?: boolean;
}

async function consumeOralBoardChatStream(
  sessionId: string,
  message: string,
  onDelta: (chunk: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch('/api/oral-board/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    credentials: 'include',
    body: JSON.stringify({ sessionId, message, stream: true }),
    signal,
  });

  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = await res.json();
      if (j?.message) msg = j.message;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(msg);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    for (;;) {
      const boundary = buffer.indexOf('\n\n');
      if (boundary === -1) break;
      const block = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const line = block.split('\n').find((l) => l.startsWith('data: '));
      if (!line) continue;
      let payload: { t?: string; done?: boolean; error?: string };
      try {
        payload = JSON.parse(line.slice(6));
      } catch {
        continue;
      }
      if (payload.error) throw new Error(payload.error);
      if (payload.done) return;
      if (payload.t != null && payload.t.length > 0) onDelta(payload.t);
    }
  }
}

interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
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

function OralBoardSidebarPanel({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onAfterInteraction,
}: {
  conversations: Conversation[];
  currentConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void | Promise<void>;
  onDeleteConversation: (id: string) => void;
  onAfterInteraction?: () => void;
}) {
  return (
    <>
      <div className="p-4 border-b border-border/50 shrink-0">
        <Button
          onClick={() => {
            void onNewChat();
            onAfterInteraction?.();
          }}
          className="w-full gap-2"
          size="sm"
          variant="outline"
          data-testid="button-new-conversation"
        >
          <Plus className="h-4 w-4" />
          New Session
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 p-2 min-h-0">
        {conversations.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-4">
            No Sessions Yet
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => {
                onSelectConversation(conv.id);
                onAfterInteraction?.();
              }}
              className={`group flex items-center gap-2 p-3 rounded-md cursor-pointer transition-colors ${
                currentConversationId === conv.id
                  ? 'bg-primary/15 text-primary'
                  : 'hover:bg-accent/50 text-muted-foreground'
              }`}
              data-testid={`conversation-${conv.id}`}
            >
              <span className="flex-1 truncate text-sm">{conv.title}</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conv.id);
                }}
                data-testid={`button-delete-${conv.id}`}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default function OralBoardSimulator({ onBack }: { onBack: () => void }) {
  useAuth();
  const { specialty } = useSpecialty();
  const specialtyOptions = specialty.marketing.oralSpecialtyOptions;
  const defaultSpecialty = specialtyOptions[0] ?? specialty.specialtyName;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [loadingSessionMessages, setLoadingSessionMessages] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /** Coalesce SSE token updates to one React commit per animation frame (avoids main-thread thrash). */
  const streamBufRef = useRef('');
  const streamTargetIdRef = useRef<string | null>(null);
  const streamFlushRafRef = useRef<number | null>(null);

  const flushStreamToState = useCallback(() => {
    streamFlushRafRef.current = null;
    const id = streamTargetIdRef.current;
    if (!id) return;
    const text = streamBufRef.current;
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, content: text } : m))
    );
  }, []);

  const prepareStreamAccumulation = useCallback((assistantId: string) => {
    if (streamFlushRafRef.current != null) {
      cancelAnimationFrame(streamFlushRafRef.current);
      streamFlushRafRef.current = null;
    }
    streamBufRef.current = '';
    streamTargetIdRef.current = assistantId;
  }, []);

  const appendStreamChunk = useCallback(
    (chunk: string) => {
      streamBufRef.current += chunk;
      if (streamFlushRafRef.current != null) return;
      streamFlushRafRef.current = requestAnimationFrame(flushStreamToState);
    },
    [flushStreamToState]
  );

  const cancelPendingStreamFlush = useCallback(() => {
    if (streamFlushRafRef.current != null) {
      cancelAnimationFrame(streamFlushRafRef.current);
      streamFlushRafRef.current = null;
    }
  }, []);

  const [sessionSetup, setSessionSetup] = useState<SessionSetup>({
    specialty: defaultSpecialty,
    level: 'Fellow',
    mode: 'Oral Boards',
    focusAreas: 'All',
    difficultyCurve: 'Adaptive',
    numCases: 6,
    scoring: true,
    hinting: 'Off',
  });

  useEffect(() => {
    setSessionSetup((prev) => ({
      ...prev,
      specialty: specialtyOptions.includes(prev.specialty) ? prev.specialty : defaultSpecialty,
    }));
  }, [defaultSpecialty, specialtyOptions]);

  const fetchSessionsList = useCallback(async (): Promise<Conversation[]> => {
    const res = await fetch('/api/oral-board/sessions', { credentials: 'include' });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.sessions || []).map(
      (s: { id: string; title: string; createdAt: string }) => ({
        id: s.id,
        title: s.title,
        createdAt: new Date(s.createdAt),
      })
    );
  }, []);

  const loadMessagesForSession = useCallback(
    async (sessionId: string, opts?: { silent?: boolean }) => {
      const silent = Boolean(opts?.silent);
      if (!silent) {
        setLoadingSessionMessages(true);
        setMessages([]);
      }
      try {
        const res = await fetch(`/api/oral-board/sessions/${sessionId}/messages`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to load messages');
        const data = await res.json();
        const mapped: Message[] = (data.messages || []).map(
          (m: { id: string; role: string; content: string; createdAt: string }) => ({
            id: m.id,
            role: m.role as 'user' | 'assistant',
            content: m.content,
            timestamp: new Date(m.createdAt),
          })
        );
        setMessages(mapped);
      } catch (error) {
        console.error('Failed to load session messages:', error);
        if (!silent) setMessages([]);
      } finally {
        if (!silent) setLoadingSessionMessages(false);
      }
    },
    []
  );

  const refreshSessions = useCallback(async () => {
    const list = await fetchSessionsList();
    setConversations(list);
    return list;
  }, [fetchSessionsList]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let list = await fetchSessionsList();
        if (cancelled) return;
        if (list.length === 0) {
          const createRes = await fetch('/api/oral-board/sessions', {
            method: 'POST',
            credentials: 'include',
          });
          if (!createRes.ok) throw new Error('Failed to create session');
          if (cancelled) return;
          list = await fetchSessionsList();
        }
        if (cancelled) return;
        setConversations(list);
        const pick = list[0]?.id ?? '';
        setCurrentConversationId(pick);
        if (pick) await loadMessagesForSession(pick);
      } catch (error) {
        console.error('Failed to bootstrap oral board:', error);
      } finally {
        if (!cancelled) setBootLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchSessionsList, loadMessagesForSession]);

  // Auto-scroll: coalesce to one rAF; smooth scroll fights itself if fired on every streamed token.
  const scrollRafRef = useRef<number | null>(null);
  useEffect(() => {
    if (scrollRafRef.current != null) {
      cancelAnimationFrame(scrollRafRef.current);
    }
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      const el = messagesEndRef.current;
      if (!el) return;
      const streaming = messages.some((m) => m.streaming);
      el.scrollIntoView({ behavior: streaming ? 'auto' : 'smooth', block: 'end' });
    });
    return () => {
      if (scrollRafRef.current != null) {
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
    };
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

  const selectConversation = async (id: string) => {
    if (!id || id === currentConversationId) return;
    setCurrentConversationId(id);
    await loadMessagesForSession(id);
  };

  const handleStartSession = async () => {
    if (!currentConversationId) return;
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

    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [
      ...prev,
      {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        streaming: true,
      },
    ]);

    prepareStreamAccumulation(assistantId);

    try {
      await consumeOralBoardChatStream(currentConversationId, userMessage.content, appendStreamChunk);

      cancelPendingStreamFlush();
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: streamBufRef.current, streaming: false }
            : m
        )
      );
      streamBufRef.current = '';
      streamTargetIdRef.current = null;

      void refreshSessions();
      startTransition(() => {
        void loadMessagesForSession(currentConversationId, { silent: true });
      });
    } catch (error) {
      console.error('Failed to start session:', error);
      cancelPendingStreamFlush();
      streamBufRef.current = '';
      streamTargetIdRef.current = null;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  'Sorry — something went wrong loading the session. Please try starting again or send a message.',
                streaming: false,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !currentConversationId || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [
      ...prev,
      {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        streaming: true,
      },
    ]);

    prepareStreamAccumulation(assistantId);

    try {
      await consumeOralBoardChatStream(currentConversationId, userMessage.content, appendStreamChunk);

      cancelPendingStreamFlush();
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: streamBufRef.current, streaming: false }
            : m
        )
      );
      streamBufRef.current = '';
      streamTargetIdRef.current = null;

      void refreshSessions();
      startTransition(() => {
        void loadMessagesForSession(currentConversationId, { silent: true });
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      cancelPendingStreamFlush();
      streamBufRef.current = '';
      streamTargetIdRef.current = null;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  'Sorry — something went wrong. Please try again.',
                streaming: false,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = async () => {
    try {
      const res = await fetch('/api/oral-board/sessions', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to create session');
      const created = await res.json();
      const list = await fetchSessionsList();
      setConversations(list);
      const pick = list.find((c) => c.id === created.id)?.id ?? list[0]?.id;
      if (pick) {
        setCurrentConversationId(pick);
        await loadMessagesForSession(pick);
      }
      setSessionSetup({
        specialty: defaultSpecialty,
        level: 'Fellow',
        mode: 'Oral Boards',
        focusAreas: 'All',
        difficultyCurve: 'Adaptive',
        numCases: 6,
        scoring: true,
        hinting: 'Off',
      });
    } catch (error) {
      console.error('Failed to create new session:', error);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/oral-board/sessions/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) return;
    } catch (error) {
      console.error('Failed to delete session:', error);
      return;
    }

    const list = await fetchSessionsList();
    setConversations(list);

    if (currentConversationId !== id) return;

    if (list.length > 0) {
      const nextId = list[0].id;
      setCurrentConversationId(nextId);
      await loadMessagesForSession(nextId);
    } else {
      const createRes = await fetch('/api/oral-board/sessions', {
        method: 'POST',
        credentials: 'include',
      });
      if (!createRes.ok) {
        setCurrentConversationId('');
        setMessages([]);
        return;
      }
      const created = await createRes.json();
      const list2 = await fetchSessionsList();
      setConversations(list2);
      setCurrentConversationId(created.id);
      await loadMessagesForSession(created.id);
    }
  };

  const showSetupUi =
    !bootLoading &&
    !loadingSessionMessages &&
    messages.length === 0 &&
    Boolean(currentConversationId);

  return (
    <div className="flex h-full min-h-0 w-full bg-gradient-to-br from-purple-50 via-lavender-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {/* Desktop: left sidebar (chat history) */}
      <div className="hidden lg:flex lg:w-64 lg:shrink-0 flex-col border-r border-border bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm overflow-hidden">
        <OralBoardSidebarPanel
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={(id) => {
            void selectConversation(id);
          }}
          onNewChat={handleNewConversation}
          onDeleteConversation={(id) => {
            void handleDeleteConversation(id);
          }}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header — stays above the mobile overlay so back / menu always receive taps */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md gap-3 shrink-0 relative z-10">
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

        <div className="relative flex-1 flex flex-col min-h-0">
          {/* Mobile: overlay only covers content below header (fixed overlay was stealing header taps) */}
          {isSidebarOpen && (
            <div
              className="lg:hidden absolute inset-0 z-20 flex items-start justify-center pt-[max(0.75rem,6svh)] px-4 pb-6 pointer-events-none"
              role="presentation"
            >
              <button
                type="button"
                className="absolute inset-0 bg-black/50 pointer-events-auto"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Close menu"
              />
              <div
                className="relative z-10 flex flex-col w-full max-w-sm max-h-[min(28rem,calc(100svh-5rem))] rounded-xl border border-border bg-white/95 dark:bg-slate-900/95 shadow-xl backdrop-blur-md overflow-hidden pointer-events-auto"
                role="dialog"
                aria-modal="true"
                aria-labelledby="oral-board-sidebar-title"
              >
                <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-border/50 shrink-0 bg-white/80 dark:bg-slate-900/80">
                  <h2 id="oral-board-sidebar-title" className="text-sm font-semibold truncate">
                    Sessions
                  </h2>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="shrink-0"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-label="Close conversations menu"
                    data-testid="button-close-sidebar-overlay"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <OralBoardSidebarPanel
                  conversations={conversations}
                  currentConversationId={currentConversationId}
                  onSelectConversation={(id) => {
                    void selectConversation(id);
                  }}
                  onNewChat={handleNewConversation}
                  onDeleteConversation={(id) => {
                    void handleDeleteConversation(id);
                  }}
                  onAfterInteraction={() => setIsSidebarOpen(false)}
                />
              </div>
            </div>
          )}

          {/* Messages Container or Setup Menu */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-4 flex flex-col justify-center min-h-0">
          {bootLoading || loadingSessionMessages ? (
            <div className="flex flex-1 flex-col items-center justify-center py-16 min-h-[12rem]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-3">
                {bootLoading ? 'Loading sessions…' : 'Loading messages…'}
              </p>
            </div>
          ) : showSetupUi ? (
            // Setup Menu - Full Width
            <div className="w-full">
              <Card className="p-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-white/20 dark:border-slate-700/20">
                <h2 className="text-lg font-semibold mb-4">Configure Your Session</h2>
                
                {/* Specialty */}
                <div className="mb-3">
                  <label className="text-xs font-medium mb-1 block">Specialty/Subspecialty</label>
                  <div className="flex gap-1 flex-wrap">
                    {specialtyOptions.map(opt => (
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
              {messages.map((message, msgIndex) => {
                const assistantIndexBefore = messages
                  .slice(0, msgIndex)
                  .filter((m) => m.role === 'assistant').length;

                return (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} space-y-4`}
                    data-testid={`message-${message.role}-${message.id}`}
                  >
                    <div
                      className={`${
                        message.role === 'user' ? 'max-w-xl' : 'max-w-2xl'
                      } px-4 py-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-white/60 dark:bg-slate-800/60 text-foreground rounded-bl-none backdrop-blur-sm border border-white/20 dark:border-slate-700/20'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <div className="text-sm">
                          {message.streaming ? (
                            message.content.length === 0 ? (
                              <span className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                                Thinking…
                              </span>
                            ) : (
                              <div className="leading-relaxed">
                                <p className="whitespace-pre-wrap text-foreground/90 m-0">
                                  {stripStreamingMarkdownDecorators(
                                    normalizeCommandHelpHeaders(message.content)
                                  )}
                                </p>
                                <span
                                  className="inline-block w-0.5 h-4 ml-0.5 align-text-bottom bg-primary animate-pulse rounded-sm"
                                  aria-hidden
                                />
                              </div>
                            )
                          ) : (
                            <OralBoardAssistantContent
                              content={message.content}
                              variant={assistantIndexBefore === 0 ? 'initial' : 'followUp'}
                            />
                          )}
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      )}
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
              {isLoading && !messages.some((m) => m.streaming) && (
                <div className="flex justify-start">
                  <div className="bg-white/60 dark:bg-slate-800/60 text-foreground px-4 py-3 rounded-lg rounded-bl-none backdrop-blur-sm border border-white/20 dark:border-slate-700/20 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking…</span>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Only show when not in setup menu */}
          {!bootLoading && !loadingSessionMessages && !showSetupUi && (
            <div className="p-6 border-t border-border/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shrink-0">
              <div className="flex gap-2 max-w-4xl mx-auto">
                <Input
                  placeholder="Enter Response"
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
    </div>
  );
}
