import type { SVGProps } from "react";

/**
 * lucide dropped its brand marks in v1, so the ones the footer needs are drawn
 * here to lucide's own convention (24x24, currentColor) — consistent with the
 * rest of the icons and no extra dependency.
 */
const stroked = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...stroked} {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

/** X, formerly Twitter — filled, the glyph has no stroked form. */
export function TwitterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.53 3h3.02l-6.6 7.54L21.75 21h-5.98l-4.68-6.12L5.7 21H2.68l7.06-8.07L2.25 3h6.13l4.23 5.6zm-1.06 16.2h1.67L7.6 4.71H5.81z" />
    </svg>
  );
}

/** Telegram — filled paper plane with the folded wing. */
export function TelegramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21.94 4.6 18.9 19.2c-.23 1.02-.84 1.27-1.7.79l-4.7-3.47-2.27 2.19c-.25.25-.46.46-.95.46l.34-4.8 8.73-7.9c.38-.34-.08-.53-.59-.19L6.98 13.07l-4.64-1.45c-1.01-.32-1.03-1.01.21-1.5l18.15-7c.84-.3 1.58.2 1.24 1.48z" />
    </svg>
  );
}

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...stroked} {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
