/**
 * Shared vanilla focus-trap utility.
 *
 * Creates a focus trap that keeps keyboard focus inside a container element
 * while active. No external dependencies.
 *
 * Usage:
 *   import { createFocusTrap } from '../scripts/focus-trap';
 *   const trap = createFocusTrap(containerEl);
 *   trap.activate();   // on open
 *   trap.deactivate(); // on close
 *
 * Does NOT bind Escape — that stays in each component's own handler.
 */

export interface FocusTrap {
  /**
   * Activate the trap:
   *  - captures document.activeElement as the restore target,
   *  - moves focus to the first focusable element inside `container`
   *    (or `container` itself if it has none),
   *  - installs a keydown listener that wraps Tab / Shift+Tab.
   * Idempotent: calling activate() while already active is a no-op.
   */
  activate(): void;

  /**
   * Deactivate the trap:
   *  - removes the keydown listener,
   *  - restores focus to the element captured at activate() time
   *    (unless restoreFocus: false).
   * Idempotent: calling deactivate() while already inactive is a no-op.
   */
  deactivate(): void;

  /** Whether the trap is currently active. */
  readonly active: boolean;
}

export interface FocusTrapOptions {
  /** Restore focus to the trigger on deactivate. Default: true. */
  restoreFocus?: boolean;
  /**
   * Element to focus first on activate. Default: first focusable descendant.
   * Accepts an element or an element resolver function.
   */
  initialFocus?: HTMLElement | (() => HTMLElement | null);
}

/** Selector matching all natively focusable elements. */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Returns the live list of visible focusable elements inside `container`.
 * Visibility is determined by checking that offsetParent is not null OR
 * that the element has non-zero client rects (handles fixed-position elements).
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => {
    // offsetParent is null for display:none ancestors
    if (el.offsetParent !== null) return true;
    // Fixed-position elements (e.g. a fixed close button) have offsetParent null
    // but do have client rects
    const rects = el.getClientRects();
    return rects.length > 0;
  });
}

/**
 * Creates a focus trap for the given container element.
 *
 * @param container - The element to trap focus within.
 * @param options   - Optional configuration.
 */
export function createFocusTrap(container: HTMLElement, options: FocusTrapOptions = {}): FocusTrap {
  const { restoreFocus = true } = options;

  let _active = false;
  let _triggerEl: HTMLElement | null = null;
  let _addedTabindex = false;

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key !== 'Tab') return;

    const focusable = getFocusableElements(container);

    if (focusable.length === 0) {
      // No focusable children — keep focus on the container itself
      e.preventDefault();
      container.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (e.shiftKey) {
      // Shift+Tab: if on first element (or outside container), wrap to last
      if (active === first || !container.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // Tab: if on last element (or outside container), wrap to first
      if (active === last || !container.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  const trap: FocusTrap = {
    get active() {
      return _active;
    },

    activate() {
      if (_active) return; // idempotent
      _active = true;

      // Capture the currently focused element so we can restore it on deactivate
      _triggerEl = document.activeElement as HTMLElement | null;

      // Ensure the container itself is focusable as a fallback for empty containers
      const focusable = getFocusableElements(container);
      if (focusable.length === 0) {
        if (!container.hasAttribute('tabindex')) {
          container.setAttribute('tabindex', '-1');
          _addedTabindex = true;
        }
        container.focus();
      } else {
        // Resolve initial focus target
        let initialEl: HTMLElement | null = null;
        if (options.initialFocus) {
          if (typeof options.initialFocus === 'function') {
            initialEl = options.initialFocus();
          } else {
            initialEl = options.initialFocus;
          }
        }
        (initialEl ?? focusable[0]).focus();
      }

      document.addEventListener('keydown', handleKeydown);
    },

    deactivate() {
      if (!_active) return; // idempotent
      _active = false;

      document.removeEventListener('keydown', handleKeydown);

      // Remove the tabindex we added (but only if we added it)
      if (_addedTabindex) {
        container.removeAttribute('tabindex');
        _addedTabindex = false;
      }

      // Restore focus to the element that was active when we activated
      if (restoreFocus && _triggerEl) {
        _triggerEl.focus();
      }
      _triggerEl = null;
    },
  };

  return trap;
}
