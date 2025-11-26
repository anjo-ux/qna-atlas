import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import PreviewMode from "./pages/PreviewMode";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import { BookmarksPage } from "./pages/Bookmarks";
import { SpacedRepetitionPage } from "./pages/SpacedRepetition";

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
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
