import { ShineBorder } from "@/components/ui/shine-border";

/**
 * The shining frame around the page.
 *
 * Fixed to the viewport rather than wrapping the document: the page scrolls,
 * and a border drawn around the whole document would run off screen instead of
 * framing what is being looked at.
 */
export function PageFrame() {
  return (
    <div className="pointer-events-none fixed inset-2 z-60 md:inset-3">
      {/* A faint constant rule under the shine. On its own the ShineBorder is
          only visible where the travelling highlight currently is, which reads
          as a flicker rather than a frame. */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-2xl ring-1 ring-white/15"
      />
      <ShineBorder
        borderRadius={16}
        borderWidth={1}
        duration={14}
        color={["#6633ee", "#a98bff", "#ffffff"]}
        className="relative h-full w-full min-w-0 rounded-2xl bg-transparent p-0 dark:bg-transparent"
      >
        <span className="sr-only">Page frame</span>
      </ShineBorder>
    </div>
  );
}
