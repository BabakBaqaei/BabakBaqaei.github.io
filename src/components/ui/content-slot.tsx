import { cn } from "@/lib/utils";

/**
 * A reserved space for copy or an image that has not been written yet.
 *
 * Deliberately visible rather than filled with invented text: the brief was to
 * build the site and leave the words to Babak, and lorem-style filler would
 * hide how much room each block actually has.
 */
export function ContentSlot({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-dashed border-border bg-white/[0.02] px-4 py-6",
        className,
      )}
    >
      <span className="text-[0.68rem] tracking-[0.22em] text-muted-foreground/70 uppercase">
        {label}
      </span>
    </div>
  );
}
