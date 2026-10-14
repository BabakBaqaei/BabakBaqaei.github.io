import { Section } from "@/components/ui/section";
import HowItWorks, { type CardTheme, type Step } from "@/components/ui/how-it-works";
import { ROLES } from "@/content/resume";
import { useScrollPresence } from "@/hooks/useScrollPresence";
import { cn } from "@/lib/utils";

/** Which strand of the career a role belongs to, by where it was. */
function themeFor(place: string, meta?: string): CardTheme {
  if (/hotel/i.test(place)) return "violet";
  if (/crypto|market|trad/i.test(`${place} ${meta ?? ""}`)) return "amber";
  return "teal";
}

/**
 * The career as pinned cards on a flowing path (left) beside the standing
 * portrait (right).
 *
 * `ROLES` is stored oldest first, so the path climbs the career in order; the
 * Borj-e Saat post sits inside the Mizban span, as it does on the CV.
 *
 * Footprint matches the rail it replaced (~1020px of section at 1440 wide):
 * the board is 640x604 and the portrait is capped to the same height.
 *
 * The portrait is a cut-out (rembg, edge colours decontaminated from the white
 * studio wall) standing in a soft violet light, so the black suit keeps its
 * silhouette against the near-black page. It drifts in and out with the scroll
 * the same way the cards do.
 */
export function Experience() {
  const steps: Step[] = ROLES.map((role) => ({
    title: role.title,
    eyebrow: role.period,
    description: role.meta ? `${role.place} · ${role.meta}` : role.place,
    colorTheme: themeFor(role.place, role.meta),
  }));

  const [photoRef, photoIn] = useScrollPresence<HTMLDivElement>(0.92, 0.05);

  return (
    <Section id="experience" label="Experience">
      <div className="grid items-center gap-12 lg:grid-cols-[640px_1fr] lg:gap-10">
        <HowItWorks features={steps} />

        <div
          ref={photoRef}
          className={cn(
            "relative mx-auto h-[min(604px,80vh)] w-full max-w-[340px] transition-[opacity,transform,filter] duration-700 ease-out max-lg:order-first max-lg:h-[440px]",
            photoIn ? "translate-y-0 opacity-100 blur-0" : "translate-y-8 opacity-0 blur-sm",
          )}
        >
          {/* Light behind the figure: a violet bloom and a floor glow. */}
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
            className="relative z-10 mx-auto h-full w-auto object-contain drop-shadow-[0_0_1px_rgba(169,139,255,0.5)] select-none"
          />
        </div>
      </div>
    </Section>
  );
}
