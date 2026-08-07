import { type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SalePromoBanner } from "@/components/SalePromoBanner";
import { SpecialtySubheaderDropdown } from "@/components/SpecialtySubheaderDropdown";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useHostSpecialty } from "@/hooks/useSpecialty";
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
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
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
  showPromoBanner = false,
}: MarketingShellProps) {
  const { theme } = useTheme();
  const [pathname] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  /** Marketing surfaces follow the domain, not the logged-in q-bank. */
  const specialty = useHostSpecialty();
  const path = pathname.replace(/\/$/, "") || "/";

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col",
        "h-full",
        /* Mobile and small tablet: one scroll column so promo + nav scroll away and free vertical space */
        "max-lg:overflow-y-auto max-lg:overflow-x-hidden max-lg:[-webkit-overflow-scrolling:touch]",
        /* Large screens: nav stays at top while only main column scrolls */
        "lg:h-full lg:overflow-hidden",
      )}
    >
      <div
        className={cn(
          "flex w-full flex-shrink-0 flex-col",
          "max-lg:static max-lg:z-auto",
          "lg:sticky lg:top-0 lg:z-50",
        )}
      >
        {showPromoBanner ? <SalePromoBanner claimAction="signup" /> : null}
        <header className="glass-nav w-full flex-shrink-0 rounded-b-2xl border-b border-border/40">
          <div className="container mx-auto px-4 py-2.5 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex min-w-0 items-center justify-between gap-3 sm:justify-start">
                <div className="flex min-w-0 items-center gap-3 rounded-xl px-3 py-1.5">
                  <Link
                    href="/"
                    className="logo-glass flex flex-shrink-0 items-center justify-center p-1.5 ring-1 ring-black/5 dark:ring-white/10 transition-opacity hover:opacity-90"
                    aria-label={`${specialty.productName} home`}
                  >
                    <img
                      src={theme === "dark" ? atlasLogoLight : atlasLogo}
                      alt={`Atlas Review, ${specialty.specialtyName.toLowerCase()} study platform`}
                      className="h-7 w-7 object-contain sm:h-8 sm:w-8"
                    />
                  </Link>
                  <div className="hidden min-w-0 flex-col sm:flex">
                    <Link
                      href="/"
                      className="gradient-text truncate text-base font-bold leading-tight tracking-tight transition-opacity hover:opacity-90 sm:text-lg"
                    >
                      {specialty.productName}
                    </Link>
                    <SpecialtySubheaderDropdown />
                  </div>
                </div>
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
      <div
        className={cn(
          "min-h-0 flex-1 overflow-x-hidden",
          "max-lg:flex-none max-lg:overflow-y-visible",
          "lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-y-contain lg:[-webkit-overflow-scrolling:touch]",
        )}
      >
        {children}
        <footer className="border-t bg-muted/30 py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-4 text-center md:flex-row md:items-center md:justify-between md:gap-6 md:text-left">
              <nav
                className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-sm text-muted-foreground md:flex-nowrap md:justify-start md:gap-x-4 lg:gap-x-6"
                aria-label="Footer"
              >
                {FOOTER_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="whitespace-nowrap rounded-md px-2 py-1 transition-colors hover:bg-muted/60 hover:text-foreground md:px-3"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
              <div className="flex shrink-0 justify-center">
                <a
                  href={specialty.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Atlas Review on Instagram"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Instagram className="h-5 w-5" aria-hidden />
                </a>
              </div>
              <p className="text-sm text-muted-foreground md:text-right">
                {new Date().getFullYear()} Atlas Review © | {specialty.legalEntity}. All Rights
                Reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
