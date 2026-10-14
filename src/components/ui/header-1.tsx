import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/ui/logo-mark";
import { usePastHero } from "@/components/ui/use-past-hero";
import { useActiveSection, useScrollFraction } from "@/hooks/useActiveSection";
import { toggleOverlay, useOverlay } from "@/lib/overlay-store";
import { NAV, SECTION_IDS } from "@/content/site";

/**
 * Fixed header that changes with what is behind it.
 *
 * Over the hero (a white page) it is just the mark and the links in ink, no
 * panel - the reference keeps its hero clean. Once the hero has scrolled away
 * the page is near-black, and the header gathers into a floating glass pill:
 * mark, links with the current section lit, a menu button for the side menu,
 * and a hairline along its foot that fills with reading progress
 * (ui-ux-pro-max: scroll storytelling wants a progress indicator).
 *
 * `fixed`, not sticky: a sticky header occupies a row in the flow and pushed
 * the full-height hero down by its own height.
 */
export function Header() {
  const pastHero = usePastHero(72);
  const active = useActiveSection(SECTION_IDS);
  const progress = useScrollFraction();
  const menuOpen = useOverlay() === "menu";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-5">
      <nav
        aria-label="Primary"
        className={cn(
          "pointer-events-auto relative mx-auto flex h-14 items-center justify-between overflow-hidden rounded-full px-2 transition-[max-width,background-color,border-color,box-shadow] duration-500",
          pastHero ? "glass-strong max-w-5xl ps-4" : "max-w-none border border-transparent bg-transparent ps-2",
        )}
      >
        <a
          href="#top"
          aria-label="Back to top"
          className="rounded-full p-2 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-violet"
        >
          <LogoMark height={24} tone={pastHero ? "light" : "ink"} />
        </a>

        <div className="flex items-center gap-1">
          <ul className="hidden items-center gap-0.5 md:flex">
            {NAV.map((link) => {
              const isActive = link.href === `#${active}`;
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "relative inline-flex h-10 items-center rounded-full px-4 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-violet",
                      pastHero
                        ? isActive
                          ? "bg-white/10 text-foreground"
                          : "text-foreground/70 hover:bg-white/5 hover:text-foreground"
                        : "text-[#111] hover:bg-black/5",
                    )}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={() => toggleOverlay("menu")}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className={cn(
              "ms-1 grid h-11 w-11 place-items-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-violet",
              pastHero
                ? "border-white/10 bg-white/5 text-foreground hover:bg-white/10"
                : "border-black/15 text-[#111] hover:bg-black/5",
            )}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Reading progress along the foot of the pill. */}
        <span
          aria-hidden
          className={cn(
            "absolute bottom-0 left-6 right-6 h-px origin-left bg-gradient-to-r from-violet/0 via-violet to-violet transition-opacity duration-500",
            pastHero ? "opacity-100" : "opacity-0",
          )}
          style={{ transform: `scaleX(${progress})` }}
        />
      </nav>
    </header>
  );
}
