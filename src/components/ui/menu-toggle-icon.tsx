import { cn } from "@/lib/utils";

/**
 * Three bars that fold into a cross. Referenced by `header-1` but not shipped
 * with it, so it is written here. Animating `rotate`/`translate` rather than
 * width or position keeps it off the layout path.
 */
export function MenuToggleIcon({
  open,
  className,
  duration = 300,
}: {
  open: boolean;
  className?: string;
  duration?: number;
}) {
  const bar =
    "absolute left-1/2 h-[1.5px] w-[18px] -translate-x-1/2 rounded-full bg-current transition-transform";
  const style = { transitionDuration: `${duration}ms` };

  return (
    <span aria-hidden className={cn("relative block", className)}>
      <span
        className={cn(bar, open ? "top-1/2 rotate-45" : "top-[30%]")}
        style={style}
      />
      <span
        className={cn(
          bar,
          "top-1/2 -translate-y-1/2 transition-opacity",
          open && "opacity-0",
        )}
        style={style}
      />
      <span
        className={cn(bar, open ? "top-1/2 -rotate-45" : "top-[70%]")}
        style={style}
      />
    </span>
  );
}
