"use client";
import React from "react";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/ui/logo-mark";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { usePastHero } from "@/components/ui/use-past-hero";
import { createPortal } from "react-dom";
import { NAV } from "@/content/site";

/**
 * Fixed header, and it flips with what is behind it.
 *
 * Over the hero the backdrop is a light studio wall, so the mark and links run
 * in ink with no panel behind them. Once the hero has scrolled away the page is
 * near-black, so the header picks up its glass panel and everything inverts to
 * white. A single white treatment would have been invisible over the portrait.
 *
 * `fixed` rather than the registry's `sticky`: a sticky header still occupies
 * a row in the flow, which pushed the full-height hero down by its own height
 * and cropped the bottom of the portrait. Fixed takes it out of the flow so the
 * hero really is one screen tall, and the scrolled state behaves identically.
 *
 * The registry version also ships Sign In / Get Started and a wordmark for
 * another brand; all dropped — this is a personal site with three destinations
 * and no product funnel.
 */
export function Header() {
  const [open, setOpen] = React.useState(false);
  const pastHero = usePastHero(72);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 z-50 border-b border-transparent transition-colors duration-300",
        {
          "bg-background/80 supports-[backdrop-filter]:bg-background/50 border-border backdrop-blur-lg":
            pastHero,
        },
      )}
    >
      {/* Full width on purpose — no centred max-width column, so the mark
          and the links sit out at the edges of the frame. */}
      <nav className="flex h-16 w-full items-center justify-between px-5 md:px-8">
        <a
          href="#top"
          aria-label="Back to top"
          className="-ml-2 rounded-md p-2 transition-colors hover:bg-white/10"
        >
          <LogoMark height={26} tone={pastHero ? "light" : "ink"} />
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {NAV.map((link) => (
            <a
              key={link.label}
              className={buttonVariants({
                variant: "ghost",
                className: cn(
                  "transition-colors",
                  pastHero
                    ? "text-foreground hover:bg-accent"
                    : "text-[#111] hover:bg-black/5",
                ),
              })}
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </div>

        <Button
          size="icon"
          variant="outline"
          onClick={() => setOpen(!open)}
          className={cn(
            "bg-transparent md:hidden",
            pastHero ? "text-foreground" : "border-black/20 text-[#111]",
          )}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
        >
          <MenuToggleIcon open={open} className="size-5" duration={300} />
        </Button>
      </nav>

      <MobileMenu open={open} className="flex flex-col gap-2">
        <div className="grid gap-y-2">
          {NAV.map((link) => (
            <a
              key={link.label}
              onClick={() => setOpen(false)}
              className={buttonVariants({
                variant: "ghost",
                className: "justify-start text-base",
              })}
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </div>
      </MobileMenu>
    </header>
  );
}

type MobileMenuProps = React.ComponentProps<"div"> & {
  open: boolean;
};

function MobileMenu({ open, children, className, ...props }: MobileMenuProps) {
  if (!open || typeof window === "undefined") return null;

  return createPortal(
    <div
      id="mobile-menu"
      className={cn(
        "bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur-lg",
        "fixed top-16 right-0 bottom-0 left-0 z-40 flex flex-col overflow-hidden border-y border-border md:hidden",
      )}
    >
      <div
        data-slot={open ? "open" : "closed"}
        className={cn(
          "data-[slot=open]:animate-in data-[slot=open]:zoom-in-97 ease-out",
          "size-full p-5",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
