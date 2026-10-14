import { createPortal } from "react-dom";
import { ArrowUpRight, X } from "lucide-react";
import { LogoMark } from "@/components/ui/logo-mark";
import { InstagramIcon, LinkedinIcon, TelegramIcon, TwitterIcon } from "@/components/ui/brand-icons";
import { useDialog } from "@/hooks/useDialog";
import { useActiveSection } from "@/hooks/useActiveSection";
import { setOverlay, useOverlay } from "@/lib/overlay-store";
import { NAV, ROLE_LINE, SECTION_IDS, SOCIALS, type Social } from "@/content/site";
import { cn } from "@/lib/utils";

const ICONS: Record<Social, { icon: React.ComponentType<{ className?: string }>; label: string }> = {
  linkedin: { icon: LinkedinIcon, label: "LinkedIn" },
  twitter: { icon: TwitterIcon, label: "X" },
  telegram: { icon: TelegramIcon, label: "Telegram" },
  instagram: { icon: InstagramIcon, label: "Instagram" },
};

/**
 * Glass side menu, sliding in from the right edge.
 *
 * Always mounted, so it can animate out as well as in; while closed it is
 * `inert` and `pointer-events-none` straight away (not at the end of a
 * transition), so a half-faded panel can never swallow clicks.
 */
export function SideMenu() {
  const open = useOverlay() === "menu";
  const close = () => setOverlay(null);
  const panelRef = useDialog<HTMLDivElement>(open, close);
  const active = useActiveSection(SECTION_IDS);

  return createPortal(
    <div className={cn("fixed inset-0 z-[70]", !open && "pointer-events-none")} inert={!open} aria-hidden={!open}>
      {/* Scrim */}
      <div
        onClick={close}
        className={cn(
          "absolute inset-0 bg-black/45 backdrop-blur-[3px] transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={cn(
          "glass-strong absolute top-2 right-2 bottom-2 flex w-[min(88vw,380px)] flex-col rounded-[28px] p-6",
          "transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "translate-x-0 opacity-100" : "translate-x-[110%] opacity-0",
        )}
      >
        <div className="flex items-center justify-between">
          <LogoMark height={24} tone="light" />
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-foreground/80 transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-2 focus-visible:outline-violet"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-8">
          <p className="text-xl font-semibold tracking-tight">Babak Baghaei</p>
          <p className="mt-1 text-sm text-foreground/55">{ROLE_LINE}</p>
        </div>

        <nav aria-label="Sections" className="mt-8">
          <ul className="grid gap-1.5">
            {NAV.map((link, i) => {
              const isActive = link.href === `#${active}`;
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={close}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "group flex min-h-12 items-center gap-4 rounded-2xl px-4 py-3 transition-colors focus-visible:outline-2 focus-visible:outline-violet",
                      isActive ? "bg-violet/12 text-foreground" : "text-foreground/75 hover:bg-white/5 hover:text-foreground",
                    )}
                  >
                    <span className="font-mono text-xs text-violet/80">0{i + 1}</span>
                    <span className="flex-1 text-lg">{link.label}</span>
                    <span
                      aria-hidden
                      className={cn(
                        "h-1.5 w-1.5 rounded-full transition-colors",
                        isActive ? "bg-violet shadow-[0_0_10px_2px_rgba(169,139,255,0.6)]" : "bg-transparent",
                      )}
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto grid gap-5">
          <button
            type="button"
            onClick={() => setOverlay("sheet")}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 font-medium text-white shadow-[0_10px_30px_-10px_rgba(102,51,238,0.8)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
          >
            Let&rsquo;s talk <ArrowUpRight className="h-4 w-4" />
          </button>
          <ul className="flex justify-center gap-2">
            {SOCIALS.map(({ network, href }) => {
              const { icon: Icon, label } = ICONS[network];
              return (
                <li key={network}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-foreground/75 transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-2 focus-visible:outline-violet"
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>,
    document.body,
  );
}
