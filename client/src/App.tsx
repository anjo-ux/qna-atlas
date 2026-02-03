import { Component, type ReactNode } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useContentProtection } from "@/hooks/useContentProtection";
import { ThemeProvider } from "@/hooks/useTheme";
import Index from "./pages/Index";
import PreviewMode from "./pages/PreviewMode";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import { BookmarksPage } from "./pages/Bookmarks";
import { SpacedRepetitionPage } from "./pages/SpacedRepetition";
import OralBoardSimulator from "./pages/OralBoardSimulator";
import AdminGeneratedQuestions from "./pages/AdminGeneratedQuestions";

class AdminPageErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div
          className="w-full p-4 md:p-6 flex flex-col overflow-auto"
          style={{
            background: "var(--background, #fff)",
            color: "var(--foreground, #111)",
            minHeight: "100vh",
            height: "100vh",
          }}
        >
          <div className="max-w-3xl mx-auto flex-1 w-full">
            <h1 className="text-xl font-semibold mb-1">Generated Questions (Drafts)</h1>
            <p className="text-sm text-muted-foreground mb-4">
              Something went wrong loading this page.
            </p>
            <pre className="p-4 rounded bg-muted text-sm overflow-auto">
              {this.state.error.message}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ADMIN_PATH = "/admin/generated-questions";

function isAdminPath(path: string): boolean {
  return (
    path === ADMIN_PATH ||
    path === `${ADMIN_PATH}/` ||
    path.startsWith(`${ADMIN_PATH}/`)
  );
}

function Router() {
  const [location] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  // Use actual URL as source of truth so admin page never disappears from reactive state quirks
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : location;
  const isAdminPage = isAdminPath(pathname) || isAdminPath(location);

  if (!isAdminPage && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Render admin page outside Switch; use a full-height scrollable wrapper so content is never clipped
  if (isAdminPage) {
    return (
      <div className="h-full w-full overflow-auto" style={{ minHeight: "100vh" }}>
        <AdminPageErrorBoundary>
          <AdminGeneratedQuestions />
        </AdminPageErrorBoundary>
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
  return (
    <div className="h-screen w-screen overflow-hidden">
      <Router />
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
