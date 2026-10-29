import { useEffect, RefObject } from 'react';

/**
 * Hook to trigger a callback when clicking or tapping outside of a referenced element.
 * Uses capture-phase event listening to guarantee outside click detection even when
 * child canvas elements (cards, frames, pins) call stopPropagation().
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
  active: boolean = true,
  ignoreSelector?: string
): void {
  useEffect(() => {
    if (!active) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;
      const target = event.target as Element | null;
      if (!el || !target) {
        return;
      }

      // If clicked element is inside the container, don't trigger outside handler
      if (el.contains(target)) {
        return;
      }

      // If an ignore selector was provided and the target is within it, ignore
      if (ignoreSelector && target.closest(ignoreSelector)) {
        return;
      }

      handler(event);
    };

    // Use capture phase (third arg: true) so stopPropagation() on canvas cards or sections
    // cannot swallow or prevent the outside click dismissal
    document.addEventListener('mousedown', listener, true);
    document.addEventListener('touchstart', listener, true);

    return () => {
      document.removeEventListener('mousedown', listener, true);
      document.removeEventListener('touchstart', listener, true);
    };
  }, [ref, handler, active, ignoreSelector]);
}
