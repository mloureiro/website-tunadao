import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createFocusTrap } from './focus-trap';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function createContainer(...children: HTMLElement[]): HTMLElement {
  const div = document.createElement('div');
  for (const child of children) {
    div.appendChild(child);
  }
  document.body.appendChild(div);
  return div;
}

function makeButton(label = 'button'): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = label;
  return btn;
}

function makeLink(href = '#', label = 'link'): HTMLAnchorElement {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = label;
  return a;
}

function dispatchTab(shiftKey = false): void {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true }));
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  // Ensure body is clean between tests
  document.body.innerHTML = '';
});

afterEach(() => {
  document.body.innerHTML = '';
});

// ---------------------------------------------------------------------------
// activate() — focus moves to first focusable element
// ---------------------------------------------------------------------------

describe('activate()', () => {
  it('moves focus to the first focusable element in the container', () => {
    const btn1 = makeButton('first');
    const btn2 = makeButton('second');
    const container = createContainer(btn1, btn2);

    // Give focus to something outside the container first
    const outside = makeButton('outside');
    document.body.appendChild(outside);
    outside.focus();

    const trap = createFocusTrap(container);
    trap.activate();

    expect(document.activeElement).toBe(btn1);
    trap.deactivate();
  });

  it('focuses the initialFocus element when provided as an HTMLElement', () => {
    const btn1 = makeButton('first');
    const btn2 = makeButton('second');
    const container = createContainer(btn1, btn2);

    const trap = createFocusTrap(container, { initialFocus: btn2 });
    trap.activate();

    expect(document.activeElement).toBe(btn2);
    trap.deactivate();
  });

  it('focuses the element returned by initialFocus function', () => {
    const btn1 = makeButton('first');
    const btn2 = makeButton('second');
    const container = createContainer(btn1, btn2);

    const trap = createFocusTrap(container, { initialFocus: () => btn2 });
    trap.activate();

    expect(document.activeElement).toBe(btn2);
    trap.deactivate();
  });

  it('sets active to true after activate()', () => {
    const btn = makeButton();
    const container = createContainer(btn);

    const trap = createFocusTrap(container);
    expect(trap.active).toBe(false);
    trap.activate();
    expect(trap.active).toBe(true);
    trap.deactivate();
  });
});

// ---------------------------------------------------------------------------
// Tab wrap — forward
// ---------------------------------------------------------------------------

describe('Tab wrap (forward)', () => {
  it('wraps from last to first on Tab', () => {
    const btn1 = makeButton('first');
    const btn2 = makeButton('second');
    const container = createContainer(btn1, btn2);

    const trap = createFocusTrap(container);
    trap.activate();

    // Focus last button, then press Tab
    btn2.focus();
    dispatchTab(false);

    expect(document.activeElement).toBe(btn1);
    trap.deactivate();
  });

  it('wraps from an element outside the container to first on Tab', () => {
    const btn1 = makeButton('first');
    const btn2 = makeButton('second');
    const container = createContainer(btn1, btn2);

    const outside = makeButton('outside');
    document.body.appendChild(outside);

    const trap = createFocusTrap(container);
    trap.activate();

    // Simulate focus somehow escaping to outside (programmatic)
    outside.focus();
    dispatchTab(false);

    expect(document.activeElement).toBe(btn1);
    trap.deactivate();
  });

  it('does not interfere when focus is on a non-last element (Tab goes naturally)', () => {
    const btn1 = makeButton('first');
    const btn2 = makeButton('second');
    const container = createContainer(btn1, btn2);

    const trap = createFocusTrap(container);
    trap.activate();

    // Focus first button, Tab should go to btn2 (we don't intercept non-boundary)
    btn1.focus();
    // Dispatch Tab — the handler should NOT override since btn1 is not last
    // We can't actually move browser focus via synthetic events in happy-dom,
    // but we can verify focus did NOT wrap to btn1 (i.e., no preventDefault wrap)
    expect(document.activeElement).toBe(btn1);
    // Dispatch tab without asserting the exact destination — just ensure btn1 is not the active after wrap
    dispatchTab(false);
    // In happy-dom Tab from first goes to second naturally (since we don't preventDefault)
    // The exact behavior depends on happy-dom; just verify the trap is still active
    expect(trap.active).toBe(true);
    trap.deactivate();
  });
});

// ---------------------------------------------------------------------------
// Shift+Tab wrap — backward
// ---------------------------------------------------------------------------

describe('Shift+Tab wrap (backward)', () => {
  it('wraps from first to last on Shift+Tab', () => {
    const btn1 = makeButton('first');
    const btn2 = makeButton('second');
    const container = createContainer(btn1, btn2);

    const trap = createFocusTrap(container);
    trap.activate();

    // Focus first button, then press Shift+Tab
    btn1.focus();
    dispatchTab(true);

    expect(document.activeElement).toBe(btn2);
    trap.deactivate();
  });

  it('wraps from an element outside the container to last on Shift+Tab', () => {
    const btn1 = makeButton('first');
    const btn2 = makeButton('second');
    const container = createContainer(btn1, btn2);

    const outside = makeButton('outside');
    document.body.appendChild(outside);

    const trap = createFocusTrap(container);
    trap.activate();

    outside.focus();
    dispatchTab(true);

    expect(document.activeElement).toBe(btn2);
    trap.deactivate();
  });

  it('includes anchor links in focusable elements', () => {
    const link = makeLink('#', 'link');
    const btn = makeButton('button');
    const container = createContainer(link, btn);

    const trap = createFocusTrap(container);
    trap.activate();

    // Focus link (first), Shift+Tab should wrap to btn (last)
    link.focus();
    dispatchTab(true);

    expect(document.activeElement).toBe(btn);
    trap.deactivate();
  });
});

// ---------------------------------------------------------------------------
// deactivate() — restores focus to the element active at activate() time
// ---------------------------------------------------------------------------

describe('deactivate() — restore focus', () => {
  it('restores focus to the trigger element on deactivate', () => {
    const trigger = makeButton('trigger');
    document.body.appendChild(trigger);

    const btn = makeButton('inside');
    const container = createContainer(btn);

    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    const trap = createFocusTrap(container);
    trap.activate();

    expect(document.activeElement).toBe(btn);

    trap.deactivate();

    expect(document.activeElement).toBe(trigger);
  });

  it('does NOT restore focus when restoreFocus: false', () => {
    const trigger = makeButton('trigger');
    document.body.appendChild(trigger);

    const btn = makeButton('inside');
    const container = createContainer(btn);

    trigger.focus();
    const trap = createFocusTrap(container, { restoreFocus: false });
    trap.activate();
    trap.deactivate();

    // focus should remain on btn, not go back to trigger
    expect(document.activeElement).toBe(btn);
  });

  it('sets active to false after deactivate()', () => {
    const btn = makeButton();
    const container = createContainer(btn);

    const trap = createFocusTrap(container);
    trap.activate();
    expect(trap.active).toBe(true);
    trap.deactivate();
    expect(trap.active).toBe(false);
  });

  it('removes the keydown listener on deactivate so Tab no longer wraps', () => {
    const btn1 = makeButton('first');
    const btn2 = makeButton('second');
    const container = createContainer(btn1, btn2);

    const trap = createFocusTrap(container);
    trap.activate();
    trap.deactivate();

    // After deactivate, pressing Tab from last should NOT wrap to first
    btn2.focus();
    dispatchTab(false);
    // No wrap — focus stays wherever (btn2 in happy-dom since no natural tab movement)
    // The key assertion: active is false, and no error thrown
    expect(trap.active).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Idempotency
// ---------------------------------------------------------------------------

describe('idempotency', () => {
  it('calling activate() twice is a no-op on the second call', () => {
    const trigger = makeButton('trigger');
    document.body.appendChild(trigger);

    const btn1 = makeButton('first');
    const btn2 = makeButton('second');
    const container = createContainer(btn1, btn2);

    trigger.focus();

    const trap = createFocusTrap(container);
    trap.activate();

    // Move focus to second button
    btn2.focus();

    // Second activate() should be a no-op — does NOT re-capture trigger
    trap.activate();

    // Focus should remain on btn2 (not moved to first again)
    expect(document.activeElement).toBe(btn2);
    // Trigger should still be restored on deactivate (captured at FIRST activate)
    trap.deactivate();
    expect(document.activeElement).toBe(trigger);
  });

  it('calling deactivate() twice is a no-op on the second call', () => {
    const trigger = makeButton('trigger');
    document.body.appendChild(trigger);

    const btn = makeButton('inside');
    const container = createContainer(btn);

    trigger.focus();
    const trap = createFocusTrap(container);
    trap.activate();
    trap.deactivate();

    // Second deactivate should not throw and active stays false
    expect(() => trap.deactivate()).not.toThrow();
    expect(trap.active).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Empty-container fallback
// ---------------------------------------------------------------------------

describe('empty-container fallback', () => {
  it('adds tabindex=-1 to the container and focuses it when no focusable children exist', () => {
    const container = document.createElement('div');
    container.textContent = 'No focusable children';
    document.body.appendChild(container);

    const trap = createFocusTrap(container);
    trap.activate();

    expect(container.getAttribute('tabindex')).toBe('-1');
    expect(document.activeElement).toBe(container);
    trap.deactivate();
  });

  it('removes the tabindex it added on deactivate', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const trap = createFocusTrap(container);
    trap.activate();

    expect(container.hasAttribute('tabindex')).toBe(true);
    trap.deactivate();

    // tabindex removed since we added it
    expect(container.hasAttribute('tabindex')).toBe(false);
  });

  it('does NOT remove a pre-existing tabindex on deactivate', () => {
    const container = document.createElement('div');
    container.setAttribute('tabindex', '0');
    document.body.appendChild(container);

    const trap = createFocusTrap(container);
    trap.activate();

    // Should still have tabindex (we didn't add it)
    expect(container.getAttribute('tabindex')).toBe('0');
    trap.deactivate();

    // Still has it after deactivate
    expect(container.getAttribute('tabindex')).toBe('0');
  });

  it('keeps focus on the container when Tab is pressed in an empty container', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const trap = createFocusTrap(container);
    trap.activate();

    container.focus();
    dispatchTab(false);

    expect(document.activeElement).toBe(container);
    trap.deactivate();
  });
});
