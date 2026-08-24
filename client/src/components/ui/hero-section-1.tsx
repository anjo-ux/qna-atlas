import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Eye, Menu, X } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useHostSpecialty } from "@/hooks/useSpecialty";
import { cn } from "@/lib/utils";
import atlasLogo from "@assets/atlas_1764093111680.png";
import atlasLogoLight from "@assets/logo_light_1774918799268.png";

const HERO_APP_DARK =
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2700&q=80";
const HERO_APP_LIGHT =
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=2700&q=80";

const ALL_NAV = [
  { href: "/about", label: "About" },
  { href: "/the-atlas-way", label: "The Atlas Way" },
  { href: "/oral-boards-coach", label: "Oral Boards Coach", prsOnly: true },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
] as const;

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring" as const,
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

function getScrollParent(el: HTMLElement | null): HTMLElement | Window {
  let parent = el?.parentElement ?? null;
  while (parent) {
    const { overflowY } = getComputedStyle(parent);
    if (
      (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") &&
      parent.scrollHeight > parent.clientHeight + 1
    ) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return window;
}

function scrollTopOf(target: HTMLElement | Window) {
  return target instanceof Window ? target.scrollY : target.scrollTop;
}

export type HeroSectionProps = {
  productName: string;
  subtitle: string;
  logoSrc: string;
  logoAlt: string;
  onGetStarted: () => void;
  onPreview: () => void;
  specialtyControl?: ReactNode;
  afterCtas?: ReactNode;
  screenshot?: ReactNode;
};

export function HeroSection({
  productName,
  subtitle,
  logoSrc,
  logoAlt,
  onGetStarted,
  onPreview,
  specialtyControl,
  afterCtas,
  screenshot,
}: HeroSectionProps) {
  return (
    <>
      <HeroHeader />
      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="z-[2] pointer-events-none absolute inset-0 isolate hidden opacity-50 contain-strict lg:block"
        >
          <div className="absolute left-0 top-0 h-[80rem] w-[35rem] -translate-y-[350px] -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
          <div className="absolute left-0 top-0 h-[80rem] w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="absolute left-0 top-0 h-[80rem] w-56 -translate-y-[350px] -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
        </div>
        <section>
          <div className="relative pt-16 md:pt-24">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]"
            />
            <div className="mx-auto w-full min-w-0 max-w-7xl px-4 sm:px-6">
              <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                <AnimatedGroup variants={transitionVariants}>
                  <div className="mb-2 mt-2 flex justify-center">
                    <img
                      src={logoSrc}
                      alt={logoAlt}
                      className="h-16 w-16 object-contain drop-shadow-lg transition-transform duration-500 motion-safe:hover:scale-[1.03] sm:h-20 sm:w-20"
                    />
                  </div>
                  <h1 className="mx-auto mt-3 max-w-4xl text-balance text-4xl font-bold leading-snug gradient-text sm:text-5xl md:mt-4 md:text-6xl">
                    {productName}
                  </h1>
                  {specialtyControl ? (
                    <div className="mt-1.5 flex justify-center">{specialtyControl}</div>
                  ) : null}
                  <p className="mx-auto mt-3 max-w-2xl text-balance text-base text-muted-foreground md:mt-4 md:text-lg">
                    {subtitle}
                  </p>
                </AnimatedGroup>

                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: 0.75,
                        },
                      },
                    },
                    ...transitionVariants,
                  }}
                  className="mt-6 flex flex-col items-center justify-center gap-2 md:flex-row md:items-center"
                >
                  <div className="bg-foreground/10 rounded-[14px] border p-0.5">
                    <Button
                      size="lg"
                      onClick={onGetStarted}
                      data-testid="button-get-started"
                      className="glow-primary h-11 rounded-xl px-5 text-base leading-none transition-glow"
                    >
                      Get Started
                    </Button>
                  </div>
                  <div className="rounded-[14px] border border-transparent p-0.5">
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={onPreview}
                      data-testid="button-preview"
                      className="h-11 rounded-xl px-5 text-base leading-none transition-glow hover:glow-primary"
                    >
                      <Eye className="size-4 shrink-0" />
                      Preview
                    </Button>
                  </div>
                </AnimatedGroup>
              </div>
            </div>

            {afterCtas ? (
              <div className="mx-auto mt-8 w-full min-w-0 max-w-4xl px-4 sm:mt-10 sm:px-6">
                {afterCtas}
              </div>
            ) : null}

            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.75,
                    },
                  },
                },
                ...transitionVariants,
              }}
            >
              <div
                className={cn(
                  "relative mt-8 w-full min-w-0 overflow-x-hidden px-3 sm:mt-10 sm:px-4 md:mt-12 md:px-2",
                  !screenshot && "md:-mr-56",
                )}
              >
                {!screenshot ? (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-transparent from-35% to-background"
                  />
                ) : null}
                {screenshot ? (
                  <div className="relative mx-auto w-full min-w-0 max-w-6xl">{screenshot}</div>
                ) : (
                <div
                  className={cn(
                    "inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border shadow-lg shadow-zinc-950/15 ring-1",
                    "w-full min-w-0 p-4",
                  )}
                >
                    <>
                      <img
                        className="bg-background relative hidden aspect-[15/8] rounded-2xl dark:block"
                        src={HERO_APP_DARK}
                        alt="Study dashboard preview"
                        width="2700"
                        height="1440"
                      />
                      <img
                        className="border-border/25 relative z-[2] aspect-[15/8] rounded-2xl border dark:hidden"
                        src={HERO_APP_LIGHT}
                        alt="Study dashboard preview"
                        width="2700"
                        height="1440"
                      />
                    </>
                </div>
                )}
              </div>
            </AnimatedGroup>
          </div>
        </section>
      </div>
    </>
  );
}

function HeroHeader() {
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { resolvedTheme } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();
  const specialty = useHostSpecialty();
  const nav = ALL_NAV.filter((item) => !("prsOnly" in item && item.prsOnly && specialty.id === "ortho"));

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(scrollTopOf(getScrollParent(anchorRef.current)) > 50);
    };
    onScroll();
    const page = getScrollParent(anchorRef.current);
    page.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => {
      page.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll, { capture: true });
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || toggleRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const bar = (
    <header>
      {menuOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}
      <nav
        data-state={menuOpen ? "active" : undefined}
        className="group fixed inset-x-0 top-0 z-50 w-full px-2"
      >
        <div
          className={cn(
            "relative mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:bg-transparent lg:px-12 lg:backdrop-blur-none",
            "bg-background/90 backdrop-blur-md",
            isScrolled &&
              "max-w-4xl rounded-2xl border px-5 shadow-sm bg-background/95 backdrop-blur-lg lg:bg-background/70",
          )}
        >
          <div
            className={cn(
              "relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4",
              isScrolled && "py-2 lg:py-3",
            )}
          >
            <div className="flex w-full justify-between lg:w-auto">
              <Link href="/" aria-label="home" className="flex items-center space-x-2">
                <img
                  src={resolvedTheme === "dark" ? atlasLogoLight : atlasLogo}
                  alt=""
                  className="h-8 w-8 object-contain"
                />
                <span className="gradient-text text-base font-bold tracking-tight">{specialty.productName}</span>
              </Link>

              <div className="flex items-center gap-2 lg:hidden">
                <ThemeSwitcher />
                <button
                  ref={toggleRef}
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-label={menuOpen ? "Close Menu" : "Open Menu"}
                  className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5"
                >
                  <Menu className="m-auto size-6 duration-200 in-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0" />
                  <X className="absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200 group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100" />
                </button>
              </div>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-foreground block duration-150"
                    >
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div
              ref={panelRef}
              className="bg-background mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 group-data-[state=active]:block md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent lg:group-data-[state=active]:flex"
            >
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {nav.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-foreground block duration-150"
                      >
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:items-center sm:gap-3 sm:space-y-0 md:w-fit">
                {isLoading ? (
                  <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
                ) : isAuthenticated ? (
                  <Button asChild size="sm">
                    <Link href="/">Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className={cn(isScrolled && "lg:hidden")}
                    >
                      <a href="/login">
                        <span>Login</span>
                      </a>
                    </Button>
                    <Button asChild size="sm" className={cn(isScrolled && "lg:hidden")}>
                      <a href="/signup">
                        <span>Sign Up</span>
                      </a>
                    </Button>
                    <Button asChild size="sm" className={cn(isScrolled ? "lg:inline-flex" : "hidden")}>
                      <a href="/signup">
                        <span>Get Started</span>
                      </a>
                    </Button>
                    </>
                  )}
              </div>
            </div>
          </div>
          <div
            className={cn(
              "pointer-events-none absolute right-6 top-full z-50 hidden pt-2 transition-all duration-300 lg:right-12 lg:block",
              isScrolled && "pointer-events-none translate-y-[-4px] opacity-0 lg:hidden",
            )}
            aria-hidden={isScrolled}
          >
            <div className="pointer-events-auto">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );

  return (
    <>
      <div ref={anchorRef} aria-hidden className="pointer-events-none h-0 w-0 overflow-hidden" />
      {typeof document !== "undefined" ? createPortal(bar, document.body) : bar}
    </>
  );
}
