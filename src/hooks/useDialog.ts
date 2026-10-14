import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal-panel keyboard behaviour for the side menu and the sheet: focus moves
 * into the panel when it opens, Tab cycles inside it, Escape closes it, and
 * focus returns to whatever opened it. (ui-ux-pro-max: keyboard navigation,
 * no traps the user cannot leave, visible focus.)
 */
export function useDialog<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const ref = useRef<T>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const panel = ref.current;
    const opener = document.activeElement as HTMLElement | null;
    const items = () => Array.from(panel?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    // After the enter transition has started, so the focus ring lands in view.
    const t = window.setTimeout(() => items()[0]?.focus({ preventScroll: true }), 60);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const list = items();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      opener?.focus?.({ preventScroll: true });
    };
  }, [open]);

  return ref;
}
