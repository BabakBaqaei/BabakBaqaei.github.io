import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-5 md:px-8", className)}>
      {children}
    </div>
  );
}

/**
 * Section heading. No 01 / 02 / 03 numbering: About, Portfolio and Contact are
 * destinations, not a sequence, so numbers would be decoration pretending to
 * be information.
 */
export function SectionHead({ label }: { label: string }) {
  return (
    <Reveal className="mb-12 flex items-center gap-4 md:mb-16">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-violet" />
      <h2 className="text-[0.72rem] font-semibold tracking-[0.3em] text-muted-foreground uppercase">
        {label}
      </h2>
      <span aria-hidden className="h-px flex-1 bg-border" />
    </Reveal>
  );
}

export function Section({
  id,
  label,
  children,
  className,
}: {
  id: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-24 py-[clamp(5rem,11vw,10rem)]", className)}
    >
      <Container>
        <SectionHead label={label} />
        {children}
      </Container>
    </section>
  );
}
