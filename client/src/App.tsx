import { Component, useEffect, type ReactNode } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useContentProtection } from "@/hooks/useContentProtection";
import { ThemeProvider } from "@/hooks/useTheme";
import { SpecialtyProvider, useSpecialty, useHostSpecialty } from "@/hooks/useSpecialty";
import Index from "./pages/Index";
import PreviewMode from "./pages/PreviewMode";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import AboutUs from "./pages/AboutUs";
import AtlasWay from "./pages/AtlasWay";
import ContactPage from "./pages/ContactPage";
import PricingPage from "./pages/PricingPage";
import OralBoardsCoachPage from "./pages/OralBoardsCoachPage";
import TermsOfUsePage from "./pages/TermsOfUsePage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import { BookmarksPage } from "./pages/Bookmarks";
import { SpacedRepetitionPage } from "./pages/SpacedRepetition";
import OralBoardSimulator from "./pages/OralBoardSimulator";
import SubscriptionPage from "./pages/SubscriptionPage";
// Hidden by default: set VITE_ENABLE_ADMIN_GENERATED_QUESTIONS_UI=true to show /admin/generated-questions
const ENABLE_ADMIN_GENERATED_QUESTIONS_UI =
  import.meta.env.VITE_ENABLE_ADMIN_GENERATED_QUESTIONS_UI === "true";

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

function normalizeAppPath(p: string): string {
  if (p.length > 1 && p.endsWith("/")) return p.slice(0, -1);
  return p || "/";
}

/** Marketing Oral Boards Coach is PRS-only; Ortho host redirects home. */
function OralBoardsCoachMarketingRoute() {
  const specialty = useHostSpecialty();
  const [, setLocation] = useLocation();
  useEffect(() => {
    if (specialty.id === "ortho") setLocation("/");
  }, [specialty.id, setLocation]);
  if (specialty.id === "ortho") return null;
  return <OralBoardsCoachPage />;
}

/** In-app Oral Boards simulator is PRS-only while Ortho bank is active. */
function OralBoardSimulatorRoute() {
  const { activeSpecialty } = useSpecialty();
  const [, setLocation] = useLocation();
  useEffect(() => {
    if (activeSpecialty === "ortho") setLocation("/");
  }, [activeSpecialty, setLocation]);
  if (activeSpecialty === "ortho") return null;
  return <OralBoardSimulator onBack={() => setLocation("/")} />;
}

/** Public routes that should render immediately (no auth-loading spinner) for SEO and UX. */
function isPublicPathWithoutAuthGate(p: string): boolean {
  const n = normalizeAppPath(p);
  return (
    n === "/login" ||
    n === "/signup" ||
    n === "/reset-password" ||
    n === "/about" ||
    n === "/the-atlas-way" ||
    n === "/contact" ||
    n === "/pricing" ||
    n === "/oral-boards-coach" ||
    n === "/preview" ||
    n === "/terms" ||
    n === "/privacy"
  );
}

function Router() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  // Use actual URL as source of truth so admin page never disappears from reactive state quirks (only when feature enabled)
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : location;
  const isAdminPage =
    ENABLE_ADMIN_GENERATED_QUESTIONS_UI &&
    (isAdminPath(pathname) || isAdminPath(location));

  const publicWhileAuthLoading = isPublicPathWithoutAuthGate(pathname);

  if (!isAdminPage && isLoading && !publicWhileAuthLoading) {
    return (
      <div className="flex h-full w-full min-h-0 items-center justify-center">
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
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/about" component={AboutUs} />
      <Route path="/the-atlas-way" component={AtlasWay} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/oral-boards-coach" component={OralBoardsCoachMarketingRoute} />
      <Route path="/terms" component={TermsOfUsePage} />
      <Route path="/privacy" component={PrivacyPolicyPage} />
      {!isAuthenticated ? (
        <Route component={Landing} />
      ) : (
        <>
          <Route path="/subscribe">{() => <SubscriptionPage />}</Route>
          <Route path="/" component={Index} />
          <Route path="/bookmarks">
            {() => <BookmarksPage onBack={() => setLocation('/')} />}
          </Route>
          <Route path="/spaced-repetition">
            {() => <SpacedRepetitionPage onBack={() => setLocation('/')} />}
          </Route>
          <Route path="/oral-board" component={OralBoardSimulatorRoute} />
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
}

function AppContent() {
  return (
    <div className="h-full min-h-0 w-full overflow-hidden">
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
        <SpecialtyProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppContent />
          </TooltipProvider>
        </SpecialtyProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
