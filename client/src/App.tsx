import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useContentProtection } from "@/hooks/useContentProtection";
import { ThemeProvider } from "@/hooks/useTheme";
import { ChatBubble } from "@/components/ChatBubble";
import Index from "./pages/Index";
import PreviewMode from "./pages/PreviewMode";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import { BookmarksPage } from "./pages/Bookmarks";
import { SpacedRepetitionPage } from "./pages/SpacedRepetition";
import OralBoardSimulator from "./pages/OralBoardSimulator";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/preview" component={PreviewMode} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Login} />
      {!isAuthenticated ? (
        <Route component={Landing} />
      ) : (
        <>
          <Route path="/" component={Index} />
          <Route path="/bookmarks">
            {() => <BookmarksPage onBack={() => window.history.back()} />}
          </Route>
          <Route path="/spaced-repetition">
            {() => <SpacedRepetitionPage onBack={() => window.history.back()} />}
          </Route>
          <Route path="/oral-board">
            {() => <OralBoardSimulator onBack={() => window.history.back()} />}
          </Route>
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  // Hide chat bubble on preview mode and oral boards coach
  const shouldHideChatBubble = location === '/preview' || location === '/oral-board';

  return (
    <div className="h-screen w-screen overflow-hidden">
      <Router />
      {!shouldHideChatBubble && <ChatBubble />}
    </div>
  );
}

export default function App() {
  // Enable content protection (prevents copy-paste and screenshots)
  useContentProtection();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
