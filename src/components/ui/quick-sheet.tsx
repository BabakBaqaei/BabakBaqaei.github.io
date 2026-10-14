import { createPortal } from "react-dom";
import { ArrowUpRight, MessageSquareText, Send, X } from "lucide-react";
import { InstagramIcon, LinkedinIcon, TelegramIcon, TwitterIcon } from "@/components/ui/brand-icons";
import { useDialog } from "@/hooks/useDialog";
import { usePastHero } from "@/components/ui/use-past-hero";
import { useActiveSection } from "@/hooks/useActiveSection";
import { setOverlay, toggleOverlay, useOverlay } from "@/lib/overlay-store";
import { FOOTER_LINE, SECTION_IDS, SOCIALS, type Social } from "@/content/site";
import { cn } from "@/lib/utils";

const CHANNELS: Record<Social, { icon: React.ComponentType<{ className?: string }>; label: string }> = {
  linkedin: { icon: LinkedinIcon, label: "LinkedIn" },
  telegram: { icon: TelegramIcon, label: "Telegram" },
  instagram: { icon: InstagramIcon, label: "Instagram" },
  twitter: { icon: TwitterIcon, label: "X" },
};

/** "@handle" from a profile URL, for the channel tiles. */
function handleOf(href: string) {
  const last = href.replace(/\/+$/, "").split("/").pop() ?? "";
  return last ? `@${last}` : "";
}

/**
 * Quick-contact bottom sheet: one tap from anywhere to a message or a channel.
 * A full-width sheet from the bottom edge on phones, a floating glass panel
 * on wider screens. Opened by the FAB (desktop) or the tab bar's centre
 * button (mobile). Same always-mounted / inert pattern as the side menu.
 */
export function QuickSheet() {
  const open = useOverlay() === "sheet";
  const close = () => setOverlay(null);
  const panelRef = useDialog<HTMLDivElement>(open, close);

  const toForm = () => {
    close();
    // After the scroll lock lifts, or the jump is swallowed.
    window.setTimeout(() => {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => document.querySelector<HTMLElement>("#contact input, #contact textarea")?.focus({ preventScroll: true }), 700);
    }, 30);
  };

  return createPortal(
    <div className={cn("fixed inset-0 z-[80]", !open && "pointer-events-none")} inert={!open} aria-hidden={!open}>
      <div
        onClick={close}
        className={cn(
          "absolute inset-0 bg-black/50 backdrop-blur-[3px] transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-sheet-title"
        className={cn(
          "glass-strong absolute inset-x-0 bottom-0 rounded-t-[28px] px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]",
          "md:inset-x-auto md:right-6 md:bottom-6 md:w-[420px] md:rounded-[28px] md:px-6 md:pt-5",
          "transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "translate-y-0 opacity-100" : "translate-y-[105%] opacity-0 md:translate-y-8",
        )}
      >
        <div aria-hidden className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-white/20 md:hidden" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p id="quick-sheet-title" className="text-xl font-semibold tracking-tight">
              Let&rsquo;s talk
            </p>
            <p className="mt-1 max-w-[30ch] text-sm leading-relaxed text-foreground/60">{FOOTER_LINE}</p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-foreground/80 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-violet"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={toForm}
          className="mt-5 flex min-h-13 w-full items-center gap-3 rounded-2xl bg-primary px-5 py-3.5 text-left font-medium text-white shadow-[0_12px_34px_-12px_rgba(102,51,238,0.9)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
        >
          <Send className="h-5 w-5" />
          <span className="flex-1">Write me a message</span>
          <ArrowUpRight className="h-4 w-4 opacity-80" />
        </button>

        <ul className="mt-3 grid grid-cols-2 gap-2.5">
          {SOCIALS.map(({ network, href }) => {
            const { icon: Icon, label } = CHANNELS[network];
            return (
              <li key={network}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="glass flex min-h-14 items-center gap-3 rounded-2xl px-3.5 py-3 transition-[transform,border-color] hover:-translate-y-0.5 hover:border-violet/40 focus-visible:outline-2 focus-visible:outline-violet"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/8 text-foreground/85">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{label}</span>
                    <span className="block truncate text-xs text-foreground/50">{handleOf(href)}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>,
    document.body,
  );
}

/**
 * Floating action button, desktop only (on phones the tab bar carries it).
 * Stays out of the hero, as the reference keeps its hero clean, and steps
 * aside on the contact section, where the form is already in front of you.
 */
export function Fab() {
  const pastHero = usePastHero(72);
  const active = useActiveSection(SECTION_IDS);
  const overlay = useOverlay();
  const shown = pastHero && active !== "contact" && overlay === null;

  return (
    <button
      type="button"
      onClick={() => toggleOverlay("sheet")}
      aria-label="Let's talk"
      tabIndex={shown ? 0 : -1}
      className={cn(
        "glass-strong group fixed right-6 bottom-6 z-[60] hidden h-14 items-center gap-0 overflow-hidden rounded-full p-1.5 pe-1.5 md:flex",
        "transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet",
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
      )}
    >
      <span className="max-w-0 overflow-hidden ps-0 text-sm font-medium whitespace-nowrap text-foreground/90 transition-[max-width,padding] duration-300 group-hover:max-w-28 group-hover:ps-4 group-focus-visible:max-w-28 group-focus-visible:ps-4">
        Let&rsquo;s talk
      </span>
      <span className="ms-0 grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#8b6bff] to-primary text-white shadow-[0_8px_24px_-8px_rgba(102,51,238,0.9)] transition-[margin] duration-300 group-hover:ms-3 group-focus-visible:ms-3">
        <MessageSquareText className="h-5 w-5" />
      </span>
    </button>
  );
}
