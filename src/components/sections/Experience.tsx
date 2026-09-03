import { useEffect, useRef, useState } from "react";
import { Section } from "@/components/ui/section";
import { ROLES } from "@/content/resume";
import { cn } from "@/lib/utils";

/** Where down the viewport the leading edge of the rail sits. */
const LINE = 0.62;

/** Distance from a step's top to the centre of its marker: `top-2` + half of `h-2.5`. */
const MARK_OFFSET = 13;

/**
 * The career on one continuous rail, earliest at the top - headings only.
 *
 * The rail is a single unbroken track with a violet line growing down it as the
 * page scrolls, and each step appears exactly as that line reaches its marker.
 * Steps are not revealed on their own: they are driven by one measurement of
 * how far the line has travelled, which is what keeps them arriving strictly in
 * order, one after another, instead of a screenful at a time.
 *
 * The travelled distance only ever increases. Letting it follow the scroll back
 * up would un-draw the line and hide steps again on the way back, which reads as
 * the page breaking rather than as an effect.
 *
 * Measured with getBoundingClientRect on scroll plus a poll, never an
 * IntersectionObserver - in embedded webviews the observer can simply never
 * fire, and the whole rail would stay blank.
 *
 * The duty lists were removed deliberately: About already describes how he
 * works, and ten bullets per role turned a scannable career into a wall of
 * text. The room and headcount pills went the same way.
 *
 * `ROLES` is stored oldest first, so this maps it straight through; reversing a
 * newest-first list here would have put the Borj-e Saat post before the Mizban
 * one it overlaps, which reads as a mistake.
 */
export function Experience() {
  const listRef = useRef<HTMLOListElement>(null);
  const travelled = useRef(0);
  const [drawn, setDrawn] = useState(0);
  const [marks, setMarks] = useState<number[]>([]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const update = () => {
      const steps = Array.from(list.children).filter(
        (el): el is HTMLElement => el.tagName === "LI",
      );
      const next = steps.map((step) => step.offsetTop + MARK_OFFSET);
      setMarks((prev) =>
        prev.length === next.length && prev.every((v, i) => v === next[i])
          ? prev
          : next,
      );

      const rect = list.getBoundingClientRect();
      const reach = window.innerHeight * LINE - rect.top;
      const drawnNow = Math.max(0, Math.min(rect.height, reach));
      if (drawnNow > travelled.current) {
        travelled.current = drawnNow;
        setDrawn(drawnNow);
      }
    };

    update();
    const poll = window.setInterval(update, 200);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.clearInterval(poll);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <Section id="experience" label="Experience">
      <ol
        ref={listRef}
        className="relative ms-1 ps-8 md:ps-12"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {/* The track, always there in full, and the line drawn over it. Both sit
            on the list's own inline padding edge, which is where the markers
            are centred too. */}
        <span
          aria-hidden
          className="absolute inset-y-0 start-0 w-px bg-border"
        />
        <span
          aria-hidden
          className="absolute top-0 start-0 w-px bg-violet transition-[height] duration-300 ease-out"
          style={{ height: `${drawn}px` }}
        />

        {ROLES.map((role, i) => {
          const shown = marks[i] !== undefined && drawn >= marks[i];
          return (
            <li key={role.title + role.period} className="relative pb-11 last:pb-0">
              <span
                aria-hidden
                className={cn(
                  "absolute top-2 -start-[calc(2rem+5px)] h-2.5 w-2.5 rounded-full ring-4 ring-background transition-colors duration-300 md:-start-[calc(3rem+5px)]",
                  shown ? "bg-violet" : "bg-border",
                )}
              />

              <div
                className={cn(
                  "transition-[opacity,transform] duration-500 ease-out will-change-transform",
                  shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                )}
              >
                <p className="text-[0.72rem] font-semibold tracking-[0.22em] text-violet uppercase">
                  {role.period}
                </p>

                <h3 className="mt-3 text-[clamp(1.2rem,2.1vw,1.55rem)] leading-snug font-medium">
                  {role.title}
                </h3>

                <p className="mt-1.5 text-sm text-foreground/70">
                  {role.meta ? role.place + " - " + role.meta : role.place}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
