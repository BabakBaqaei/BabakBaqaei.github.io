import { useSyncExternalStore } from "react";

/**
 * Which floating panel is open: the side menu, the quick-contact sheet, or
 * neither. One value, so opening one closes the other, and the header, tab
 * bar and FAB can all toggle the same panels without prop-drilling.
 */
export type Overlay = "menu" | "sheet" | null;

let current: Overlay = null;
const listeners = new Set<() => void>();

export function setOverlay(next: Overlay) {
  if (next === current) return;
  current = next;
  // The page behind a modal panel must not scroll.
  document.documentElement.style.overflow = next ? "hidden" : "";
  listeners.forEach((l) => l());
}

export function toggleOverlay(which: Exclude<Overlay, null>) {
  setOverlay(current === which ? null : which);
}

export function useOverlay(): Overlay {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => null,
  );
}
