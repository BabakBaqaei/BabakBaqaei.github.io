import { Container, SectionHead } from "@/components/ui/section";
import HowItWorks, { type Step } from "@/components/ui/how-it-works";
import { ROLES } from "@/content/resume";
import { useScrollPresence } from "@/hooks/useScrollPresence";
import { cn } from "@/lib/utils";

/** Which strand of the career a role belongs to, mapped to the board's colours. */
function themeFor(place: string, meta?: string): Step["colorTheme"] {
  if (/hotel/i.test(place)) return "purple";
  if (/crypto|market|trad/i.test(`${place} ${meta ?? ""}`)) return "orange";
  return "blue";
}

/**
 * The career on Babak's how-it-works board (left) beside the standing portrait
 * (right). The board is the component exactly as supplied - its own 1000 x
 * 1130 layout, positions, tilts and dashed connecting path - so this section
 * is taller than the rail it replaced, which he accepted ("use more space if
 * you need it"). It sits inside `.dark` so the component's own dark variant is
 * the one shown on this dark-only site.
 *
 * `ROLES` is oldest first, so 01 -> 05 climbs the career.
 *
 * Side by side from `xl` (the board needs ~1000px so its left and right cards
 * clear each other); below that the portrait sits above the board. The
 * portrait is sticky so it rides alongside the long board.
 */
export function Experience() {
  const steps: Step[] = ROLES.map((role) => ({
    title: role.title,
    description: [role.period, role.place, role.meta].filter(Boolean).join(" · "),
    colorTheme: themeFor(role.place, role.meta),
  }));

  const [photoRef, photoIn] = useScrollPresence<HTMLDivElement>(0.92, 0.05);

  return (
    <section id="experience" className="scroll-mt-24 py-[clamp(5rem,11vw,10rem)]">
      <Container>
        <SectionHead label="Experience" />
      </Container>

      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-5 md:px-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        <div className="dark min-w-0">
          <HowItWorks features={steps} className="rounded-[28px]" />
        </div>

        <div className="max-xl:order-first xl:sticky xl:top-28">
          <div
            ref={photoRef}
            className={cn(
              "relative mx-auto h-[440px] w-full max-w-[340px] transition-[opacity,translate,filter] duration-700 ease-out xl:h-[min(720px,calc(100svh-9rem))]",
              photoIn ? "translate-y-0 opacity-100 blur-0" : "translate-y-8 opacity-0 blur-sm",
            )}
          >
            {/* Light behind the figure: a violet bloom and a floor glow, so the
                black suit keeps its silhouette against the near-black page. */}
            <div
              aria-hidden
              className="absolute inset-x-[-20%] top-[8%] bottom-[10%] rounded-full opacity-80 blur-3xl"
              style={{
                background:
                  "radial-gradient(closest-side, rgb(102 51 238 / 0.45), rgb(169 139 255 / 0.12) 60%, transparent)",
              }}
            />
            <div
              aria-hidden
              className="absolute inset-x-[10%] bottom-[1%] h-8 rounded-[50%] bg-[#a98bff]/25 blur-xl"
            />
            <img
              src="/images/experience-standing.webp"
              alt="Babak Baghaei in a dark suit, adjusting his watch"
              width={760}
              height={1724}
              draggable={false}
              className="relative z-10 mx-auto h-full w-auto object-contain select-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
