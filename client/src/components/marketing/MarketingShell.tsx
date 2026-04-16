import { type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { SalePromoBanner } from "@/components/SalePromoBanner";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import atlasLogo from "@assets/atlas_1764093111680.png";
import atlasLogoLight from "@assets/logo_light_1774918799268.png";

const NAV = [
  { href: "/about", label: "About Us" },
  { href: "/the-atlas-way", label: "The Atlas Way" },
  { href: "/oral-boards-coach", label: "Oral Boards Coach" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact Us" },
] as const;

const FOOTER_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
] as const;

function handleLogin() {
  window.location.href = "/login";
}

function handleSignUp() {
  window.location.href = "/signup";
}

type MarketingShellProps = {
  children: ReactNode;
  /** When false, hides the sale promo banner (optional for future use). */
  showPromoBanner?: boolean;
};

export function MarketingShell({
  children,
  showPromoBanner = true,
}: MarketingShellProps) {
  const { theme } = useTheme();
  const [pathname] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const path = pathname.replace(/\/$/, "") || "/";

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="static flex w-full flex-shrink-0 flex-col sm:sticky sm:top-0 sm:z-50">
        {showPromoBanner ? <SalePromoBanner claimAction="signup" /> : null}
        <header className="glass-nav w-full flex-shrink-0 rounded-b-2xl border-b border-border/40">
          <div className="container mx-auto px-4 py-2.5 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex min-w-0 items-center justify-between gap-3 sm:justify-start">
                <Link
                  href="/"
                  className="flex min-w-0 items-center gap-3 rounded-xl px-3 py-1.5 transition-opacity hover:opacity-90"
                >
                  <div className="logo-glass flex flex-shrink-0 items-center justify-center p-1.5 ring-1 ring-black/5 dark:ring-white/10">
                    <img
                      src={theme === "dark" ? atlasLogoLight : atlasLogo}
                      alt="Atlas Review, plastic surgery study platform"
                      className="h-7 w-7 object-contain sm:h-8 sm:w-8"
                    />
                  </div>
                  <div className="hidden min-w-0 flex-col sm:flex">
                    <span className="gradient-text truncate text-base font-bold leading-tight tracking-tight sm:text-lg">
                      Atlas
                    </span>
                    <span className="truncate text-xs font-medium tracking-tight text-muted-foreground">
                      Review
                    </span>
                  </div>
                </Link>
                <div className="flex shrink-0 items-center gap-1.5 sm:hidden">
                  {isLoading ? (
                    <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
                  ) : isAuthenticated ? (
                    <Button asChild variant="ghost" size="sm" className="h-9 rounded-full px-3 text-muted-foreground hover:text-foreground">
                      <Link href="/">Dashboard</Link>
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSignUp}
                        className="h-9 rounded-full px-3 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      >
                        Sign Up
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleLogin}
                        className="h-9 rounded-full bg-primary/90 px-4 font-medium shadow-none hover:bg-primary"
                      >
                        Sign In
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <nav
                className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:flex-1 sm:justify-center sm:gap-x-3 sm:gap-y-1 md:gap-x-4"
                aria-label="Marketing"
              >
                {NAV.map(({ href, label }) => {
                  const isActive = path === href || path === `${href}/`;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "relative whitespace-nowrap rounded-md px-2.5 py-1.5 text-[13px] font-normal tracking-wide transition-colors duration-200 sm:px-3 sm:py-2 sm:text-sm",
                        "text-muted-foreground/85 hover:text-foreground/90",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                        isActive &&
                          "font-medium text-foreground after:absolute after:inset-x-2.5 after:bottom-1 after:h-px after:rounded-full after:bg-foreground/35 sm:after:inset-x-3",
                      )}
                    >
                      {label}
                    </Link>
                  );
                })}
              </nav>
              <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
                {isLoading ? (
                  <div className="h-9 w-40 animate-pulse rounded-md bg-muted" />
                ) : isAuthenticated ? (
                  <Button asChild variant="ghost" size="sm" className="h-9 rounded-full px-3 text-muted-foreground hover:text-foreground">
                    <Link href="/">Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignUp}
                      className="h-9 rounded-full px-3.5 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    >
                      Sign Up
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleLogin}
                      className="h-9 rounded-full bg-primary/90 px-4 font-medium shadow-none hover:bg-primary"
                    >
                      Sign In
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain [-webkit-overflow-scrolling:touch]">
        {children}
        <footer className="border-t bg-muted/30 py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-sm text-muted-foreground sm:gap-x-4 md:gap-x-6">
                {FOOTER_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-md px-2 py-1 transition-colors hover:bg-muted/60 hover:text-foreground sm:px-3"
                  >
                    {label}
                  </Link>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Atlas Review © {new Date().getFullYear()} · Empowering Surgical Education
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
