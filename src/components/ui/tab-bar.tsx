import { Award, BriefcaseBusiness, House, MessageSquareText, UserRound } from "lucide-react";
import { useActiveSection } from "@/hooks/useActiveSection";
import { toggleOverlay, useOverlay } from "@/lib/overlay-store";
import { SECTION_IDS } from "@/content/site";
import { cn } from "@/lib/utils";

type Tab = { id: string; label: string; icon: React.ComponentType<{ className?: string }> };

const LEFT: Tab[] = [
  { id: "top", label: "Home", icon: House },
  { id: "about", label: "About", icon: UserRound },
];
const RIGHT: Tab[] = [
  { id: "experience", label: "Career", icon: BriefcaseBusiness },
  { id: "credentials", label: "Certs", icon: Award },
];

function TabLink({ tab, active }: { tab: Tab; active: boolean }) {
  const Icon = tab.icon;
  return (
    <a
      href={`#${tab.id}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex min-h-12 flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-[0.66rem] font-medium tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-violet",
        active ? "text-foreground" : "text-foreground/50 active:text-foreground/80",
      )}
    >
      <Icon className={cn("h-5 w-5 transition-transform duration-300", active && "-translate-y-0.5 text-violet")} />
      {tab.label}
      <span
        aria-hidden
        className={cn(
          "absolute bottom-1 h-1 w-1 rounded-full bg-violet transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
      />
    </a>
  );
}

/**
 * Mobile tab bar: four sections and, raised in the middle, the contact FAB
 * that opens the quick sheet. Glass, floating clear of the screen edges and
 * the home indicator (safe-area inset). Four destinations plus one action
 * keeps within the five-item limit for bottom navigation.
 *
 * Hidden from `md` up, where the header carries the links and the FAB floats
 * on its own. The page reserves room for it (`.has-tab-bar` padding in
 * index.css) so it never sits over the last of the content.
 */
export function TabBar() {
  const active = useActiveSection(SECTION_IDS);
  const sheetOpen = useOverlay() === "sheet";

  return (
    <nav
      aria-label="Sections"
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[60] md:hidden"
    >
      <div className="glass-strong relative flex items-center rounded-[26px] px-2 py-1.5">
        {LEFT.map((t) => (
          <TabLink key={t.id} tab={t} active={active === t.id} />
        ))}

        <div className="flex w-[4.5rem] shrink-0 justify-center">
          <button
            type="button"
            onClick={() => toggleOverlay("sheet")}
            aria-label="Let's talk"
            aria-expanded={sheetOpen}
            className={cn(
              "-mt-9 grid h-[3.75rem] w-[3.75rem] place-items-center rounded-full bg-gradient-to-br from-[#8b6bff] to-primary text-white ring-[6px] ring-background/80",
              "shadow-[0_14px_34px_-10px_rgba(102,51,238,0.95)] transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet",
            )}
          >
            <MessageSquareText className="h-6 w-6" />
          </button>
        </div>

        {RIGHT.map((t) => (
          <TabLink key={t.id} tab={t} active={active === t.id} />
        ))}
      </div>
    </nav>
  );
}
